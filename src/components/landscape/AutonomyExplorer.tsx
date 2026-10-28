"use client";

import { useState } from "react";
import { AUTONOMY_LEVELS } from "@/lib/content/landscape";
import { HUE } from "@/lib/content/palette";

export function AutonomyExplorer() {
  const [lvl, setLvl] = useState(3);
  const a = AUTONOMY_LEVELS[lvl];
  const riskPct = Math.round(((lvl + 1) / AUTONOMY_LEVELS.length) * 100);

  return (
    <div className="card glow-border p-6">
      <div className="flex flex-wrap items-center gap-2">
        {AUTONOMY_LEVELS.map((x) => (
          <button
            key={x.level}
            onClick={() => setLvl(x.level)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${x.level === lvl ? `${HUE[x.hue].border} ${HUE[x.hue].bg} ${HUE[x.hue].text}` : "border-line text-muted hover:text-foreground"}`}
          >
            L{x.level} {x.name}
          </button>
        ))}
      </div>
      <input type="range" min={0} max={5} value={lvl} onChange={(e) => setLvl(Number(e.target.value))} className="mt-5 w-full accent-pink-500" aria-label="Autonomy level" />

      <div className="mt-5 grid gap-5 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className={`text-sm font-bold ${HUE[a.hue].text}`}>Level {a.level}</div>
          <div className="text-2xl font-extrabold">{a.name}</div>
          <div className="mt-1 text-sm text-muted">{a.tagline}</div>
          <div className="mt-3 rounded-lg bg-surface-2 p-3 text-sm">
            <div className="text-xs uppercase tracking-wide text-muted">Human role</div>
            {a.human}
          </div>
          <div className="mt-3 text-xs uppercase tracking-wide text-muted">Inherent risk</div>
          <div className="mt-1 h-3 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 transition-all" style={{ width: `${riskPct}%` }} />
          </div>
        </div>
        <div className="rounded-xl bg-surface-2 p-4">
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-rose-300">What can go wrong</div>
          <ul className="space-y-1.5 text-sm">
            {a.risks.map((r) => (
              <li key={r}>⚠️ {r}</li>
            ))}
          </ul>
          <div className="mt-4 text-xs uppercase tracking-wide text-muted">Example</div>
          <div className="text-sm">{a.example}</div>
        </div>
        <div className="rounded-xl bg-surface-2 p-4">
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-emerald-300">Minimum controls</div>
          <ul className="space-y-1.5 text-sm">
            {a.controls.map((c) => (
              <li key={c}>✅ {c}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
