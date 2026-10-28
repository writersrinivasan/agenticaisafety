import { buildGuardrailGraph } from "@/lib/agents/guardrails";
import { errorResponse, readCreds } from "@/lib/server/llm";

export async function POST(req: Request) {
  const creds = readCreds(req);
  try {
    const { text, direction } = (await req.json()) as { text: string; direction: "input" | "output" };
    const out = await buildGuardrailGraph(creds).invoke({ text: String(text).slice(0, 8000), direction: direction === "output" ? "output" : "input" });
    return Response.json({ findings: out.findings, judge: out.judge, decision: out.decision, sanitized: out.sanitized, trace: out.trace });
  } catch (e) {
    return errorResponse(e);
  }
}
