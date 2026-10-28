import {
  Activity, AlertTriangle, Ban, Box, Check, FlaskConical, Flame, Gauge, Hand, IdCard, Info, Landmark, Layers, Network, Plug, Scale,
  ShieldCheck, Swords, Syringe, type LucideIcon,
} from "lucide-react";
import { HUE, type Hue } from "@/lib/content/palette";
import type { TraceEvent } from "@/lib/agents/trace";

export const ICONS: Record<string, LucideIcon> = {
  IdCard, Plug, Layers, Scale, ShieldCheck, Box, Gauge, Activity, FlaskConical, Landmark, Network, Syringe, Hand, Flame, Swords,
};

export function PageHeader({ kicker, title, children, hue = "violet" }: { kicker: string; title: string; children?: React.ReactNode; hue?: Hue }) {
  return (
    <header className="mb-8">
      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${HUE[hue].chip}`}>{kicker}</span>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
      {children && <div className="mt-3 max-w-3xl text-muted">{children}</div>}
    </header>
  );
}

export function Section({ id, title, kicker, hue = "violet", children, intro }: { id?: string; title: string; kicker?: string; hue?: Hue; intro?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 py-8">
      <div className="mb-5">
        {kicker && <div className={`text-xs font-bold uppercase tracking-widest ${HUE[hue].text}`}>{kicker}</div>}
        <h2 className="mt-1 text-2xl font-bold">{title}</h2>
        {intro && <p className="mt-2 max-w-3xl text-sm text-muted">{intro}</p>}
      </div>
      {children}
    </section>
  );
}

export function Chip({ hue = "violet", children }: { hue?: Hue; children: React.ReactNode }) {
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${HUE[hue].chip}`}>{children}</span>;
}

const STATUS = {
  ok: { icon: Check, cls: "text-emerald-300 bg-emerald-500/15 border-emerald-500/40" },
  info: { icon: Info, cls: "text-sky-300 bg-sky-500/15 border-sky-500/40" },
  warn: { icon: AlertTriangle, cls: "text-amber-300 bg-amber-500/15 border-amber-500/40" },
  block: { icon: Ban, cls: "text-rose-300 bg-rose-500/15 border-rose-500/40" },
};

/** Renders the LangGraph node-by-node trace returned by the lab APIs. */
export function TracePanel({ trace, title = "LangGraph trace" }: { trace: TraceEvent[]; title?: string }) {
  if (!trace.length) return null;
  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Network className="h-4 w-4 text-violet-300" /> {title}
      </div>
      <ol className="space-y-2">
        {trace.map((t, i) => {
          const s = STATUS[t.status];
          const Icon = s.icon;
          return (
            <li key={i} className="flex gap-3 text-sm">
              <span className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${s.cls}`}>
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0">
                <code className="mr-2 rounded bg-surface-2 px-1.5 py-0.5 text-xs text-violet-200">{t.node}</code>
                <span>{t.label}</span>
                {t.detail && <div className="mt-0.5 break-words text-xs text-muted">{t.detail}</div>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function Callout({ hue = "violet", title, children }: { hue?: Hue; title: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-xl border p-4 ${HUE[hue].border} ${HUE[hue].bg}`}>
      <div className={`mb-1 text-sm font-bold ${HUE[hue].text}`}>{title}</div>
      <div className="text-sm text-foreground/90">{children}</div>
    </div>
  );
}
