import { runRedTeam } from "@/lib/agents/redteam";
import { errorResponse, missingKey, readCreds } from "@/lib/server/llm";

export async function POST(req: Request) {
  const creds = readCreds(req);
  if (!creds.key) return missingKey();
  try {
    const { level, history } = (await req.json()) as { level: number; history: { role: "user" | "assistant"; content: string }[] };
    return Response.json(await runRedTeam(creds, Math.min(4, Math.max(1, Number(level) || 1)), history));
  } catch (e) {
    return errorResponse(e);
  }
}
