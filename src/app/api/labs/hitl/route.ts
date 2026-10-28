import { runHitl, type HumanDecision } from "@/lib/agents/hitl";
import { errorResponse, readCreds } from "@/lib/server/llm";

type Body =
  | { action: "start"; threadId: string; task: string; autonomy: number; hardGuardrails: boolean }
  | { action: "resume"; threadId: string; decision: HumanDecision };

/** Works without a key (scripted planner); with a BYOK key the plan comes from the LLM. */
export async function POST(req: Request) {
  const creds = readCreds(req);
  try {
    const body = (await req.json()) as Body;
    if (!body.threadId) return Response.json({ error: "threadId required" }, { status: 400 });
    const result =
      body.action === "start"
        ? await runHitl(creds, body.threadId, { kind: "start", task: String(body.task).slice(0, 1000), autonomy: Number(body.autonomy), hardGuardrails: !!body.hardGuardrails })
        : await runHitl(creds, body.threadId, { kind: "resume", decision: body.decision });
    return Response.json(result);
  } catch (e) {
    return errorResponse(e);
  }
}
