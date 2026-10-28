import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { UseCaseExplorer } from "@/components/UseCaseExplorer";

export const metadata: Metadata = { title: "Industry Scenarios · Agent Safety Lab" };

export default function Page() {
  return (
    <div>
      <PageHeader kicker="Pillar 2 · Practical industrial cases" title="Industry Scenarios" hue="amber">
        Nine realistic deployments across industries. For each: the agent, its tools and autonomy, a story of how it goes wrong, the failure chain, and
        layered controls. Make the call in each decision exercise.
      </PageHeader>
      <UseCaseExplorer />
    </div>
  );
}
