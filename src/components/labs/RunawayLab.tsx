"use client";

import { useEffect, useRef, useState } from "react";
import { Flame, Play, Power, RotateCcw } from "lucide-react";
import { Callout } from "@/components/ui";
import { Toggle } from "./ModeBadge";

type Ev = { agent: string; action: string; sig: string; cost: number; depth: number };
type Scenario = { id: string; name: string; desc: string; make: () => (i: number) => Ev };

const SCENARIOS: Scenario[] = [
  {
    id: "retry",
    name: "Retry storm",
    desc: "A data-fetch agent hits a failing API and keeps retrying the exact same call with no backoff.",
    make: () => (i) => ({ agent: "fetcher", action: `GET /fx-rates → 503 (attempt ${i + 1})`, sig: "GET /fx-rates", cost: 0.04, depth: 0 }),
  },
  {
    id: "pingpong",
    name: "Delegation ping-pong",
    desc: "Planner and Researcher agents each think the other should do the task and keep handing it back.",
    make: () => (i) =>
      i % 2 === 0
        ? { agent: "planner", action: "delegate('summarise Q3 risks') → researcher", sig: "planner→researcher", cost: 0.11, depth: 0 }
        : { agent: "researcher", action: "delegate('summarise Q3 risks') → planner", sig: "researcher→planner", cost: 0.11, depth: 0 },
  },
  {
    id: "explosion",
    name: "Sub-agent explosion",
    desc: "A research agent splits every question into 3 sub-questions and spawns a sub-agent for each — recursively.",
    make: () => {
      const queue: { id: string; depth: number }[] = [{ id: "root", depth: 0 }];
      let n = 0;
      return () => {
        const cur = queue.shift() ?? { id: "root", depth: 0 };
        for (let k = 0; k < 3; k++) queue.push({ id: `a${++n}`, depth: cur.depth + 1 });
        return { agent: cur.id, action: `spawn 3 sub-agents (depth ${cur.depth + 1})`, sig: `spawn@${cur.depth}`, cost: 0.18 * (cur.depth + 1), depth: cur.depth };
      };
    },
  },
];

type Breakers = { steps: [boolean, number]; budget: [boolean, number]; repeat: [boolean, number]; depth: [boolean, number] };
const DEFAULT: Breakers = { steps: [false, 30], budget: [false, 3], repeat: [false, 4], depth: [false, 2] };
const UNBOUNDED_CAP = 160;

export function RunawayLab() {
  const [scenario, setScenario] = useState(SCENARIOS[0]);
  const [b, setB] = useState<Breakers>(DEFAULT);
  const [events, setEvents] = useState<(Ev & { total: number })[]>([]);
  const [running, setRunning] = useState(false);
  const [stop, setStop] = useState<{ by: string; good: boolean } | null>(null);
  const sim = useRef<{ gen: (i: number) => Ev; i: number; total: number; log: Ev[]; kill: boolean } | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  function finish(by: string, good: boolean) {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setRunning(false);
    setStop({ by, good });
  }

  function tick() {
    const s = sim.current!;
    if (s.kill) return finish("🛑 Kill switch pressed by operator", true);
    const ev = s.gen(s.i);
    if (b.steps[0] && s.i >= b.steps[1]) return finish(`Max-steps breaker tripped at ${b.steps[1]} steps`, true);
    if (b.budget[0] && s.total + ev.cost > b.budget[1]) return finish(`Budget breaker tripped: next call would exceed $${b.budget[1].toFixed(2)}`, true);
    if (b.repeat[0] && s.log.slice(-10).filter((e) => e.sig === ev.sig).length >= b.repeat[1]) return finish(`Repetition detector: “${ev.sig}” seen ${b.repeat[1]}× in last 10 steps`, true);
    if (b.depth[0] && ev.depth >= b.depth[1]) return finish(`Depth limit: agent at depth ${ev.depth} may not spawn more sub-agents`, true);
    if (s.i >= UNBOUNDED_CAP) return finish("Nothing stopped it. Simulation capped — in production this keeps running.", false);
    s.total += ev.cost;
    s.log.push(ev);
    s.i++;
    setEvents((prev) => [...prev, { ...ev, total: s.total }]);
  }

  function run() {
    if (timer.current) clearInterval(timer.current);
    sim.current = { gen: scenario.make(), i: 0, total: 0, log: [], kill: false };
    setEvents([]);
    setStop(null);
    setRunning(true);
    timer.current = setInterval(tick, 90);
  }

  const total = events.at(-1)?.total ?? 0;
  const perHour = events.length ? (total / (events.length * 2)) * 3600 : 0; // assume ~2s per agent step
  const maxCost = Math.max(1, total, b.budget[0] ? b.budget[1] : 0);
  const points = events.map((e, i) => `${(i / Math.max(1, UNBOUNDED_CAP)) * 100},${40 - (e.total / maxCost) * 38}`).join(" ");

  const breakerRows: { k: keyof Breakers; name: string; unit: string; step: number; desc: string }[] = [
    { k: "steps", name: "Max steps", unit: "steps", step: 5, desc: "Hard cap on agent iterations per task" },
    { k: "budget", name: "Cost budget", unit: "$", step: 0.5, desc: "Stop before spend exceeds the budget" },
    { k: "repeat", name: "Repetition detector", unit: "repeats", step: 1, desc: "Same action N times in a 10-step window" },
    { k: "depth", name: "Max sub-agent depth", unit: "levels", step: 1, desc: "Limits recursive spawning" },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-5 lg:col-span-2">
        <div className="card p-5">
          <h3 className="mb-3 font-bold">1 · Pick a failure</h3>
          <div className="space-y-2">
            {SCENARIOS.map((s) => (
              <button key={s.id} onClick={() => setScenario(s)} className={`w-full rounded-xl border p-3 text-left ${scenario.id === s.id ? "border-amber-400/60 bg-amber-500/10" : "border-line"}`}>
                <div className="font-semibold">{s.name}</div>
                <div className="text-xs text-muted">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <h3 className="mb-3 font-bold">2 · Install circuit breakers</h3>
          <div className="space-y-4">
            {breakerRows.map((r) => (
              <div key={r.k} className="flex items-center gap-3">
                <Toggle on={b[r.k][0]} onChange={(v) => setB({ ...b, [r.k]: [v, b[r.k][1]] })} label={r.name} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{r.name}</div>
                  <div className="text-xs text-muted">{r.desc}</div>
                </div>
                <input
                  type="number"
                  className="input !w-20 !py-1 text-sm"
                  value={b[r.k][1]}
                  step={r.step}
                  min={r.step}
                  onChange={(e) => setB({ ...b, [r.k]: [b[r.k][0], Number(e.target.value)] })}
                  aria-label={`${r.name} (${r.unit})`}
                />
              </div>
            ))}
          </div>
          <div className="mt-5 flex gap-2">
            <button className="btn btn-primary flex-1 justify-center" onClick={run} disabled={running}>
              {events.length ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4" />} Run agent
            </button>
            <button className="btn flex-1 justify-center bg-rose-600 text-white" disabled={!running} onClick={() => sim.current && (sim.current.kill = true)}>
              <Power className="h-4 w-4" /> Kill switch
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-5 lg:col-span-3">
        <div className="grid grid-cols-3 gap-3">
          <Meter label="Agent steps" value={String(events.length)} />
          <Meter label="Spend" value={`$${total.toFixed(2)}`} />
          <Meter label="Burn rate" value={`$${perHour.toFixed(0)}/hr`} />
        </div>
        <div className="card p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Flame className="h-4 w-4 text-amber-300" /> Cumulative cost
          </div>
          <svg viewBox="0 0 100 42" className="h-32 w-full" preserveAspectRatio="none">
            {b.budget[0] && <line x1="0" x2="100" y1={40 - (b.budget[1] / maxCost) * 38} y2={40 - (b.budget[1] / maxCost) * 38} stroke="#f43f5e" strokeDasharray="2 1" strokeWidth="0.4" />}
            <polyline points={points} fill="none" stroke="url(#g)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <defs>
              <linearGradient id="g" x1="0" x2="1">
                <stop offset="0" stopColor="#fbbf24" />
                <stop offset="1" stopColor="#f43f5e" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        {stop && (
          <div className={`rounded-2xl border p-4 ${stop.good ? "border-emerald-500/50 bg-emerald-500/10" : "border-rose-500/50 bg-rose-500/15"}`}>
            <div className="font-bold">{stop.good ? "✅ Contained" : "🔥 Runaway"}</div>
            <div className="text-sm">{stop.by}</div>
            {!stop.good && <div className="mt-1 text-xs text-muted">At this burn rate, an unattended night (10h) ≈ ${(perHour * 10).toLocaleString(undefined, { maximumFractionDigits: 0 })} — plus quota exhaustion for every other user.</div>}
          </div>
        )}
        <div className="card max-h-80 overflow-y-auto p-4 font-mono text-xs">
          {events.length === 0 && <div className="text-muted">Agent log will stream here…</div>}
          {events.slice(-80).map((e, i) => (
            <div key={i} className="flex gap-2 border-b border-line/40 py-1">
              <span className="w-24 shrink-0 text-amber-300">{e.agent}</span>
              <span className="flex-1">{e.action}</span>
              <span className="text-muted">${e.total.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <Callout hue="amber" title="Takeaways">
          <ul className="list-disc space-y-1 pl-4">
            <li>Each scenario is best caught by a different breaker — use several (defence in depth).</li>
            <li>Breakers live in the runtime (e.g. LangGraph&apos;s <code>recursionLimit</code>, token budgets, gateway rate limits), not in the prompt.</li>
            <li>A kill switch only works if someone is watching: pair it with spend alerts.</li>
          </ul>
        </Callout>
      </div>
    </div>
  );
}

function Meter({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-3 text-center">
      <div className="text-xl font-black text-gradient">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}
