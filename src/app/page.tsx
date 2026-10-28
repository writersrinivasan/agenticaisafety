import Link from "next/link";
import { ArrowRight, BookOpen, Bot, Factory, FlaskConical, GraduationCap, Sparkles } from "lucide-react";
import { AUTONOMY_LEVELS, RISKS, RISK_CATEGORIES, INCIDENTS } from "@/lib/content/landscape";
import { LABS, AGENDA } from "@/lib/content/session";
import { USE_CASES } from "@/lib/content/usecases";
import { HUE } from "@/lib/content/palette";
import { ICONS } from "@/components/ui";

export default function Home() {
  const pillars = [
    { href: "/landscape", icon: BookOpen, title: "The Safety Playbook", hue: "violet" as const, text: "End-to-end: autonomy levels, every failure mode, lifecycle, defence-in-depth, frameworks, incidents and 2025–26 trends." },
    { href: "/labs", icon: FlaskConical, title: "Hands-on Labs", hue: "pink" as const, text: "Six interactive labs with real LangGraph agents: injection, human-in-the-loop, runaway loops, policy-as-code, guardrails, red-teaming." },
    { href: "/use-cases", icon: Factory, title: "Industry Scenarios", hue: "amber" as const, text: "Banking, healthcare, DevOps, support, retail, HR, legal, manufacturing & coding — failure chains and decision exercises." },
    { href: "/assistant", icon: Bot, title: "AI Safety Assistant", hue: "emerald" as const, text: "Ask “Sentinel”, a guarded LangGraph agent on Groq (bring your own key), anything about agent safety." },
  ];

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="relative pt-6 text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5 text-xs text-muted">
          <Sparkles className="h-3.5 w-3.5 text-amber-300" /> 2-hour interactive session · Next.js + LangGraph + Groq
        </div>
        <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">
          Agentic AI Safety: <span className="text-gradient">When Agents Become Too Autonomous</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
          Chatbots say things. Agents <em className="text-foreground">do</em> things — send money, delete data, deploy code. Learn how agentic AI fails, how industry keeps it safe, and practise it hands-on.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/session" className="btn btn-primary !px-5 !py-3">
            <GraduationCap className="h-5 w-5" /> Start the session
          </Link>
          <Link href="/labs/prompt-injection" className="btn btn-ghost !px-5 !py-3">
            Jump into Lab 1 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { n: RISKS.length, l: "failure modes mapped", h: "rose" as const },
            { n: RISK_CATEGORIES.length, l: "risk categories", h: "violet" as const },
            { n: LABS.length, l: "hands-on labs", h: "emerald" as const },
            { n: USE_CASES.length, l: "industry scenarios", h: "amber" as const },
          ].map((s) => (
            <div key={s.l} className="card p-4">
              <div className={`text-3xl font-black ${HUE[s.h].text}`}>{s.n}</div>
              <div className="text-xs text-muted">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pillars */}
      <section className="grid gap-4 md:grid-cols-2">
        {pillars.map((p) => (
          <Link key={p.href} href={p.href} className="card group p-6 transition hover:-translate-y-0.5 hover:border-violet-400/60">
            <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${HUE[p.hue].grad}`}>
              <p.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold">{p.title}</h3>
            <p className="mt-2 text-sm text-muted">{p.text}</p>
            <span className={`mt-4 inline-flex items-center gap-1 text-sm font-semibold ${HUE[p.hue].text}`}>
              Explore <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </section>

      {/* Autonomy strip */}
      <section>
        <h2 className="mb-2 text-2xl font-bold">The autonomy ladder</h2>
        <p className="mb-5 text-sm text-muted">Risk grows with every rung. The question is never “can the agent do it?” but “should it, without a human?”</p>
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {AUTONOMY_LEVELS.map((a) => (
            <Link key={a.level} href="/landscape#autonomy" className={`rounded-xl border p-3 ${HUE[a.hue].border} ${HUE[a.hue].bg}`}>
              <div className={`text-xs font-bold ${HUE[a.hue].text}`}>L{a.level}</div>
              <div className="font-semibold">{a.name}</div>
              <div className="mt-1 text-xs text-muted">{a.tagline}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Labs */}
      <section>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">Learn by breaking things</h2>
            <p className="text-sm text-muted">Every lab runs a real agent or a faithful simulation — toggle defences and watch the outcome change.</p>
          </div>
          <Link href="/labs" className="hidden text-sm font-semibold text-violet-300 sm:block">
            All labs →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LABS.map((l, i) => {
            const Icon = ICONS[l.icon];
            return (
              <Link key={l.slug} href={`/labs/${l.slug}`} className="card p-5 transition hover:-translate-y-0.5">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${HUE[l.hue].grad}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </span>
                  <div>
                    <div className="text-xs text-muted">Lab {i + 1} · {l.minutes} min</div>
                    <div className="font-bold">{l.title}</div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted">{l.blurb}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Incidents + agenda */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="mb-4 text-lg font-bold">Already happening</h3>
          <ul className="space-y-3">
            {INCIDENTS.slice(0, 5).map((i) => (
              <li key={i.title} className="flex gap-3">
                <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-gradient-to-br ${HUE[i.hue].grad}`} />
                <div>
                  <div className="text-sm font-semibold">
                    {i.title} <span className="font-normal text-muted">· {i.when}</span>
                  </div>
                  <div className="text-xs text-muted">{i.lesson}</div>
                </div>
              </li>
            ))}
          </ul>
          <Link href="/landscape#incidents" className="mt-4 inline-block text-sm font-semibold text-rose-300">
            Full incident wall →
          </Link>
        </div>
        <div className="card p-6">
          <h3 className="mb-4 text-lg font-bold">Your 120 minutes</h3>
          <ol className="space-y-2">
            {AGENDA.map((a) => (
              <li key={a.title} className="flex items-center gap-3 text-sm">
                <span className="w-20 shrink-0 font-mono text-xs text-muted">
                  {a.start}–{a.end}m
                </span>
                <span className={a.kind === "lab" ? "text-pink-200" : a.kind === "break" ? "text-muted" : ""}>{a.title}</span>
              </li>
            ))}
          </ol>
          <Link href="/session" className="mt-4 inline-block text-sm font-semibold text-violet-300">
            Facilitator plan & quiz →
          </Link>
        </div>
      </section>
    </div>
  );
}
