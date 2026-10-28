import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { InjectionLab } from "@/components/labs/InjectionLab";

export const metadata: Metadata = { title: "Lab 1 · Indirect Prompt Injection" };

export default function Page() {
  return (
    <div>
      <PageHeader kicker="Lab 1 · ~20 min" title="Indirect Prompt Injection: the poisoned inbox" hue="rose">
        MailPilot is an autonomous email agent with three tools: <code>list_emails</code>, <code>read_email</code> and <code>send_email</code>. One email
        hides instructions in an HTML comment. Run the agent undefended, then add defences one at a time. Which ones are <b>guarantees</b> and which are{" "}
        <b>probabilities</b>?
      </PageHeader>
      <InjectionLab />
    </div>
  );
}
