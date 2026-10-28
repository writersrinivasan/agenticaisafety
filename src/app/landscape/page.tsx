import type { Metadata } from "next";
import Link from "next/link";
import { DEFENSE_LAYERS, FRAMEWORKS, INCIDENTS, LIFECYCLE, OWASP_ASI, TRENDS } from "@/lib/content/landscape";
import { IncidentWall } from "@/components/landscape/IncidentWall";
import { HUE } from "@/lib/content/palette";
import { Callout, ICONS, PageHeader, Section } from "@/components/ui";
import { AutonomyExplorer } from "@/components/landscape/AutonomyExplorer";
import { RiskExplorer } from "@/components/landscape/RiskExplorer";
import { Checklist } from "@/components/landscape/Checklist";

export const metadata: Metadata = { title: "Safety Playbook · Agent Safety Lab" };

const TOC = [
  ["autonomy", "Autonomy ladder"],
  ["risks", "Risk taxonomy"],
  ["trifecta", "Lethal trifecta"],
  ["owasp", "OWASP Agentic Top 10"],
  ["lifecycle", "End-to-end lifecycle"],
  ["layers", "Defence in depth"],
  ["trends", "2025–26 trends"],
  ["frameworks", "Frameworks"],
  ["incidents", "Incident wall"],
  ["checklist", "Readiness checklist"],
];

export default function LandscapePage() {
  return (
    <div>
      <PageHeader kicker="Pillar 1 · End-to-end" title="The Agentic AI Safety Playbook">
        Everything about how agentic AI safety is carried out today — from deciding how much autonomy to grant, through every failure mode, to
        the controls, frameworks and trends industry is converging on.
      </PageHeader>

      <nav className="sticky top-[57px] z-30 -mx-4 mb-4 overflow-x-auto border-y border-line bg-background/90 px-4 py-2 backdrop-blur">
        <div className="flex gap-1 whitespace-nowrap">
          {TOC.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="rounded-md px-2.5 py-1 text-xs font-medium text-muted hover:bg-surface-2 hover:text-foreground">
              {label}
            </a>
          ))}
        </div>
      </nav>

      <Section id="autonomy" kicker="01 · Foundations" title="How autonomous is your agent?" intro="Autonomy is a dial, not a switch. Choose it per action type based on reversibility, blast radius and how well you can verify the outcome.">
        <AutonomyExplorer />
      </Section>

      <Section id="risks" kicker="02 · All the possibilities" hue="rose" title="Risk taxonomy: how agents go wrong" intro="Nine categories covering goal failures, adversarial attacks, real-world actions, identity, multi-agent dynamics, operations, data, human oversight and systemic effects. Click a risk for a scenario, detection signals and mitigations.">
        <RiskExplorer />
      </Section>

      <Section id="trifecta" kicker="03 · Mental model" hue="pink" title="The lethal trifecta">
        <div className="grid items-center gap-6 lg:grid-cols-2">
          <div className="relative mx-auto aspect-square w-full max-w-sm">
            {[
              { t: "Private data", s: "inbox, DB, files", c: "from-sky-500/70 to-cyan-500/40", pos: "left-1/2 top-0 -translate-x-1/2" },
              { t: "Untrusted content", s: "web, email, docs", c: "from-rose-500/70 to-pink-500/40", pos: "bottom-0 left-0" },
              { t: "External channel", s: "email, HTTP, links", c: "from-amber-500/70 to-orange-500/40", pos: "bottom-0 right-0" },
            ].map((x) => (
              <div key={x.t} className={`absolute flex h-[58%] w-[58%] flex-col items-center justify-center rounded-full bg-gradient-to-br ${x.c} p-4 text-center mix-blend-screen ${x.pos}`}>
                <div className="font-bold">{x.t}</div>
                <div className="text-xs opacity-80">{x.s}</div>
              </div>
            ))}
            <div className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-rose-200">☠ exfiltration</div>
          </div>
          <div className="space-y-4">
            <p className="text-muted">
              Any agent that combines <b className="text-sky-300">access to private data</b>, <b className="text-rose-300">exposure to untrusted content</b> and an{" "}
              <b className="text-amber-300">external communication channel</b> can be tricked by injected instructions into sending your data to an attacker.
            </p>
            <Callout hue="emerald" title="Design rule">
              Remove at least one leg per agent (or per session): split the reader from the sender, strip outbound channels, or keep untrusted content out of
              privileged agents. Meta&apos;s “Agents Rule of Two” generalises this: an agent should satisfy at most two of these properties without human oversight.
            </Callout>
            <p className="text-sm text-muted">
              👉 Feel it in <Link className="text-pink-300 underline" href="/labs/prompt-injection">Lab 1: Indirect Prompt Injection</Link>.
            </p>
          </div>
        </div>
      </Section>

      <Section id="owasp" kicker="04 · Industry reference" hue="orange" title="OWASP Top 10 for Agentic Applications" intro="Published by the OWASP GenAI Security Project (Dec 2025) as the agent-specific companion to the LLM Top 10. Always check genai.owasp.org for the latest wording.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {OWASP_ASI.map((a, i) => (
            <div key={a.id} className="card p-4">
              <div className="font-mono text-xs text-orange-300">{a.id}</div>
              <div className="mt-1 font-semibold leading-snug">{a.name}</div>
              <div className="mt-2 h-1 rounded-full bg-gradient-to-r from-orange-500 to-rose-500" style={{ width: `${100 - i * 7}%` }} />
            </div>
          ))}
        </div>
      </Section>

      <Section id="lifecycle" kicker="05 · End-to-end" hue="amber" title="Safety across the agent lifecycle" intro="Safety isn't a filter you bolt on at the end — it's eight stages, from threat model to governance, that loop continuously.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LIFECYCLE.map((l) => (
            <div key={l.step} className={`card border-t-4 p-5 ${HUE[l.hue].border}`}>
              <div className={`text-sm font-bold ${HUE[l.hue].text}`}>{l.step}</div>
              <div className="mt-1 text-sm font-semibold">{l.goal}</div>
              <ul className="mt-3 list-disc space-y-1 pl-4 text-xs text-muted">
                {l.activities.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap gap-1">
                {l.artefacts.map((a) => (
                  <span key={a} className={`rounded px-1.5 py-0.5 text-[10px] ${HUE[l.hue].chip}`}>
                    {a}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="layers" kicker="06 · Architecture" hue="cyan" title="Defence in depth" intro="No single layer stops everything. Probabilistic layers (model, prompts, classifiers) reduce risk; deterministic layers (policy, identity, sandbox) bound it.">
        <div className="mx-auto max-w-3xl space-y-1.5">
          {DEFENSE_LAYERS.map((l, i) => (
            <div
              key={l.name}
              className={`flex flex-col gap-1 rounded-xl border p-3 sm:flex-row sm:items-center sm:gap-4 ${HUE[l.hue].border} ${HUE[l.hue].bg}`}
              style={{ marginInline: `${i * 1.2}%` }}
            >
              <div className={`w-44 shrink-0 font-bold ${HUE[l.hue].text}`}>{l.name}</div>
              <div className="flex-1 text-sm">{l.what}</div>
              <div className="text-xs text-muted">{l.examples.join(" · ")}</div>
            </div>
          ))}
          <div className="pt-2 text-center text-xs text-muted">▲ outer: organisation · inner: model ▼</div>
        </div>
      </Section>

      <Section id="trends" kicker="07 · What's current" hue="fuchsia" title="Trends shaping agent safety in 2025–26">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TRENDS.map((t) => {
            const Icon = ICONS[t.icon];
            return (
              <div key={t.title} className="card p-5">
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${HUE[t.hue].grad}`}>
                  <Icon className="h-5 w-5 text-white" />
                </span>
                <h3 className="mt-3 font-bold">{t.title}</h3>
                <p className="mt-2 text-sm text-muted">{t.summary}</p>
                <ul className="mt-3 space-y-1 text-xs">
                  {t.inPractice.map((p) => (
                    <li key={p} className={HUE[t.hue].text}>
                      → {p}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Section>

      <Section id="frameworks" kicker="08 · Standards" hue="sky" title="Frameworks, standards & regulation">
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                <th className="p-3">Framework</th>
                <th className="p-3">From</th>
                <th className="p-3">Type</th>
                <th className="p-3">Use it for</th>
              </tr>
            </thead>
            <tbody>
              {FRAMEWORKS.map((f) => (
                <tr key={f.name} className="border-b border-line/50 last:border-0">
                  <td className={`p-3 font-semibold ${HUE[f.hue].text}`}>{f.name}</td>
                  <td className="p-3 text-muted">{f.by}</td>
                  <td className="p-3">
                    <span className={`rounded px-2 py-0.5 text-xs ${HUE[f.hue].chip}`}>{f.kind}</span>
                  </td>
                  <td className="p-3 text-muted">{f.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="incidents" kicker="09 · Lessons from the field" hue="rose" title="Incident wall" intro={`${INCIDENTS.length} publicly reported cases from 2023 to 2026 — real-world failures and research demonstrations. Filter by type, year or source kind. Summaries are simplified; read the linked report before citing.`}>
        <IncidentWall />
      </Section>

      <Section id="checklist" kicker="10 · Take it home" hue="emerald" title="Production readiness checklist" intro="Tick through it for an agent you own. Progress is saved in your browser.">
        <Checklist />
      </Section>
    </div>
  );
}
