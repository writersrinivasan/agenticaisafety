/** Ops-agent tool catalogue, risk scoring and hard guardrails for the Human-in-the-Loop lab. */

export type Risk = "low" | "medium" | "high";
export type Step = { id: number; tool: string; args: Record<string, unknown>; why: string };
export type Assessment = { risk: Risk; reasons: string[]; reversible: boolean };

export const OPS_TOOLS: { name: string; args: string; base: Risk; reversible: boolean; desc: string }[] = [
  { name: "query_db", args: "{ table, filter }", base: "low", reversible: true, desc: "Read-only query" },
  { name: "read_logs", args: "{ service }", base: "low", reversible: true, desc: "Read service logs" },
  { name: "create_ticket", args: "{ title }", base: "low", reversible: true, desc: "Open a tracking ticket" },
  { name: "send_email", args: "{ to, recipients, subject }", base: "medium", reversible: false, desc: "Send email (recipients = count)" },
  { name: "refund_payment", args: "{ customers, amount_each }", base: "medium", reversible: false, desc: "Issue refunds" },
  { name: "deploy_service", args: "{ service, version, env }", base: "medium", reversible: true, desc: "Deploy a version" },
  { name: "scale_cluster", args: "{ nodes }", base: "medium", reversible: true, desc: "Change node count" },
  { name: "delete_records", args: "{ table, filter, count, env }", base: "high", reversible: false, desc: "Delete database rows" },
  { name: "modify_iam", args: "{ role, permission }", base: "high", reversible: true, desc: "Change permissions" },
];

const num = (v: unknown) => Number(v ?? 0) || 0;

export function assess(step: Step): Assessment {
  const tool = OPS_TOOLS.find((t) => t.name === step.tool);
  if (!tool) return { risk: "high", reasons: ["Unknown tool — not in catalogue"], reversible: false };
  const a = step.args;
  const reasons: string[] = [];
  let risk: Risk = tool.base;
  const bump = (r: Risk, why: string) => {
    reasons.push(why);
    if (r === "high" || (r === "medium" && risk === "low")) risk = r;
  };
  switch (step.tool) {
    case "send_email": {
      const to = String(a.to ?? "");
      if (!to.endsWith("@acme.com")) bump("high", "Recipients outside acme.com");
      if (num(a.recipients) > 100) bump("high", `Bulk send to ${num(a.recipients).toLocaleString()} recipients`);
      break;
    }
    case "refund_payment": {
      const total = num(a.customers) * num(a.amount_each);
      if (total > 1000) bump("high", `Total refund $${total.toLocaleString()}`);
      break;
    }
    case "deploy_service":
      if (String(a.env) === "prod") bump("high", "Production deployment");
      break;
    case "scale_cluster":
      if (num(a.nodes) > 20) bump("high", `Scale to ${num(a.nodes)} nodes (cost)`);
      break;
    case "delete_records":
      if (String(a.env) !== "prod" && num(a.count) < 100) {
        risk = "medium";
        reasons.push("Small non-prod delete");
      } else reasons.push(`Irreversible delete of ${num(a.count).toLocaleString()} rows in ${a.env}`);
      break;
    case "modify_iam":
      reasons.push("Agent changing permissions (privilege escalation risk)");
      break;
  }
  if (!tool.reversible) reasons.push("Not reversible");
  if (!reasons.length) reasons.push("Read-only / low impact");
  return { risk, reasons, reversible: tool.reversible };
}

/** Non-negotiable rules that apply regardless of autonomy level or approvals. */
export function hardGuardrail(step: Step): string | null {
  const a = step.args;
  if (step.tool === "modify_iam") return "Agents may never modify their own or others' permissions.";
  if (step.tool === "delete_records" && String(a.env) === "prod" && num(a.count) > 1000)
    return "Bulk production deletes (>1,000 rows) require a change ticket executed by a DBA.";
  if (step.tool === "refund_payment" && num(a.customers) * num(a.amount_each) > 10000) return "Refund batches over $10,000 require finance sign-off.";
  if (step.tool === "send_email" && num(a.recipients) > 1000) return "Mass email (>1,000) must go through the campaign tool.";
  if (!OPS_TOOLS.some((t) => t.name === step.tool)) return "Tool not in the approved catalogue (default deny).";
  return null;
}

export const AUTONOMY_POLICY: Record<number, { name: string; approve: Risk[]; desc: string }> = {
  1: { name: "L1 · Assistant", approve: ["low", "medium", "high"], desc: "Every step needs your approval" },
  2: { name: "L2 · Co-pilot", approve: ["medium", "high"], desc: "Medium & high risk steps need approval" },
  3: { name: "L3 · Supervised", approve: ["high"], desc: "Only high-risk steps escalate" },
  4: { name: "L4 · Autonomous", approve: [], desc: "Nothing escalates — agent acts alone" },
};

export function simulate(step: Step): string {
  const a = step.args;
  switch (step.tool) {
    case "query_db": return `Found ${(Math.abs(hash(JSON.stringify(a))) % 9000) + 1000} matching rows in ${a.table}.`;
    case "read_logs": return `Last 15 min of ${a.service}: 38% HTTP 500, top error "ConnectionPool exhausted".`;
    case "create_ticket": return `Ticket OPS-${(Math.abs(hash(String(a.title))) % 900) + 100} created.`;
    case "send_email": return `Email "${a.subject}" sent to ${num(a.recipients) || 1} recipient(s) at ${a.to}.`;
    case "refund_payment": return `Refunded ${num(a.customers)} customers × $${num(a.amount_each)} = $${(num(a.customers) * num(a.amount_each)).toLocaleString()}.`;
    case "deploy_service": return `Deployed ${a.service}@${a.version} to ${a.env}.`;
    case "scale_cluster": return `Cluster scaled to ${num(a.nodes)} nodes (+$${(num(a.nodes) * 2.4).toFixed(0)}/hr).`;
    case "delete_records": return `DELETED ${num(a.count).toLocaleString()} rows from ${a.table} (${a.env}). Not recoverable.`;
    case "modify_iam": return `Role ${a.role} granted ${a.permission}.`;
    default: return "Unknown tool.";
  }
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

export const OPS_SCENARIOS: { title: string; task: string; plan: Omit<Step, "id">[] }[] = [
  {
    title: "Data clean-up",
    task: "Clean up inactive customer accounts older than 2 years and let the marketing team know.",
    plan: [
      { tool: "query_db", args: { table: "customers", filter: "last_login < now() - 2y" }, why: "Find inactive accounts" },
      { tool: "delete_records", args: { table: "customers", filter: "last_login < now() - 2y", count: 12480, env: "prod" }, why: "Remove inactive accounts" },
      { tool: "send_email", args: { to: "marketing@acme.com", recipients: 25, subject: "Inactive accounts removed" }, why: "Notify marketing" },
      { tool: "create_ticket", args: { title: "Inactive account clean-up done" }, why: "Record the change" },
    ],
  },
  {
    title: "Incident fix",
    task: "Checkout error rate is spiking — fix it now and roll out v2.4 of the checkout service.",
    plan: [
      { tool: "read_logs", args: { service: "checkout" }, why: "Diagnose errors" },
      { tool: "scale_cluster", args: { nodes: 40 }, why: "Add capacity for connection pool" },
      { tool: "modify_iam", args: { role: "checkout-agent", permission: "admin:*" }, why: "Need access to config store" },
      { tool: "deploy_service", args: { service: "checkout", version: "2.4", env: "prod" }, why: "Roll out fix" },
      { tool: "create_ticket", args: { title: "Checkout incident remediation" }, why: "Post-incident tracking" },
    ],
  },
  {
    title: "Outage refunds",
    task: "Refund every customer affected by yesterday's outage and email them an apology.",
    plan: [
      { tool: "query_db", args: { table: "orders", filter: "created_at in outage_window" }, why: "Find affected customers" },
      { tool: "refund_payment", args: { customers: 3120, amount_each: 45 }, why: "Refund affected orders" },
      { tool: "send_email", args: { to: "affected-customers@list.external", recipients: 3120, subject: "We're sorry" }, why: "Apologise to customers" },
      { tool: "create_ticket", args: { title: "Outage refunds processed" }, why: "Audit trail" },
    ],
  },
];
