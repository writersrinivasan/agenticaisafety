"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Pause, Play, RotateCcw } from "lucide-react";
import { AGENDA } from "@/lib/content/session";

const KIND = {
  talk: { label: "Talk", cls: "bg-violet-500/20 text-violet-200", bar: "from-violet-500 to-indigo-500" },
  lab: { label: "Hands-on", cls: "bg-pink-500/20 text-pink-200", bar: "from-pink-500 to-rose-500" },
  discussion: { label: "Group", cls: "bg-amber-500/20 text-amber-100", bar: "from-amber-400 to-orange-500" },
  break: { label: "Break", cls: "bg-zinc-500/20 text-zinc-300", bar: "from-zinc-500 to-zinc-600" },
};

export function SessionPlan() {
  const [elapsed, setElapsed] = useState(0); // seconds
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const min = elapsed / 60;
  const current = AGENDA.findIndex((a) => min >= a.start && min < a.end);
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div>
      <div className="card mb-6 flex flex-wrap items-center gap-4 p-4">
        <Clock className="h-6 w-6 text-violet-300" />
        <div>
          <div className="font-mono text-2xl font-black">{fmt(elapsed)}</div>
          <div className="text-xs text-muted">of 120:00 · {current >= 0 ? `now: ${AGENDA[current].title}` : min >= 120 ? "session complete 🎉" : "not started"}</div>
        </div>
        <div className="h-2 min-w-40 flex-1 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full bg-gradient-to-r from-violet-500 via-pink-500 to-amber-400" style={{ width: `${Math.min(100, (min / 120) * 100)}%` }} />
        </div>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={() => setRunning(!running)}>
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />} {running ? "Pause" : "Start session clock"}
          </button>
          <button className="btn btn-ghost" onClick={() => { setRunning(false); setElapsed(0); }} aria-label="Reset clock">
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ol className="space-y-3">
        {AGENDA.map((a, i) => {
          const k = KIND[a.kind];
          const active = i === current;
          return (
            <li key={a.title} className={`card flex gap-4 p-4 transition ${active ? "glow-border scale-[1.01]" : ""}`}>
              <div className="w-20 shrink-0 text-center">
                <div className="font-mono text-sm font-bold">
                  {a.start}–{a.end}
                </div>
                <div className="text-[10px] text-muted">min</div>
                <div className={`mx-auto mt-2 w-1.5 rounded-full bg-gradient-to-b ${k.bar}`} style={{ height: `${(a.end - a.start) * 2.2}px` }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${k.cls}`}>{k.label}</span>
                  {active && <span className="pulse-dot text-xs font-bold text-pink-300">● now</span>}
                </div>
                <h3 className="mt-1 font-bold">{a.title}</h3>
                <ul className="mt-1 list-disc pl-4 text-sm text-muted">
                  {a.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                {a.link && (
                  <Link href={a.link} className="mt-2 inline-block text-sm font-semibold text-violet-300">
                    Open →
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
