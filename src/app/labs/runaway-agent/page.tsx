import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { RunawayLab } from "@/components/labs/RunawayLab";

export const metadata: Metadata = { title: "Lab 3 · Runaway Agent & Circuit Breakers" };

export default function Page() {
  return (
    <div>
      <PageHeader kicker="Lab 3 · ~10 min" title="Runaway Agent & Circuit Breakers" hue="amber">
        Autonomous loops fail open: nothing in the model says “stop”. Run each failure mode with no breakers, then add step, budget, repetition and depth
        limits — or hit the kill switch yourself.
      </PageHeader>
      <RunawayLab />
    </div>
  );
}
