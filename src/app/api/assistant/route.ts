import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { buildAssistantGraph } from "@/lib/agents/assistant";
import { errorResponse, missingKey, readCreds, textOf } from "@/lib/server/llm";

type Body = { messages: { role: "user" | "assistant"; content: string }[] };

export async function POST(req: Request) {
  const creds = readCreds(req);
  if (!creds.key) return missingKey();
  try {
    const { messages } = (await req.json()) as Body;
    const history = messages.slice(-12).map((m) => (m.role === "user" ? new HumanMessage(m.content.slice(0, 6000)) : new AIMessage(m.content)));
    const out = await buildAssistantGraph(creds).invoke({ messages: history }, { recursionLimit: 20 });
    const final = [...out.messages].reverse().find((m) => m.getType() === "ai" && textOf(m.content).trim());
    return Response.json({ reply: final ? textOf(final.content) : "Sorry, I couldn't produce an answer.", trace: out.trace });
  } catch (e) {
    return errorResponse(e);
  }
}
