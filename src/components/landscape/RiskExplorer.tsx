"use client";

import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { OWASP_ASI, RISKS, RISK_CATEGORIES } from "@/lib/content/landscape";
import { HUE, SEVERITY_CLASS } from "@/lib/content/palette";

export function RiskExplorer() {
  const [cat, setCat] = useState<string>("all");
  const [sev, setSev] = useState<string>("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const list = useMemo(
    () =>
      RISKS.filter(
        (r) =>
          (cat === "all" || r.category === cat) &&
          (sev === "all" || r.severity === sev) &&
          (!q || (r.title + r.what + r.example).toLowerCase().includes(q.toLowerCase())),
      ),
    [cat, sev, q],
  );

  const asiName = (id: string) => OWASP_ASI.find((a) => a.id === id)?.name;

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <button onClick={() => setCat("all")} className={`rounded-full px-3 py-1 text-xs font-semibold ${cat === "all" ? "bg-white text-black" : "bg-surface-2 text-muted"}`}>
          All ({RISKS.length})
        </button>
        {RISK_CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${cat === c.id ? `${HUE[c.hue].chip} ${HUE[c.hue].border}` : "border-transparent bg-surface-2 text-muted"}`}
          >
            {c.name} ({RISKS.filter((r) => r.category === c.id).length})
          </button>
        ))}
      </div>
      <div className="mb-5 flex flex-wrap gap-2">
        <input className="input max-w-xs" placeholder="Search risks…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input max-w-[10rem]" value={sev} onChange={(e) => setSev(e.target.value)}>
          <option value="all">All severities</option>
          {["Critical", "High", "Medium", "Low"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      {cat !== "all" && <p className="mb-4 text-sm text-muted">{RISK_CATEGORIES.find((c) => c.id === cat)?.blurb}</p>}

      <div className="grid gap-3 md:grid-cols-2">
        {list.map((r) => {
          const c = RISK_CATEGORIES.find((x) => x.id === r.category)!;
          const isOpen = open === r.id;
          return (
            <div key={r.id} className={`card overflow-hidden border-l-4 ${HUE[c.hue].border}`}>
              <button className="flex w-full items-start gap-3 p-4 text-left" onClick={() => setOpen(isOpen ? null : r.id)}>
                <ChevronRight className={`mt-1 h-4 w-4 shrink-0 transition ${isOpen ? "rotate-90" : ""}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{r.title}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${SEVERITY_CLASS[r.severity]}`}>{r.severity}</span>
                  </div>
                  <div className={`text-xs ${HUE[c.hue].text}`}>{c.name}</div>
                  <p className="mt-1 text-sm text-muted">{r.what}</p>
                </div>
              </button>
              {isOpen && (
                <div className="space-y-3 border-t border-line px-4 pb-4 pt-3 text-sm">
                  <div className="rounded-lg bg-surface-2 p-3">
                    <span className="font-semibold text-amber-200">Scenario: </span>
                    {r.example}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <div className="mb-1 text-xs font-bold uppercase text-sky-300">Detection signals</div>
                      <ul className="list-disc space-y-0.5 pl-4 text-muted">
                        {r.signals.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="mb-1 text-xs font-bold uppercase text-emerald-300">Mitigations</div>
                      <ul className="list-disc space-y-0.5 pl-4 text-muted">
                        {r.mitigations.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {r.refs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {r.refs.map((ref) => (
                        <span key={ref} className="rounded bg-surface-2 px-2 py-0.5 font-mono text-xs text-violet-200" title={asiName(ref) ?? "OWASP LLM Top 10 (2025)"}>
                          {ref}
                          {asiName(ref) ? ` · ${asiName(ref)}` : ""}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {!list.length && <p className="text-sm text-muted">No risks match those filters.</p>}
    </div>
  );
}
