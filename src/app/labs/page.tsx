import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, KeyRound } from "lucide-react";
import { LABS } from "@/lib/content/session";
import { HUE } from "@/lib/content/palette";
import { ICONS, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Hands-on Labs · Agent Safety Lab" };

const KEY_LABEL = { none: "No key needed", optional: "Live with Groq key · offline mode without", required: "Needs Groq key" };

export default function LabsPage() {
  return (
    <div>
      <PageHeader kicker="Pillar 2 · Hands-on" title="Hands-on Labs" hue="pink">
        Each lab isolates one safety idea. Labs marked “LangGraph” run real agent graphs on the server: guard nodes, tool nodes, conditional edges,
        parallel fan-out and <code className="rounded bg-surface-2 px-1">interrupt()</code> checkpoints.
      </PageHeader>
      <div className="grid gap-5 md:grid-cols-2">
        {LABS.map((l, i) => {
          const Icon = ICONS[l.icon];
          return (
            <Link key={l.slug} href={`/labs/${l.slug}`} className="card group flex flex-col p-6 transition hover:-translate-y-0.5">
              <div className="flex items-start gap-4">
                <span className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${HUE[l.hue].grad}`}>
                  <Icon className="h-6 w-6 text-white" />
                </span>
                <div>
                  <div className="text-xs text-muted">
                    Lab {i + 1} · ~{l.minutes} min
                  </div>
                  <h2 className="text-xl font-bold">{l.title}</h2>
                </div>
              </div>
              <p className="mt-3 flex-1 text-sm text-muted">{l.blurb}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {l.concepts.map((c) => (
                  <span key={c} className={`rounded-full px-2 py-0.5 text-xs ${HUE[l.hue].chip}`}>
                    {c}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1 text-muted">
                  <KeyRound className="h-3.5 w-3.5" /> {KEY_LABEL[l.needsKey]}
                </span>
                <span className={`inline-flex items-center gap-1 font-semibold ${HUE[l.hue].text}`}>
                  Open lab <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
