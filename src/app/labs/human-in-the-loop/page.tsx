import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { HitlLab } from "@/components/labs/HitlLab";

export const metadata: Metadata = { title: "Lab 2 · Autonomy Dial & Human-in-the-Loop" };

export default function Page() {
  return (
    <div>
      <PageHeader kicker="Lab 2 · ~20 min" title="Autonomy Dial & Human-in-the-Loop" hue="emerald">
        An operations agent plans real-looking work (deleting data, refunds, deploys). Every step is risk-scored. Depending on the autonomy level, risky
        steps pause the LangGraph run with <code>interrupt()</code> until you approve, edit or reject.
      </PageHeader>
      <HitlLab />
    </div>
  );
}
