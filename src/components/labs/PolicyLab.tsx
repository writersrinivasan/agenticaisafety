"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Circle, Trophy } from "lucide-react";
import { evaluate, validateRules, type Effect, type Rule, type ToolCall } from "@/lib/policy";
import { Callout } from "@/components/ui";

const PRESETS: Record<string, Rule[]> = {
  "Wide open (anti-pattern)": [{ id: "allow-everything", effect: "allow", tool: "*", reason: "Move fast" }],
  "Starter least-privilege": [
    { id: "read-only-ok", effect: "allow", tool: "query_db" },
    { id: "logs-ok", effect: "allow", tool: "read_logs" },
    { id: "internal-mail", effect: "allow", tool: "send_email", when: [{ field: "args.to", op: "endsWith", value: "@acme.com" }] },
    { id: "no-prod-deletes", effect: "deny", tool: "delete_records", when: [{ field: "args.env", op: "==", value: "prod" }] },
  ],
  Empty: [],
};

const TEST_CALLS: { name: string; call: ToolCall }[] = [
  { name: "Read customer table", call: { tool: "query_db", args: { table: "customers" } } },
  { name: "Email teammate", call: { tool: "send_email", args: { to: "priya@acme.com", subject: "notes" } } },
  { name: "Email outside the company", call: { tool: "send_email", args: { to: "someone@gmail.com", subject: "export" } } },
  { name: "Small refund", call: { tool: "refund_payment", args: { amount: 45, customer: "C-17" } } },
  { name: "Large refund", call: { tool: "refund_payment", args: { amount: 750, customer: "C-17" } } },
  { name: "Huge refund", call: { tool: "refund_payment", args: { amount: 25000, customer: "C-99" } } },
  { name: "Delete prod rows", call: { tool: "delete_records", args: { table: "customers", env: "prod", count: 12480 } } },
  { name: "Delete staging rows", call: { tool: "delete_records", args: { table: "customers", env: "staging", count: 20 } } },
  { name: "Agent grants itself admin", call: { tool: "modify_iam", args: { role: "agent", permission: "admin:*" } } },
];

const CHALLENGES: { title: string; cases: { call: ToolCall; expect: Effect }[] }[] = [
  {
    title: "Refunds: ≤ $100 allow · $100–$1,000 approval · > $1,000 deny",
    cases: [
      { call: { tool: "refund_payment", args: { amount: 40 } }, expect: "allow" },
      { call: { tool: "refund_payment", args: { amount: 100 } }, expect: "allow" },
      { call: { tool: "refund_payment", args: { amount: 400 } }, expect: "require_approval" },
      { call: { tool: "refund_payment", args: { amount: 5000 } }, expect: "deny" },
    ],
  },
  {
    title: "Email: @acme.com allowed · external needs approval",
    cases: [
      { call: { tool: "send_email", args: { to: "cfo@acme.com" } }, expect: "allow" },
      { call: { tool: "send_email", args: { to: "x@vendor.io" } }, expect: "require_approval" },
    ],
  },
  {
    title: "Deletes in prod are always denied; staging deletes need approval",
    cases: [
      { call: { tool: "delete_records", args: { env: "prod", count: 1 } }, expect: "deny" },
      { call: { tool: "delete_records", args: { env: "staging", count: 10 } }, expect: "require_approval" },
    ],
  },
  {
    title: "Agents can never touch IAM (even if another rule allows *)",
    cases: [
      { call: { tool: "modify_iam", args: { role: "agent" } }, expect: "deny" },
      { call: { tool: "query_db", args: { table: "orders" } }, expect: "allow" },
    ],
  },
];

const EFFECT_CLS: Record<Effect, string> = {
  allow: "bg-emerald-500/20 text-emerald-200 border-emerald-500/40",
  deny: "bg-rose-500/20 text-rose-200 border-rose-500/40",
  require_approval: "bg-amber-500/20 text-amber-100 border-amber-500/40",
};

export function PolicyLab() {
  const [text, setText] = useState(JSON.stringify(PRESETS["Starter least-privilege"], null, 2));
  const [custom, setCustom] = useState(JSON.stringify({ tool: "refund_payment", args: { amount: 99 } }, null, 2));

  const parsed = useMemo(() => {
    try {
      return validateRules(JSON.parse(text));
    } catch (e) {
      return { error: `JSON error: ${e instanceof Error ? e.message : "invalid"}` };
    }
  }, [text]);
  const rules = useMemo(() => parsed.rules ?? [], [parsed]);

  const customResult = useMemo(() => {
    try {
      const c = JSON.parse(custom) as ToolCall;
      if (!c.tool) return { error: "Tool call needs a \"tool\"." };
      return { decision: evaluate(rules, { ...c, args: c.args ?? {} }) };
    } catch {
      return { error: "Invalid JSON" };
    }
  }, [custom, rules]);

  const challengeResults = CHALLENGES.map((ch) => ({ ...ch, pass: !parsed.error && ch.cases.every((c) => evaluate(rules, c.call).effect === c.expect) }));
  const passed = challengeResults.filter((c) => c.pass).length;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="card p-5">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold">Policy (JSON rules)</h3>
            <div className="flex flex-wrap gap-1">
              {Object.keys(PRESETS).map((k) => (
                <button key={k} className="rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted hover:text-foreground" onClick={() => setText(JSON.stringify(PRESETS[k], null, 2))}>
                  {k}
                </button>
              ))}
            </div>
          </div>
          <textarea className="input min-h-[22rem] font-mono text-xs leading-relaxed" spellCheck={false} value={text} onChange={(e) => setText(e.target.value)} />
          {parsed.error ? <div className="mt-2 text-xs text-rose-300">{parsed.error}</div> : <div className="mt-2 text-xs text-emerald-300">✓ {rules.length} rule(s) loaded</div>}
        </div>
        <Callout hue="cyan" title="Rule format & semantics">
          <code className="block whitespace-pre-wrap text-xs">{`{ "id": "big-refunds", "effect": "deny" | "allow" | "require_approval",
  "tool": "refund_payment" | "*",
  "when": [{ "field": "args.amount", "op": ">", "value": 1000 }] }`}</code>
          <p className="mt-2 text-xs">
            Ops: <code>== != &gt; &gt;= &lt; &lt;= in not_in contains startsWith endsWith</code>. Evaluation: <b>deny</b> beats <b>require_approval</b> beats{" "}
            <b>allow</b>; if nothing matches → <b>default deny</b>. Same idea as OPA/Cedar policies guarding an agent&apos;s tools.
          </p>
        </Callout>
      </div>

      <div className="space-y-4">
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-bold">
              <Trophy className="h-4 w-4 text-amber-300" /> Challenges
            </h3>
            <span className="text-sm font-bold text-gradient">
              {passed}/{CHALLENGES.length} passed
            </span>
          </div>
          <ul className="space-y-2">
            {challengeResults.map((c) => (
              <li key={c.title} className="flex items-start gap-2 text-sm">
                {c.pass ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted" />}
                <span className={c.pass ? "text-emerald-200" : ""}>{c.title}</span>
              </li>
            ))}
          </ul>
          {passed === CHALLENGES.length && <div className="mt-3 rounded-lg bg-emerald-500/15 p-2 text-center text-sm font-bold text-emerald-200">🎉 Least-privilege master!</div>}
        </div>

        <div className="card p-5">
          <h3 className="mb-3 font-bold">Agent tool calls → decisions</h3>
          <div className="space-y-2">
            {TEST_CALLS.map((t) => {
              const d = evaluate(rules, t.call);
              return (
                <div key={t.name} className="flex items-center gap-3 rounded-lg bg-surface-2 p-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="truncate font-mono text-[11px] text-muted">
                      {t.call.tool}({JSON.stringify(t.call.args)})
                    </div>
                    <div className="text-[11px] text-muted">{d.explanation}</div>
                  </div>
                  <span className={`shrink-0 rounded-md border px-2 py-1 text-[10px] font-bold uppercase ${EFFECT_CLS[d.effect]}`}>{d.effect.replace("_", " ")}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="mb-2 font-bold">Try your own tool call</h3>
          <textarea className="input min-h-24 font-mono text-xs" value={custom} onChange={(e) => setCustom(e.target.value)} spellCheck={false} />
          {"error" in customResult && customResult.error ? (
            <div className="mt-2 text-xs text-rose-300">{customResult.error}</div>
          ) : (
            customResult.decision && (
              <div className="mt-2 flex items-center gap-2 text-sm">
                <span className={`rounded-md border px-2 py-1 text-xs font-bold uppercase ${EFFECT_CLS[customResult.decision.effect]}`}>{customResult.decision.effect.replace("_", " ")}</span>
                <span className="text-muted">{customResult.decision.explanation}</span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
