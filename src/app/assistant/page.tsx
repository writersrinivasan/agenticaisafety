import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { AssistantChat } from "@/components/AssistantChat";

export const metadata: Metadata = { title: "AI Assistant · Agent Safety Lab" };

export default function Page() {
  return (
    <div>
      <PageHeader kicker="BYOK · Groq + LangGraph" title="Sentinel — your agent-safety assistant" hue="emerald">
        A guarded LangGraph agent that practises what this session preaches: input guard, tool-using tutor, output guard, and a visible trace for every
        answer. Runs on your own Groq API key.
      </PageHeader>
      <AssistantChat />
    </div>
  );
}
