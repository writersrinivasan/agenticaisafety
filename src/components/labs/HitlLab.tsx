"use client";

import { useState } from "react";
import { Check, Hand, Loader2, Pencil, Play, RotateCcw, X } from "lucide-react";
import { postJSON, useByok } from "@/lib/byok";
import { AUTONOMY_POLICY, OPS_SCENARIOS, type Assessment, type Step } from "@/lib/content/ops";
import type { TraceEvent } from "@/lib/agents/trace";
import type { HumanDecision, StepResult } from "@/lib/agents/hitl";
import { Callout, TracePanel } from "@/components/ui";
import { ModeBadge, Toggle } from "./ModeBadge";

type PlanStep = Step & Assessment;
type State = {
  plan: PlanStep[];
  planner: string;
  results: StepResult[];
  trace: TraceEvent[];
  summary: string;
  pending: { stepIndex: number; step: PlanStep; autonomy: string } | null;
  done: boolean;
};

const RISK_CLS = { low: "bg-emerald-500/20 text-emerald-200", medium: "bg-amber-500/20 text-amber-100", high: "bg-rose-500/25 text-rose-100" };
const DEC_CLS: Record<StepResult["decision"], string> = {
  auto: "bg-sky-500/20 text-sky-200",
  approved: "bg-emerald-500/20 text-emerald-200",
  edited: "bg-violet-500/20 text-violet-200",
  rejected: "bg-zinc-500/30 text-zinc-200",
  blocked: "bg-rose-500/25 text-rose-100",
};

function impact(results: StepResult[]) {
  const ran = results.filter((r) => ["auto", "approved", "edited"].includes(r.decision));
  const n = (v: unknown) => Number(v ?? 0) || 0;
  return [
    { label: "Rows deleted", value: ran.filter((r) => r.tool === "delete_records").reduce((s, r) => s + n(r.args.count), 0).toLocaleString() },
    { label: "Refunded", value: "$" + ran.filter((r) => r.tool === "refund_payment").reduce((s, r) => s + n(r.args.customers) * n(r.args.amount_each), 0).toLocaleString() },
    { label: "Emails sent", value: ran.filter((r) => r.tool === "send_email").reduce((s, r) => s + (n(r.args.recipients) || 1), 0).toLocaleString() },
    { label: "Prod deploys", value: String(ran.filter((r) => r.tool === "deploy_service" && r.args.env === "prod").length) },
    { label: "Permission changes", value: String(ran.filter((r) => r.tool === "modify_iam").length) },
  ];
}

export function HitlLab() {
  const { key, model, hasKey } = useByok();
  const [task, setTask] = useState(OPS_SCENARIOS[0].task);
  const [autonomy, setAutonomy] = useState(3);
  const [hard, setHard] = useState(false);
  const [threadId, setThreadId] = useState("");
  const [st, setSt] = useState<State | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState<string | null>(null);

  async function call(body: object) {
    setBusy(true);
    setErr("");
    try {
      setSt(await postJSON<State>("/api/labs/hitl", body, { key, model }));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  function start() {
    const id = crypto.randomUUID();
    setThreadId(id);
    setEditing(null);
    call({ action: "start", threadId: id, task, autonomy, hardGuardrails: hard });
  }

  function decide(decision: HumanDecision) {
    setEditing(null);
    call({ action: "resume", threadId, decision });
  }

  function submitEdit() {
    try {
      decide({ action: "edit", args: JSON.parse(editing ?? "{}") });
    } catch {
      setErr("Edited args must be valid JSON.");
    }
  }

  const isScripted = OPS_SCENARIOS.some((s) => s.task === task);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-5 lg:col-span-2">
        <div className="card p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold">1 · Task for the ops agent</h3>
            <ModeBadge live={hasKey} liveLabel="LLM planner on Groq" offLabel="Scripted planner (no key)" />
          </div>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {OPS_SCENARIOS.map((s) => (
              <button key={s.title} onClick={() => setTask(s.task)} className={`rounded-full px-2.5 py-1 text-xs ${task === s.task ? "bg-emerald-500/25 text-emerald-100" : "bg-surface-2 text-muted"}`}>
                {s.title}
              </button>
            ))}
          </div>
          <textarea className="input min-h-20 text-sm" value={task} onChange={(e) => setTask(e.target.value)} />
          {!hasKey && !isScripted && <p className="mt-1 text-xs text-amber-200">Custom tasks need a Groq key; offline mode will use the first scripted plan.</p>}
        </div>

        <div className="card p-5">
          <h3 className="mb-3 font-bold">2 · Set the autonomy dial</h3>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((l) => (
              <button
                key={l}
                onClick={() => setAutonomy(l)}
                className={`rounded-xl border p-3 text-left transition ${autonomy === l ? "border-emerald-400/60 bg-emerald-500/10" : "border-line hover:border-emerald-400/30"}`}
              >
                <div className="text-sm font-bold">{AUTONOMY_POLICY[l].name}</div>
                <div className="text-xs text-muted">{AUTONOMY_POLICY[l].desc}</div>
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-3">
            <Toggle on={hard} onChange={setHard} label="Hard guardrails" />
            <div>
              <div className="text-sm font-semibold">Hard guardrails (non-negotiable)</div>
              <div className="text-xs text-muted">Deny rules that apply at every autonomy level — even if a human clicks approve.</div>
            </div>
          </div>
          <button className="btn btn-primary mt-5 w-full justify-center" onClick={start} disabled={busy}>
            {busy && !st?.pending ? <Loader2 className="h-4 w-4 animate-spin" /> : st ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4" />} {st ? "Run again" : "3 · Run agent"}
          </button>
          {err && <div className="mt-3 rounded-lg bg-rose-500/15 p-3 text-sm text-rose-200">{err}</div>}
        </div>

        <Callout hue="violet" title="Under the hood (LangGraph)">
          <code className="text-xs">planner → gate ⇄ execute → report</code>. In <code>gate</code>, risky steps call <code>interrupt()</code>. The graph state is
          saved by a <code>MemorySaver</code> checkpointer under your <code>thread_id</code>; your button click resumes it with{" "}
          <code>{"new Command({ resume: decision })"}</code>.
        </Callout>
      </div>

      <div className="space-y-5 lg:col-span-3">
        {!st && (
          <div className="card flex h-full min-h-60 flex-col items-center justify-center p-8 text-center text-muted">
            <Hand className="mb-3 h-10 w-10 text-emerald-300" />
            Pick a task and autonomy level, then run the agent. Try the same task at L1, L3 and L4.
          </div>
        )}

        {st && (
          <>
            <div className="card p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-bold">Agent plan</h3>
                <span className="text-xs text-muted">{st.planner}</span>
              </div>
              <ol className="space-y-2">
                {st.plan.map((p, i) => {
                  const r = st.results.find((x) => x.stepId === p.id);
                  const isPending = st.pending?.stepIndex === i;
                  return (
                    <li key={p.id} className={`rounded-xl border p-3 ${isPending ? "border-amber-400/70 bg-amber-500/10" : "border-line"}`}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-muted">#{p.id}</span>
                        <code className="font-semibold text-violet-200">{p.tool}</code>
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${RISK_CLS[p.risk]}`}>{p.risk}</span>
                        {r && <span className={`ml-auto rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${DEC_CLS[r.decision]}`}>{r.decision}</span>}
                        {isPending && <span className="pulse-dot ml-auto text-xs font-bold text-amber-300">⏸ awaiting you</span>}
                      </div>
                      <div className="mt-1 break-all font-mono text-xs text-muted">{JSON.stringify(r?.args ?? p.args)}</div>
                      <div className="mt-1 text-xs">
                        <span className="text-muted">why:</span> {p.why} · <span className="text-muted">{p.reasons.join("; ")}</span>
                      </div>
                      {r && <div className={`mt-1 text-xs ${r.decision === "blocked" ? "text-rose-300" : "text-emerald-200"}`}>→ {r.output}</div>}
                    </li>
                  );
                })}
              </ol>
            </div>

            {st.pending && (
              <div className="card glow-border p-5">
                <div className="mb-2 flex items-center gap-2 font-bold text-amber-200">
                  <Hand className="h-5 w-5" /> Approval required · {st.pending.autonomy}
                </div>
                <p className="text-sm">
                  The agent wants to run <code className="text-violet-200">{st.pending.step.tool}</code> — risk{" "}
                  <span className={`rounded px-1.5 text-xs font-bold uppercase ${RISK_CLS[st.pending.step.risk]}`}>{st.pending.step.risk}</span>
                  {!st.pending.step.reversible && <span className="ml-1 text-rose-300">· irreversible</span>}
                </p>
                <ul className="mt-2 list-disc pl-5 text-xs text-muted">
                  {st.pending.step.reasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
                {editing !== null ? (
                  <div className="mt-3">
                    <textarea className="input min-h-24 font-mono text-xs" value={editing} onChange={(e) => setEditing(e.target.value)} />
                    <div className="mt-2 flex gap-2">
                      <button className="btn btn-primary" onClick={submitEdit} disabled={busy}>
                        <Check className="h-4 w-4" /> Approve edited
                      </button>
                      <button className="btn btn-ghost" onClick={() => setEditing(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button className="btn bg-emerald-500 text-black" onClick={() => decide({ action: "approve" })} disabled={busy}>
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Approve
                    </button>
                    <button className="btn btn-ghost" onClick={() => setEditing(JSON.stringify(st.pending!.step.args, null, 2))} disabled={busy}>
                      <Pencil className="h-4 w-4" /> Edit args
                    </button>
                    <button className="btn bg-rose-500/80 text-white" onClick={() => decide({ action: "reject" })} disabled={busy}>
                      <X className="h-4 w-4" /> Reject
                    </button>
                  </div>
                )}
              </div>
            )}

            {st.done && (
              <div className="card p-5">
                <h3 className="mb-3 font-bold">Real-world impact of this run</h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {impact(st.results).map((m) => (
                    <div key={m.label} className="rounded-xl bg-surface-2 p-3 text-center">
                      <div className="text-lg font-black text-gradient">{m.value}</div>
                      <div className="text-[11px] text-muted">{m.label}</div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-sm">{st.summary}</p>
              </div>
            )}

            <TracePanel trace={st.trace} />
          </>
        )}

        <Callout hue="emerald" title="Discussion prompts">
          <ul className="list-disc space-y-1 pl-4">
            <li>At L1, how many approvals did you click before you stopped reading them? That&apos;s approval fatigue.</li>
            <li>At L4, which irreversible actions happened with nobody watching?</li>
            <li>Turn on hard guardrails at L4. Which risks are now bounded regardless of autonomy?</li>
            <li>Try “Edit args” to reduce a blast radius (e.g. delete 50 rows in staging first) instead of a binary yes/no.</li>
          </ul>
        </Callout>
      </div>
    </div>
  );
}
