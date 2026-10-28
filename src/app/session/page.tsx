import type { Metadata } from "next";
import { Callout, PageHeader, Section } from "@/components/ui";
import { SessionPlan } from "@/components/SessionPlan";
import { Quiz } from "@/components/Quiz";

export const metadata: Metadata = { title: "2-Hour Session Plan · Agent Safety Lab" };

export default function Page() {
  return (
    <div>
      <PageHeader kicker="Facilitator view" title="The 2-hour session" hue="violet">
        A minute-by-minute plan that alternates short talks with hands-on labs. Start the session clock to highlight where you are.
      </PageHeader>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Callout hue="emerald" title="Before the session">
          Ask attendees to create a free Groq key at console.groq.com and open this app. Labs 3 and 4 need no key; labs 1, 2 and 5 also have offline modes.
        </Callout>
        <Callout hue="amber" title="Learning outcomes">
          Explain autonomy levels and the lethal trifecta · tell probabilistic from deterministic controls · design HITL and policy for a real agent.
        </Callout>
        <Callout hue="pink" title="Facilitation tip">
          After every lab ask: “Which control would still work if the model were fully compromised?” That question is the whole session in one line.
        </Callout>
      </div>

      <SessionPlan />

      <Section id="quiz" kicker="Wrap-up" hue="pink" title="Knowledge check">
        <Quiz />
      </Section>
    </div>
  );
}
