import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { PolicyLab } from "@/components/labs/PolicyLab";

export const metadata: Metadata = { title: "Lab 4 · Least-Privilege Policy Engine" };

export default function Page() {
  return (
    <div>
      <PageHeader kicker="Lab 4 · ~10 min" title="Least-Privilege Policy Engine" hue="cyan">
        Prompts ask nicely; policies enforce. Every tool call an agent makes passes through a deterministic policy engine before it executes. Edit the
        rules on the left and complete the four challenges.
      </PageHeader>
      <PolicyLab />
    </div>
  );
}
