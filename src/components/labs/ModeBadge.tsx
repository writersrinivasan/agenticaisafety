"use client";

import { Cpu, Zap } from "lucide-react";

export function ModeBadge({ live, liveLabel = "Live · LangGraph on Groq", offLabel = "Offline simulation (add a Groq key for live mode)" }: { live: boolean; liveLabel?: string; offLabel?: string }) {
  return live ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200">
      <Zap className="h-3.5 w-3.5" /> {liveLabel}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-100">
      <Cpu className="h-3.5 w-3.5" /> {offLabel}
    </span>
  );
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${on ? "bg-gradient-to-r from-emerald-400 to-teal-500" : "bg-surface-2 ring-1 ring-line"}`}
    >
      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${on ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}
