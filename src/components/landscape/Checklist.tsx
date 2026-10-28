"use client";

import { useState, useSyncExternalStore } from "react";
import { CHECKLIST } from "@/lib/content/landscape";

const STORE = "agentsafety.checklist";
const subscribe = () => () => {};
const readStore = () => {
  try {
    return localStorage.getItem(STORE) ?? "[]";
  } catch {
    return "[]";
  }
};

export function Checklist() {
  // Read saved ticks once on the client; server render starts empty.
  const initial = useSyncExternalStore(subscribe, readStore, () => "[]");
  const [done, setDone] = useState<string[] | null>(null);
  const ticks = done ?? (JSON.parse(initial) as string[]);
  const total = CHECKLIST.reduce((n, g) => n + g.items.length, 0);

  function toggle(item: string) {
    const next = ticks.includes(item) ? ticks.filter((x) => x !== item) : [...ticks, item];
    setDone(next);
    try {
      localStorage.setItem(STORE, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  const pct = Math.round((ticks.length / total) * 100);
  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center gap-4">
        <div className="text-3xl font-black text-gradient">{pct}%</div>
        <div className="flex-1">
          <div className="text-sm font-semibold">Production readiness for your agent</div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full bg-gradient-to-r from-violet-500 via-pink-500 to-amber-400 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <button className="btn btn-ghost text-xs" onClick={() => { setDone([]); try { localStorage.setItem(STORE, "[]"); } catch {} }}>
          Reset
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CHECKLIST.map((g) => (
          <div key={g.group}>
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">{g.group}</div>
            {g.items.map((i) => (
              <label key={i} className="mb-1.5 flex cursor-pointer items-start gap-2 text-sm">
                <input type="checkbox" className="mt-1 accent-pink-500" checked={ticks.includes(i)} onChange={() => toggle(i)} />
                <span className={ticks.includes(i) ? "text-muted line-through" : ""}>{i}</span>
              </label>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
