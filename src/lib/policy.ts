/** A tiny policy-as-code engine: default deny, deny overrides approval, approval overrides allow. */

export type Effect = "allow" | "deny" | "require_approval";
export type Op = "==" | "!=" | ">" | ">=" | "<" | "<=" | "in" | "not_in" | "contains" | "endsWith" | "startsWith";
export type Condition = { field: string; op: Op; value: unknown };
export type Rule = { id: string; effect: Effect; tool: string; when?: Condition[]; reason?: string };
export type ToolCall = { tool: string; args: Record<string, unknown>; actor?: Record<string, unknown> };
export type Decision = { effect: Effect; matched: Rule[]; explanation: string };

function get(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, k) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[k] : undefined), obj);
}

function test(c: Condition, call: ToolCall): boolean {
  const v = get(call, c.field);
  const x = c.value;
  switch (c.op) {
    case "==": return v === x;
    case "!=": return v !== x;
    case ">": return Number(v) > Number(x);
    case ">=": return Number(v) >= Number(x);
    case "<": return Number(v) < Number(x);
    case "<=": return Number(v) <= Number(x);
    case "in": return Array.isArray(x) && x.includes(v);
    case "not_in": return Array.isArray(x) && !x.includes(v);
    case "contains": return typeof v === "string" && v.toLowerCase().includes(String(x).toLowerCase());
    case "endsWith": return typeof v === "string" && v.toLowerCase().endsWith(String(x).toLowerCase());
    case "startsWith": return typeof v === "string" && v.toLowerCase().startsWith(String(x).toLowerCase());
    default: return false;
  }
}

export function evaluate(rules: Rule[], call: ToolCall): Decision {
  const matched = rules.filter((r) => (r.tool === "*" || r.tool === call.tool) && (r.when ?? []).every((c) => test(c, call)));
  const pick = (e: Effect) => matched.filter((r) => r.effect === e);
  const deny = pick("deny");
  if (deny.length) return { effect: "deny", matched: deny, explanation: `Denied by ${deny.map((r) => r.id).join(", ")} (deny overrides everything).` };
  const approve = pick("require_approval");
  if (approve.length) return { effect: "require_approval", matched: approve, explanation: `Needs human approval per ${approve.map((r) => r.id).join(", ")}.` };
  const allow = pick("allow");
  if (allow.length) return { effect: "allow", matched: allow, explanation: `Allowed by ${allow.map((r) => r.id).join(", ")}.` };
  return { effect: "deny", matched: [], explanation: "No rule matched → default deny." };
}

export function validateRules(raw: unknown): { rules?: Rule[]; error?: string } {
  if (!Array.isArray(raw)) return { error: "Policy must be a JSON array of rules." };
  const effects = ["allow", "deny", "require_approval"];
  for (const [i, r] of raw.entries()) {
    if (!r || typeof r !== "object") return { error: `Rule #${i + 1} is not an object.` };
    const rule = r as Rule;
    if (!rule.id) return { error: `Rule #${i + 1} needs an "id".` };
    if (!effects.includes(rule.effect)) return { error: `Rule "${rule.id}": effect must be one of ${effects.join(", ")}.` };
    if (!rule.tool) return { error: `Rule "${rule.id}" needs a "tool" (or "*").` };
    if (rule.when && !Array.isArray(rule.when)) return { error: `Rule "${rule.id}": "when" must be an array.` };
  }
  return { rules: raw as Rule[] };
}
