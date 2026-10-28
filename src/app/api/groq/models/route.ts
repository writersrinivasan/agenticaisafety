import { readCreds, missingKey } from "@/lib/server/llm";

/** Validates a BYOK key by listing the models it can access. The key is not stored. */
export async function POST(req: Request) {
  const { key } = readCreds(req);
  if (!key) return missingKey();
  const res = await fetch("https://api.groq.com/openai/v1/models", { headers: { authorization: `Bearer ${key}` }, cache: "no-store" });
  if (!res.ok) {
    return Response.json({ error: res.status === 401 ? "Groq rejected this key (401)." : `Groq returned ${res.status}` }, { status: res.status });
  }
  const data = (await res.json()) as { data: { id: string; active?: boolean }[] };
  const models = data.data
    .filter((m) => m.active !== false && !/whisper|tts|guard|playai|orpheus|distil/i.test(m.id))
    .map((m) => m.id)
    .sort();
  return Response.json({ models });
}
