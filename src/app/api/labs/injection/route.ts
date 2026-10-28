import { runInjectionLab } from "@/lib/agents/injection";
import type { InjectionDefenses } from "@/lib/content/inbox";
import { errorResponse, missingKey, readCreds } from "@/lib/server/llm";

export async function POST(req: Request) {
  const creds = readCreds(req);
  if (!creds.key) return missingKey();
  try {
    const { task, defenses } = (await req.json()) as { task: string; defenses: InjectionDefenses };
    return Response.json(await runInjectionLab(creds, String(task).slice(0, 1000), defenses));
  } catch (e) {
    return errorResponse(e);
  }
}
