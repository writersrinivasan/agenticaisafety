/** Deterministic guard detectors, shared by the browser labs and the LangGraph guard nodes. */

export type Finding = { guard: string; label: string; match: string; severity: "high" | "medium" | "low" };

const INJECTION_PATTERNS: { re: RegExp; label: string }[] = [
  { re: /ignore (all |any )?(previous|prior|above|earlier) (instructions|rules|prompts?)/i, label: "Override attempt: 'ignore previous instructions'" },
  { re: /disregard (your|the|all) (rules|instructions|guidelines|system prompt)/i, label: "Override attempt: 'disregard rules'" },
  { re: /you are now [a-z0-9 _-]{2,30}/i, label: "Role reassignment" },
  { re: /\b(dan|dev ?mode|developer mode|jailbreak)\b/i, label: "Known jailbreak persona" },
  { re: /(reveal|print|show|repeat|leak)( me)? (your|the) (system prompt|instructions|hidden|secret)/i, label: "System prompt / secret extraction" },
  { re: /(ai|assistant|agent|llm)s? (instructions?|note|directive)\s*:/i, label: "Instructions addressed to an AI inside data" },
  { re: /do not (mention|tell|reveal|inform)( this| the user| anyone)/i, label: "Concealment instruction" },
  { re: /(forward|send|email|post|upload) (the |all |this )?.{0,40}(to|at) [\w.+-]+@[\w-]+\.[\w.]+/i, label: "Exfiltration instruction (send data to address)" },
  { re: /<!--[\s\S]*?-->/, label: "Hidden HTML comment" },
  { re: /[​-‏⁠﻿]/, label: "Invisible zero-width characters" },
  { re: /(base64|rot13|hex)[- ]?(decode|encoded)/i, label: "Encoded payload hint" },
  { re: /(this is|i am) (authorized|authorised|approved) by (it|security|admin|the ceo|management)/i, label: "False authority claim" },
];

const PII_PATTERNS: { re: RegExp; label: string }[] = [
  { re: /[\w.+-]+@[\w-]+\.[\w.-]+/g, label: "Email address" },
  { re: /\b(?:\+?\d{1,3}[ -]?)?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}\b/g, label: "Phone number" },
  { re: /\b\d{3}-\d{2}-\d{4}\b/g, label: "US SSN" },
  { re: /\b(?:\d[ -]?){13,16}\b/g, label: "Card-like number" },
  { re: /\b[A-Z]{5}\d{4}[A-Z]\b/g, label: "Indian PAN" },
  { re: /\b\d{4} ?\d{4} ?\d{4}\b/g, label: "Aadhaar-like number" },
  { re: /\bIBAN[: ]?[A-Z]{2}\d{2}[A-Z0-9]{10,30}\b/gi, label: "IBAN" },
];

const SECRET_PATTERNS: { re: RegExp; label: string }[] = [
  { re: /\bgsk_[A-Za-z0-9]{20,}\b/g, label: "Groq API key" },
  { re: /\bsk-(?:proj-|ant-)?[A-Za-z0-9_-]{20,}\b/g, label: "OpenAI/Anthropic-style key" },
  { re: /\bAKIA[0-9A-Z]{16}\b/g, label: "AWS access key" },
  { re: /\bghp_[A-Za-z0-9]{30,}\b/g, label: "GitHub token" },
  { re: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g, label: "Private key" },
  { re: /\b(password|passwd|pwd|secret|api[_-]?key)\s*[:=]\s*\S{4,}/gi, label: "Inline credential" },
];

function scan(text: string, patterns: { re: RegExp; label: string }[], guard: string, severity: Finding["severity"]): Finding[] {
  const out: Finding[] = [];
  for (const { re, label } of patterns) {
    const flags = re.flags.includes("g") ? re.flags : re.flags + "g";
    for (const m of text.matchAll(new RegExp(re.source, flags))) {
      out.push({ guard, label, match: m[0].slice(0, 80), severity });
      if (out.length > 20) return out;
    }
  }
  return out;
}

export const detectInjection = (t: string) => scan(t, INJECTION_PATTERNS, "injection", "high");
export const detectPII = (t: string) => scan(t, PII_PATTERNS, "pii", "medium");
export const detectSecrets = (t: string) => scan(t, SECRET_PATTERNS, "secrets", "high");

export function redact(text: string, findings: Finding[]) {
  let out = text;
  for (const f of findings) out = out.split(f.match).join(`[REDACTED:${f.label}]`);
  return out;
}

/** Spotlighting: delimit untrusted data and "datamark" it so the model can tell data from instructions. */
export function spotlight(source: string, text: string) {
  const marked = text.replace(/\s+/g, " ^ ");
  return `<<UNTRUSTED_DATA source="${source}">>\n${marked}\n<<END_UNTRUSTED_DATA>>`;
}
