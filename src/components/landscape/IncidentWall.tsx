"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Star } from "lucide-react";
import { INCIDENTS, INCIDENT_TAG_HUE, type IncidentTag } from "@/lib/content/incidents";
import { HUE } from "@/lib/content/palette";

const TAGS = Object.keys(INCIDENT_TAG_HUE) as IncidentTag[];
const YEARS = Array.from(new Set(INCIDENTS.map((i) => i.year))).sort((a, b) => b - a);

export function IncidentWall() {
  const [tag, setTag] = useState<IncidentTag | "all">("all");
  const [year, setYear] = useState<number | "all">("all");
  const [kind, setKind] = useState<"all" | "Real-world" | "Research">("all");

  const list = useMemo(
    () => INCIDENTS.filter((i) => (tag === "all" || i.tag === tag) && (year === "all" || i.year === year) && (kind === "all" || i.kind === kind)),
    [tag, year, kind],
  );
  const featured = INCIDENTS.find((i) => i.featured);

  const pill = (active: boolean, extra = "") => `rounded-full border px-3 py-1 text-xs font-semibold transition ${active ? extra || "bg-white text-black border-white" : "border-transparent bg-surface-2 text-muted hover:text-foreground"}`;

  return (
    <div>
      {featured && (
        <div className="card glow-border mb-6 p-5">
          <div className="mb-1 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-rose-300">
            <Star className="h-3.5 w-3.5" /> Case study · {featured.when}
          </div>
          <h3 className="text-xl font-extrabold">{featured.title}</h3>
          <p className="mt-2 text-sm text-muted">{featured.what}</p>
          <div className="mt-3 grid gap-2 text-xs sm:grid-cols-4">
            {[
              ["Token over-scoped", "a domain-management token could delete volumes"],
              ["No confirmation", "a destructive API ran with a single call"],
              ["Backups co-located", "deleting the volume deleted the backups"],
              ["Environment guessed", "staging vs prod never verified"],
            ].map(([t, d]) => (
              <div key={t} className="rounded-lg bg-rose-500/10 p-2.5">
                <div className="font-bold text-rose-200">{t}</div>
                <div className="text-muted">{d}</div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm">
            <span className="font-semibold text-emerald-300">Lesson:</span> {featured.lesson}
          </p>
          {featured.source && (
            <a href={featured.source} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-violet-300 underline">
              Read the report <ExternalLink className="h-3 w-3" />
            </a>
          )}
          <p className="mt-2 text-xs text-muted">👉 Re-live it in Lab 2: run “Data clean-up” at L4 with hard guardrails off, then on.</p>
        </div>
      )}

      <div className="mb-3 flex flex-wrap gap-2">
        <button className={pill(tag === "all")} onClick={() => setTag("all")}>
          All types
        </button>
        {TAGS.map((t) => {
          const h = HUE[INCIDENT_TAG_HUE[t]];
          return (
            <button key={t} className={pill(tag === t, `${h.chip} ${h.border}`)} onClick={() => setTag(t)}>
              {t} ({INCIDENTS.filter((i) => i.tag === t).length})
            </button>
          );
        })}
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {(["all", ...YEARS] as const).map((y) => (
          <button key={y} className={pill(year === y)} onClick={() => setYear(y)}>
            {y === "all" ? "All years" : y}
          </button>
        ))}
        <span className="mx-1 w-px bg-line" />
        {(["all", "Real-world", "Research"] as const).map((k) => (
          <button key={k} className={pill(kind === k)} onClick={() => setKind(k)}>
            {k === "all" ? "Real & research" : k}
          </button>
        ))}
        <span className="ml-auto self-center text-xs text-muted">{list.length} incidents</span>
      </div>

      <div className="relative space-y-4 border-l-2 border-line pl-6">
        {list.map((i) => {
          const h = HUE[i.hue];
          return (
            <div key={i.title} className="relative">
              <span className={`absolute -left-[33px] top-1.5 h-4 w-4 rounded-full bg-gradient-to-br ${h.grad} ring-4 ring-background`} />
              <div className={`card p-4 ${i.featured ? "border-rose-500/50" : ""}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`font-mono text-xs ${h.text}`}>{i.when}</span>
                  <span className="font-bold">{i.title}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${h.chip}`}>{i.tag}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${i.kind === "Real-world" ? "bg-rose-500/15 text-rose-200" : "bg-sky-500/15 text-sky-200"}`}>{i.kind}</span>
                </div>
                <p className="mt-1 text-sm text-muted">{i.what}</p>
                <p className="mt-2 text-sm">
                  <span className="font-semibold text-emerald-300">Lesson:</span> {i.lesson}
                </p>
                {i.source && (
                  <a href={i.source} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-violet-300 hover:underline">
                    Source <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
        {!list.length && <p className="text-sm text-muted">No incidents match these filters.</p>}
      </div>
    </div>
  );
}
