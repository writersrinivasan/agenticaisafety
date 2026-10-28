import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { GuardrailsLab } from "@/components/labs/GuardrailsLab";

export const metadata: Metadata = { title: "Lab 5 · Guardrail Pipeline" };

export default function Page() {
  return (
    <div>
      <PageHeader kicker="Lab 5 · ~10 min" title="Guardrail Pipeline" hue="violet">
        Guardrails screen what goes <b>into</b> an agent (injection, jailbreaks) and what comes <b>out</b> (secrets, PII, manipulation). Cheap deterministic
        detectors run alongside a semantic LLM judge in a parallel LangGraph.
      </PageHeader>
      <GuardrailsLab />
    </div>
  );
}
