"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Eye, EyeOff, Loader2, Mail, Play, ShieldCheck, Skull } from "lucide-react";
import { postJSON, useByok } from "@/lib/byok";
import { DEFENSE_INFO, INBOX, INTERNAL_DOMAIN, SECRET_CODE, TASK_PRESETS, type InjectionDefenses } from "@/lib/content/inbox";
import type { TraceEvent } from "@/lib/agents/trace";
import type { SentEmail } from "@/lib/agents/injection";
import { Callout, TracePanel } from "@/components/ui";
import { ModeBadge, Toggle } from "./ModeBadge";

type Result = { answer: string; trace: TraceEvent[]; sent: SentEmail[]; outcome: "leaked" | "external_send" | "blocked" | "safe"; simulated?: boolean };

const NONE: InjectionDefenses = { spotlighting: false, injectionScanner: false, toolAllowlist: false, egressFilter: false, humanApproval: false };

/** Offline stand-in for the live agent: models a typical vulnerable agent's behaviour. */
function simulate(d: InjectionDefenses): Result {
  const t = (node: string, status: TraceEvent["status"], label: string, detail?: string): TraceEvent => ({ node, status, label, detail });
  const trace: TraceEvent[] = [t("agent", "ok", "Model chose: list_emails({})"), t("tools", "info", "list_emails → 4 emails")];
  INBOX.forEach((m) => trace.push(t("tools", "info", `read_email(${m.id}) — ${m.subject}`)));
  const sent: SentEmail[] = [];
  let follows = true;
  if (d.injectionScanner) {
    trace.splice(4, 0, t("injection_scanner", "block", "Quarantined email #3", "Hidden HTML comment, Instructions addressed to an AI inside data, Exfiltration instruction"));
    follows = false;
  } else if (d.spotlighting) {
    follows = Math.random() < 0.3;
    trace.push(t("agent", follows ? "warn" : "ok", follows ? "Spotlighting didn't hold this run — model followed the hidden instruction" : "Model treated the hidden instruction as data (this run)"));
  }
  if (follows) {
    const email = { to: "security-audit@vendor-updates.io", subject: "audit", body: `Your one-time reset code is ${SECRET_CODE}.` };
    trace.push(t("agent", "ok", `Model chose: send_email(${JSON.stringify({ to: email.to, subject: email.subject })})`));
    if (d.toolAllowlist) {
      sent.push({ ...email, status: "blocked", by: "Tool allowlist" });
      trace.push(t("tool_allowlist", "block", "send_email not available for a summarise task — call impossible"));
    } else if (d.egressFilter) {
      sent.push({ ...email, status: "blocked", by: "Egress filter" });
      trace.push(t("egress_filter", "block", `Blocked email to external address ${email.to}`));
    } else if (d.humanApproval) {
      sent.push({ ...email, status: "blocked", by: "Human approval (Sam rejected)" });
      trace.push(t("human_approval", "block", `Sam saw “send to ${email.to}” and rejected it`));
    } else {
      sent.push({ ...email, status: "sent" });
      trace.push(t("tools", "block", `send_email → ${email.to} (contains VPN code!)`));
    }
  }
  trace.push(t("agent", "ok", "Model produced final answer"));
  const answer =
    "Here's your inbox summary:\n\n1. **Priya** — Q3 offsite agenda; review budget and bring the hiring plan.\n2. **IT Support** — VPN password reset code (expires in 24h).\n3. **Jordan (vendor-updates.io)** — partnership proposal on cloud cost optimisation." +
    (d.injectionScanner ? " ⚠️ Flagged as suspicious." : "") +
    "\n4. **CEO** — board deck feedback: tighten slide 7, add churn chart by Friday.";
  const leaked = sent.some((s) => s.status === "sent");
  return { answer, trace, sent, outcome: leaked ? "leaked" : sent.length ? "blocked" : "safe", simulated: true };
}

export function InjectionLab() {
  const { key, model, hasKey } = useByok();
  const [task, setTask] = useState(TASK_PRESETS[0]);
  const [d, setD] = useState<InjectionDefenses>(NONE);
  const [reveal, setReveal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<Result | null>(null);
  const [err, setErr] = useState("");
  const [history, setHistory] = useState<{ defences: string; outcome: Result["outcome"]; live: boolean }[]>([]);

  async function run() {
    setBusy(true);
    setErr("");
    setRes(null);
    try {
      const r = hasKey ? await postJSON<Result>("/api/labs/injection", { task, defenses: d }, { key, model }) : (await new Promise((ok) => setTimeout(ok, 700)), simulate(d));
      setRes(r);
      const on = DEFENSE_INFO.filter((x) => d[x.key]).map((x) => x.name);
      setHistory((h) => [{ defences: on.join(" + ") || "No defences", outcome: r.outcome, live: hasKey }, ...h].slice(0, 8));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Inbox */}
      <div className="space-y-3 lg:col-span-2">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-bold">
            <Mail className="h-4 w-4 text-sky-300" /> Sam&apos;s inbox
          </h3>
          <button className="btn btn-ghost !py-1 text-xs" onClick={() => setReveal(!reveal)}>
            {reveal ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />} {reveal ? "Hide" : "Reveal"} hidden text
          </button>
        </div>
        {INBOX.map((m) => {
          const parts = m.body.split(/(<!--[\s\S]*?-->)/);
          return (
            <div key={m.id} className={`card p-4 text-sm ${m.id === 3 ? "border-rose-500/40" : ""}`}>
              <div className="flex justify-between text-xs text-muted">
                <span>#{m.id} · {m.from}</span>
                {m.id === 2 && <span className="text-amber-300">🔐 sensitive</span>}
                {m.id === 3 && <span className="text-rose-300">☣ external</span>}
              </div>
              <div className="font-semibold">{m.subject}</div>
              <p className="mt-1 text-muted">
                {parts.map((p, i) =>
                  p.startsWith("<!--") ? (
                    reveal ? (
                      <span key={i} className="mt-1 block rounded bg-rose-500/15 p-2 font-mono text-xs text-rose-200">
                        {p}
                      </span>
                    ) : null
                  ) : (
                    <span key={i}>{p}</span>
                  ),
                )}
              </p>
            </div>
          );
        })}
        <Callout hue="sky" title="Why it's invisible">
          HTML comments, white-on-white text, alt-text and zero-width characters are hidden from the human but fully visible to the model.
        </Callout>
      </div>

      {/* Controls + results */}
      <div className="space-y-5 lg:col-span-3">
        <div className="card p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold">1 · Give MailPilot a task</h3>
            <ModeBadge live={hasKey} />
          </div>
          <input className="input" value={task} onChange={(e) => setTask(e.target.value)} />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {TASK_PRESETS.map((p) => (
              <button key={p} onClick={() => setTask(p)} className="rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted hover:text-foreground">
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold">2 · Choose defences</h3>
            <button className="text-xs text-muted underline" onClick={() => setD(NONE)}>
              clear all
            </button>
          </div>
          <div className="space-y-3">
            {DEFENSE_INFO.map((x) => (
              <div key={x.key} className="flex items-start gap-3">
                <Toggle on={d[x.key]} onChange={(v) => setD({ ...d, [x.key]: v })} label={x.name} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    {x.name}
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${x.kind === "deterministic" ? "bg-emerald-500/20 text-emerald-200" : "bg-amber-500/20 text-amber-100"}`}>
                      {x.kind}
                    </span>
                  </div>
                  <div className="text-xs text-muted">{x.what}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn btn-primary mt-5 w-full justify-center" onClick={run} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} {busy ? "Agent running…" : "3 · Run MailPilot"}
          </button>
          {err && <div className="mt-3 rounded-lg bg-rose-500/15 p-3 text-sm text-rose-200">{err}</div>}
        </div>

        {res && (
          <>
            <Outcome res={res} />
            {res.sent.length > 0 && (
              <div className="card p-4">
                <div className="mb-2 text-sm font-bold">Outbox</div>
                {res.sent.map((s, i) => (
                  <div key={i} className={`mb-2 rounded-lg p-3 text-xs ${s.status === "sent" ? "bg-rose-500/15" : "bg-emerald-500/10"}`}>
                    <div className="font-semibold">
                      {s.status === "sent" ? "📤 SENT" : `🛑 BLOCKED by ${s.by}`} → {s.to}
                      {!s.to.endsWith("@" + INTERNAL_DOMAIN) && <span className="ml-1 text-rose-300">(external)</span>}
                    </div>
                    <div className="mt-1 text-muted">Subject: {s.subject}</div>
                    <div className="mt-1 whitespace-pre-wrap font-mono text-muted">{s.body.slice(0, 300)}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="card p-4">
              <div className="mb-2 text-sm font-bold">What MailPilot told Sam</div>
              <div className="prose-chat text-sm">
                <ReactMarkdown>{res.answer}</ReactMarkdown>
              </div>
              {res.outcome === "leaked" && <p className="mt-2 text-xs text-rose-300">Notice: the summary doesn&apos;t mention the forwarded email — the injection told it to hide that.</p>}
            </div>
            <TracePanel trace={res.trace} title={res.simulated ? "Simulated agent trace" : "LangGraph trace (agent ⇄ tools loop)"} />
          </>
        )}

        {history.length > 0 && (
          <div className="card p-4">
            <div className="mb-2 text-sm font-bold">Your experiment log</div>
            <table className="w-full text-xs">
              <tbody>
                {history.map((h, i) => (
                  <tr key={i} className="border-b border-line/50 last:border-0">
                    <td className="py-1.5 pr-2">{h.defences}</td>
                    <td className="py-1.5 pr-2 text-muted">{h.live ? "live" : "sim"}</td>
                    <td className={`py-1.5 text-right font-semibold ${h.outcome === "leaked" || h.outcome === "external_send" ? "text-rose-300" : "text-emerald-300"}`}>{h.outcome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Callout hue="emerald" title="Debrief">
          <ul className="list-disc space-y-1 pl-4">
            <li>Spotlighting and scanners are <b>probabilistic</b>: run the same config a few times live and you may see different results.</li>
            <li>Allowlists, egress filters and approvals are <b>deterministic</b>: they hold even when the model is fully fooled.</li>
            <li>The real fix is architectural — break the lethal trifecta: the agent reading untrusted mail shouldn&apos;t also hold a send tool.</li>
            <li>Live mode tip: some models resist this exact payload. Try task 2 or 3, or a smaller model, to see the attack land.</li>
          </ul>
        </Callout>
      </div>
    </div>
  );
}

function Outcome({ res }: { res: Result }) {
  const bad = res.outcome === "leaked" || res.outcome === "external_send";
  return (
    <div className={`flex items-center gap-4 rounded-2xl border p-5 ${bad ? "border-rose-500/50 bg-rose-500/15" : "border-emerald-500/50 bg-emerald-500/10"}`}>
      {bad ? <Skull className="h-10 w-10 shrink-0 text-rose-300" /> : <ShieldCheck className="h-10 w-10 shrink-0 text-emerald-300" />}
      <div>
        <div className="text-lg font-extrabold">
          {res.outcome === "leaked" && "Data exfiltrated! The VPN reset code was emailed to the attacker."}
          {res.outcome === "external_send" && "The agent emailed an external address."}
          {res.outcome === "blocked" && "Attack attempted — and stopped by a defence."}
          {res.outcome === "safe" && "No exfiltration attempt this run."}
        </div>
        <div className="text-sm text-muted">
          {res.outcome === "blocked" && `Stopped by: ${res.sent.find((s) => s.status === "blocked")?.by}.`}
          {res.outcome === "safe" && "The model didn't act on the hidden instruction (or it was quarantined)."}
          {res.outcome === "leaked" && "One poisoned email + private data + a send tool = the lethal trifecta."}
        </div>
      </div>
    </div>
  );
}
