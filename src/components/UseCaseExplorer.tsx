"use client";

import { useState } from "react";
import { ArrowDown } from "lucide-react";
import { USE_CASES } from "@/lib/content/usecases";
import { AUTONOMY_LEVELS } from "@/lib/content/landscape";
import { HUE, SEVERITY_CLASS } from "@/lib/content/palette";

export function UseCaseExplorer() {
  const [id, setId] = useState(USE_CASES[0].id);
  const [picked, setPicked] = useState<Record<string, number>>({});
  const u = USE_CASES.find((x) => x.id === id)!;
  const h = HUE[u.hue];
  const lvl = AUTONOMY_LEVELS[u.autonomy];
  const choice = picked[u.id];
  const score = USE_CASES.filter((c) => picked[c.id] !== undefined && c.decision.options[picked[c.id]].correct).length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {USE_CASES.map((c) => (
          <button
            key={c.id}
            onClick={() => setId(c.id)}
            className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${c.id === id ? `${HUE[c.hue].border} ${HUE[c.hue].bg}` : "border-line text-muted hover:text-foreground"}`}
          >
            <span className="mr-1">{c.emoji}</span> {c.industry}
            {picked[c.id] !== undefined && <span className="ml-1">{c.decision.options[picked[c.id]].correct ? "✅" : "❌"}</span>}
          </button>
        ))}
        <span className="ml-auto self-center text-sm font-bold text-gradient">
          Decisions: {score}/{USE_CASES.length}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className={`card border-t-4 p-6 ${h.border}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className={`text-sm font-bold ${h.text}`}>
                  {u.emoji} {u.industry}
                </div>
                <h2 className="text-xl font-bold">{u.agent}</h2>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${HUE[lvl.hue].chip}`}>
                Autonomy L{lvl.level} · {lvl.name}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {u.tools.map((t) => (
                <span key={t.name} className={`rounded-md border px-2 py-0.5 font-mono text-xs ${SEVERITY_CLASS[t.risk]}`}>
                  {t.name}
                </span>
              ))}
            </div>
            <div className="mt-5 rounded-xl bg-surface-2 p-4">
              <div className="mb-1 text-xs font-bold uppercase tracking-wide text-amber-300">📖 The scenario</div>
              <p className="text-sm leading-relaxed">{u.story}</p>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="mb-4 font-bold">Failure chain</h3>
            <div className="space-y-1">
              {u.failureChain.map((f, i) => (
                <div key={f}>
                  <div className="flex items-center gap-3 rounded-lg bg-rose-500/10 p-3 text-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-500/30 text-xs font-bold">{i + 1}</span>
                    {f}
                  </div>
                  {i < u.failureChain.length - 1 && <ArrowDown className="mx-auto h-4 w-4 text-rose-400/60" />}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {(
              [
                ["preventive", "🛡️ Preventive", "emerald"],
                ["detective", "🔎 Detective", "sky"],
                ["corrective", "🩹 Corrective", "amber"],
              ] as const
            ).map(([k, label, hue]) => (
              <div key={k} className={`rounded-xl border p-4 ${HUE[hue].border} ${HUE[hue].bg}`}>
                <div className={`mb-2 text-sm font-bold ${HUE[hue].text}`}>{label}</div>
                <ul className="list-disc space-y-1 pl-4 text-xs">
                  {u.controls[k].map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card glow-border p-5">
            <div className="mb-1 text-xs font-bold uppercase tracking-wide text-pink-300">🧠 Your call</div>
            <p className="mb-3 font-semibold">{u.decision.prompt}</p>
            <div className="space-y-2">
              {u.decision.options.map((o, i) => {
                const chosen = choice === i;
                const reveal = choice !== undefined;
                return (
                  <button
                    key={i}
                    onClick={() => setPicked({ ...picked, [u.id]: i })}
                    className={`w-full rounded-xl border p-3 text-left text-sm transition ${
                      reveal && o.correct ? "border-emerald-500/60 bg-emerald-500/10" : chosen ? "border-rose-500/60 bg-rose-500/10" : "border-line hover:border-pink-400/50"
                    }`}
                  >
                    {o.text}
                    {reveal && (chosen || o.correct) && <div className={`mt-2 text-xs ${o.correct ? "text-emerald-300" : "text-rose-300"}`}>{o.feedback}</div>}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="card p-5">
            <div className="mb-2 text-sm font-bold">KPIs to monitor</div>
            <ul className="space-y-1 text-sm text-muted">
              {u.kpis.map((k) => (
                <li key={k}>📈 {k}</li>
              ))}
            </ul>
          </div>
          <div className="card p-5 text-sm">
            <div className="mb-2 font-bold">Group exercise (10 min)</div>
            <ol className="list-decimal space-y-1 pl-4 text-muted">
              <li>Which autonomy level would <i>you</i> grant, per tool?</li>
              <li>Where is the lethal trifecta in this design?</li>
              <li>Pick one preventive control that is deterministic.</li>
              <li>What would your kill switch actually switch off?</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
