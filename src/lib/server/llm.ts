import { ChatGroq } from "@langchain/groq";

export const FALLBACK_MODEL = "llama-3.3-70b-versatile";

export type Creds = { key: string; model: string };

/** Reads BYOK credentials from request headers (env var is an optional presenter fallback). */
export function readCreds(req: Request): Creds {
  const key = req.headers.get("x-groq-key")?.trim() || process.env.GROQ_API_KEY || "";
  const model = req.headers.get("x-groq-model")?.trim() || FALLBACK_MODEL;
  return { key, model };
}

export function makeModel(creds: Creds, temperature = 0.2) {
  return new ChatGroq({ apiKey: creds.key, model: creds.model, temperature, maxRetries: 1 });
}

export function missingKey() {
  return Response.json(
    { error: "No Groq API key. Click “Groq key” in the top bar to add yours (BYOK)." },
    { status: 401 },
  );
}

export function errorResponse(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  // Never echo request headers back; message comes from the provider/SDK only.
  if (/401|invalid api key|unauthorized/i.test(msg)) {
    return Response.json({ error: "Groq rejected this API key. Open “Groq key” in the top bar, paste a valid key and press Test." }, { status: 401 });
  }
  if (/decommission|model_not_found|does not exist|not found/i.test(msg)) {
    return Response.json({ error: "This Groq model isn't available to your key. Open “Groq key”, press Test, and pick a model from the list." }, { status: 400 });
  }
  if (/429|rate.?limit/i.test(msg)) {
    return Response.json({ error: "Groq rate limit reached — wait a few seconds and try again (or pick a smaller model)." }, { status: 429 });
  }
  return Response.json({ error: msg.slice(0, 400) }, { status: 500 });
}

export function textOf(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((c) => (typeof c === "string" ? c : (c as { text?: string }).text ?? ""))
      .join("");
  }
  return "";
}

/** Extract the first JSON object from a model reply (tolerates ```json fences and prose). */
export function parseJSON<T>(text: string): T | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.search(/[[{]/);
  if (start < 0) return null;
  const open = candidate[start];
  const close = open === "{" ? "}" : "]";
  const end = candidate.lastIndexOf(close);
  if (end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}
