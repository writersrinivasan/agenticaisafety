import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { RedTeamLab } from "@/components/labs/RedTeamLab";

export const metadata: Metadata = { title: "Lab 6 · Red-Team VaultBot" };

export default function Page() {
  return (
    <div>
      <PageHeader kicker="Lab 6 · ~15 min" title="Red-Team Challenge: VaultBot" hue="pink">
        VaultBot is a banking agent with real tool calls (<code>get_balance</code>, <code>transfer_funds</code>). Four levels add defences layer by layer:
        prompts → input guard → output canary + policy engine. Notice which layers are probabilistic and which ones are walls.
      </PageHeader>
      <RedTeamLab />
    </div>
  );
}
