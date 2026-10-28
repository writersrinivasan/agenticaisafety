import { Annotation, Command, END, MemorySaver, START, StateGraph, interrupt } from "@langchain/langgraph";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { makeModel, parseJSON, textOf, type Creds } from "@/lib/server/llm";
import { AUTONOMY_POLICY, OPS_SCENARIOS, OPS_TOOLS, assess, hardGuardrail, simulate, type Assessment, type Step } from "@/lib/content/ops";
import { TraceChannel, ev } from "./trace";

export type StepResult = {
  stepId: number;
  tool: string;
  args: Record<string, unknown>;
  risk: Assessment["risk"];
  decision: "auto" | "approved" | "edited" | "rejected" | "blocked";
  output: string;
};

export type HumanDecision = { action: "approve" | "reject" | "edit"; args?: Record<string, unknown>; note?: string };

const State = Annotation.Root({
  task: Annotation<string>(),
  autonomy: Annotation<number>(),
  hardGuardrails: Annotation<boolean>(),
  plan: Annotation<(Step & Assessment)[]>({ reducer: (_, b) => b, default: () => [] }),
  plannerSource: Annotation<string>({ reducer: (_, b) => b, default: () => "" }),
  cursor: Annotation<number>({ reducer: (_, b) => b, default: () => 0 }),
  pending: Annotation<{ decision: StepResult["decision"]; args: Record<string, unknown>; note?: string } | null>({
    reducer: (_, b) => b,
    default: () => null,
  }),
  results: Annotation<StepResult[]>({ reducer: (a, b) => a.concat(b), default: () => [] }),
  trace: TraceChannel,
  summary: Annotation<string>({ reducer: (_, b) => b, default: () => "" }),
});
type S = typeof State.State;

// One checkpointer per server process so interrupted runs can be resumed by thread_id.
const g = globalThis as unknown as { __hitlSaver?: MemorySaver };
const saver = (g.__hitlSaver ??= new MemorySaver());

async function llmPlan(creds: Creds, task: string): Promise<Omit<Step, "id">[] | null> {
  const model = makeModel(creds, 0.2);
  const catalogue = OPS_TOOLS.map((t) => `- ${t.name} ${t.args}: ${t.desc}`).join("\n");
  const res = await model.invoke([
    new SystemMessage(
      `You are an autonomous operations agent at Acme (domain acme.com). Plan how to accomplish the task using ONLY these tools:\n${catalogue}\n\n` +
        `Rules: 3-6 steps. Use realistic numbers (e.g. counts of rows/customers). env is "prod" or "staging". recipients is a number.\n` +
        `Reply ONLY with JSON: {"steps":[{"tool":"...","args":{...},"why":"..."}]}`,
    ),
    new HumanMessage(task),
  ]);
  const parsed = parseJSON<{ steps: Omit<Step, "id">[] }>(textOf(res.content));
  const steps = parsed?.steps?.filter((s) => s && typeof s.tool === "string" && s.args && typeof s.args === "object");
  return steps && steps.length ? steps.slice(0, 6) : null;
}

export function buildHitlGraph(creds: Creds) {
  async function planner(state: S): Promise<Partial<S>> {
    let steps: Omit<Step, "id">[] | null = null;
    let source = "";
    const scripted = OPS_SCENARIOS.find((s) => s.task === state.task);
    if (creds.key) {
      try {
        steps = await llmPlan(creds, state.task);
        source = `LLM planner (${creds.model})`;
      } catch (e) {
        source = `LLM failed (${e instanceof Error ? e.message.slice(0, 80) : "error"}) → scripted plan`;
      }
    }
    if (!steps) {
      steps = (scripted ?? OPS_SCENARIOS[0]).plan;
      source ||= "Scripted plan (no Groq key)";
    }
    const plan = steps.map((s, i) => ({ ...s, id: i + 1, ...assess({ ...s, id: i + 1 }) }));
    return {
      plan,
      plannerSource: source,
      trace: [ev("planner", "ok", `Planned ${plan.length} steps`, source)],
    };
  }

  async function gate(state: S): Promise<Partial<S>> {
    const step = state.plan[state.cursor];
    if (state.hardGuardrails) {
      const violation = hardGuardrail(step);
      if (violation) {
        return { pending: { decision: "blocked", args: step.args, note: violation }, trace: [ev("hard_guardrail", "block", `Step ${step.id} ${step.tool} blocked`, violation)] };
      }
    }
    const policy = AUTONOMY_POLICY[state.autonomy] ?? AUTONOMY_POLICY[2];
    if (!policy.approve.includes(step.risk)) {
      return { pending: { decision: "auto", args: step.args }, trace: [ev("gate", step.risk === "high" ? "warn" : "ok", `Step ${step.id} ${step.tool} auto-executed (${step.risk} risk @ ${policy.name})`)] };
    }
    // Pause the graph. The checkpointer persists state; the UI resumes with Command({ resume }).
    const human = interrupt({ stepIndex: state.cursor, step, autonomy: policy.name }) as HumanDecision;
    if (human.action === "reject") {
      return { pending: { decision: "rejected", args: step.args, note: human.note }, trace: [ev("human", "block", `You rejected step ${step.id} ${step.tool}`)] };
    }
    if (human.action === "edit" && human.args) {
      return { pending: { decision: "edited", args: human.args, note: human.note }, trace: [ev("human", "ok", `You edited & approved step ${step.id}`, JSON.stringify(human.args))] };
    }
    return { pending: { decision: "approved", args: step.args }, trace: [ev("human", "ok", `You approved step ${step.id} ${step.tool}`)] };
  }

  async function execute(state: S): Promise<Partial<S>> {
    const step = state.plan[state.cursor];
    const p = state.pending!;
    const ran = p.decision === "auto" || p.decision === "approved" || p.decision === "edited";
    const output = ran ? simulate({ ...step, args: p.args }) : p.decision === "blocked" ? `Blocked: ${p.note}` : "Skipped by human.";
    return {
      results: [{ stepId: step.id, tool: step.tool, args: p.args, risk: step.risk, decision: p.decision, output }],
      cursor: state.cursor + 1,
      pending: null,
      trace: ran ? [ev("executor", step.reversible ? "info" : "warn", output)] : [],
    };
  }

  async function report(state: S): Promise<Partial<S>> {
    const count = (d: StepResult["decision"]) => state.results.filter((r) => r.decision === d).length;
    const irreversibleAuto = state.results.filter((r) => r.decision === "auto" && r.risk === "high");
    const summary =
      `${state.results.length} steps: ${count("auto")} auto, ${count("approved") + count("edited")} human-approved, ${count("rejected")} rejected, ${count("blocked")} blocked by hard guardrails.` +
      (irreversibleAuto.length ? ` ⚠️ ${irreversibleAuto.length} HIGH-risk step(s) ran with no human involved.` : "");
    return { summary, trace: [ev("report", irreversibleAuto.length ? "warn" : "ok", "Run complete", summary)] };
  }

  return new StateGraph(State)
    .addNode("planner", planner)
    .addNode("gate", gate)
    .addNode("execute", execute)
    .addNode("report", report)
    .addEdge(START, "planner")
    .addConditionalEdges("planner", (s) => (s.plan.length ? "gate" : "report"), ["gate", "report"])
    .addEdge("gate", "execute")
    .addConditionalEdges("execute", (s) => (s.cursor < s.plan.length ? "gate" : "report"), ["gate", "report"])
    .addEdge("report", END)
    .compile({ checkpointer: saver });
}

export async function runHitl(
  creds: Creds,
  threadId: string,
  input: { kind: "start"; task: string; autonomy: number; hardGuardrails: boolean } | { kind: "resume"; decision: HumanDecision },
) {
  const graph = buildHitlGraph(creds);
  const config = { configurable: { thread_id: threadId }, recursionLimit: 60 };
  if (input.kind === "start") {
    await graph.invoke({ task: input.task, autonomy: input.autonomy, hardGuardrails: input.hardGuardrails }, config);
  } else {
    await graph.invoke(new Command({ resume: input.decision }), config);
  }
  const snap = await graph.getState(config);
  const interrupts = snap.tasks.flatMap((t) => t.interrupts ?? []);
  const v = snap.values as S;
  return {
    plan: v.plan ?? [],
    planner: v.plannerSource ?? "",
    results: v.results ?? [],
    trace: v.trace ?? [],
    summary: v.summary ?? "",
    pending: interrupts.length ? (interrupts[0].value as { stepIndex: number; step: Step & Assessment; autonomy: string }) : null,
    done: snap.next.length === 0,
  };
}
