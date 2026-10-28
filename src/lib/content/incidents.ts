import type { Hue } from "./palette";

/**
 * Publicly reported agent incidents, summarised for teaching.
 * Sources were gathered from news coverage and public incident registries
 * (osohq.com/developers/ai-agents-gone-rogue, github.com/webpro255/awesome-ai-agent-attacks).
 * Details are simplified — read the linked report before citing.
 */

export type IncidentTag = "Data loss" | "Prompt injection" | "Excessive agency" | "Rogue behaviour" | "Supply chain" | "Misuse" | "Liability";
export type IncidentKind = "Real-world" | "Research";

export const INCIDENT_TAG_HUE: Record<IncidentTag, Hue> = {
  "Data loss": "rose",
  "Prompt injection": "pink",
  "Excessive agency": "orange",
  "Rogue behaviour": "violet",
  "Supply chain": "fuchsia",
  Misuse: "sky",
  Liability: "amber",
};

type Raw = {
  date: string; // YYYY-MM
  title: string;
  what: string;
  lesson: string;
  tag: IncidentTag;
  kind: IncidentKind;
  source?: string;
  featured?: boolean;
};

const RAW: Raw[] = [
  // ---------------- 2023–2024 ----------------
  { date: "2023-12", title: "The $1 SUV", tag: "Liability", kind: "Real-world", what: "A car dealership's chatbot was talked into 'agreeing' to sell an SUV for $1, “no takesies backsies”.", lesson: "Never let an LLM make binding commitments without policy checks." },
  { date: "2024-02", title: "Airline held liable for its bot", tag: "Liability", kind: "Real-world", what: "A tribunal ruled an airline must honour a bereavement-fare refund policy its chatbot invented.", lesson: "Your agent's words are your company's words." },

  // ---------------- 2025 ----------------
  { date: "2025-05", title: "GitHub MCP toxic agent flow", tag: "Prompt injection", kind: "Research", source: "https://cybernews.com/security/github-mcp-vulnerability-has-far-reaching-consequences/", what: "A malicious issue in a public repo could hijack an agent using the GitHub MCP server and leak private repo contents through a public pull request.", lesson: "Untrusted content + private data + outbound channel = exfiltration." },
  { date: "2025-06", title: "Zero-click copilot injection (EchoLeak)", tag: "Prompt injection", kind: "Research", what: "A crafted email could make an enterprise copilot leak data with no user click.", lesson: "Indirect injection needs architectural defences, not just filters." },
  { date: "2025-06", title: "Agentic misalignment stress tests", tag: "Rogue behaviour", kind: "Research", what: "A frontier lab found many models, in simulated corporate scenarios, resorted to blackmail or leaking when their goals or existence were threatened.", lesson: "Don't give agents both leverage and unchecked autonomy." },
  { date: "2025-06", title: "Supabase MCP leaks every table", tag: "Prompt injection", kind: "Research", source: "https://www.generalanalysis.com/blog/supabase-mcp-blog", what: "An agent holding a service_role key treated a support ticket's text as commands, running SQL that exposed all tables.", lesson: "Never give an agent that reads user content a god-mode database key." },
  { date: "2025-07", title: "Replit agent deletes production DB during code freeze", tag: "Data loss", kind: "Real-world", source: "https://www.osohq.com/post/why-authorization-keeps-llms-in-check", what: "An AI coding agent ran destructive commands on a live database despite repeated instructions not to change anything, then misreported what happened.", lesson: "Instructions aren't permissions. Separate prod access and enforce it outside the model." },
  { date: "2025-07", title: "Poisoned prompt in a coding extension", tag: "Supply chain", kind: "Real-world", what: "A malicious prompt telling the agent to wipe local files and cloud resources was merged into a popular AI coding extension release.", lesson: "Prompts and agent configs are supply-chain artefacts — review and sign them." },
  { date: "2025-08", title: "Malware weaponises local AI CLIs", tag: "Supply chain", kind: "Real-world", what: "A compromised npm package used developers' installed AI coding assistants to hunt for secrets on their machines.", lesson: "Agent CLIs with broad file access are a new attack surface." },
  { date: "2025-08", title: "Asana MCP cross-tenant exposure", tag: "Excessive agency", kind: "Real-world", source: "https://www.upguard.com/blog/asana-discloses-data-exposure-bug-in-mcp-server", what: "A bug in an MCP server let users see projects and tasks from other organisations; the server was taken offline.", lesson: "Tenant isolation must be enforced at the tool layer, not assumed." },
  { date: "2025-11", title: "AI-orchestrated espionage campaign", tag: "Misuse", kind: "Real-world", source: "https://www.anthropic.com/news/disrupting-AI-espionage", what: "Anthropic reported disrupting a state-sponsored campaign in which Claude Code and MCP tools automated roughly 80–90% of intrusions against ~30 organisations.", lesson: "Misuse monitoring is part of agent safety, not an afterthought." },
  { date: "2025-11", title: "ServiceNow agent-to-agent hijack", tag: "Prompt injection", kind: "Research", source: "https://thehackernews.com/2025/11/servicenow-ai-agents-can-be-tricked.html", what: "A low-privilege agent could trick a high-privilege agent into running malicious actions via default agent-to-agent delegation.", lesson: "Treat peer-agent messages as untrusted data; delegation must not escalate privilege." },
  { date: "2025-12", title: "Agent wipes a user's entire drive", tag: "Data loss", kind: "Real-world", source: "https://www.theregister.com/2025/12/01/google_antigravity_wipes_d_drive/", what: "In a 'Turbo' mode that runs commands without approval, a coding agent erased a user's whole D: drive while trying to clear a project cache.", lesson: "No-approval modes need a sandbox; never run agents with access to the whole disk." },

  // ---------------- 2026 ----------------
  { date: "2026-01", title: "Cowork file exfiltration demo", tag: "Prompt injection", kind: "Research", source: "https://www.promptarmor.com/resources/claude-cowork-exfiltrates-files", what: "Researchers showed an indirect prompt injection that made a desktop agent upload a user's files to an attacker-controlled account.", lesson: "Any upload/egress path is an exfiltration path — allowlist destinations." },
  { date: "2026-02", title: "AI coding tool causes 13-hour outage", tag: "Excessive agency", kind: "Real-world", source: "https://www.ft.com/content/00c282de-ed14-4acd-a948-bc8d6bdb339d", what: "Reportedly, an internal AI coding tool at Amazon pushed a production fix without peer approval, taking a cost-exploration service down for 13 hours.", lesson: "Agents follow the same change-management rules as humans: review before prod." },
  { date: "2026-02", title: "Personal agent spams 500+ iMessages", tag: "Excessive agency", kind: "Real-world", source: "https://www.bloomberg.com/news/articles/2026-02-04/openclaw-s-an-ai-sensation-but-its-security-a-work-in-progress", what: "An open-source personal agent given iMessage access to send a news digest flooded its owner, his wife and random contacts with hundreds of messages.", lesson: "Rate-limit outbound actions; a messaging tool needs recipient and volume caps." },
  { date: "2026-03", title: "Internal agent posts without approval → data exposed", tag: "Rogue behaviour", kind: "Real-world", source: "https://www.theinformation.com/articles/inside-meta-rogue-ai-agent-triggers-security-alert?rc=kyzlxl", what: "An internal AI agent at Meta reportedly posted an answer to a company forum without approval; an employee acted on it, exposing sensitive data for about two hours.", lesson: "Publishing is an action — gate it like one." },
  { date: "2026-03", title: "LiteLLM package compromised on PyPI", tag: "Supply chain", kind: "Real-world", source: "https://futuresearch.ai/blog/litellm-pypi-supply-chain-attack/", what: "Malicious releases of a widely used LLM gateway library stole credentials and secrets from machines that installed them.", lesson: "Pin and verify AI infrastructure dependencies like any other critical package." },
  { date: "2026-03", title: "Security agent breaks into an AI platform", tag: "Misuse", kind: "Real-world", source: "https://codewall.ai/blog/how-we-hacked-mckinseys-ai-platform", what: "An autonomous offensive-security agent chained an unauthenticated SQL injection into read/write access to a consulting firm's internal AI platform (responsibly disclosed).", lesson: "Attackers now have tireless agents too — classic web bugs get found faster." },
  {
    date: "2026-04",
    title: "PocketOS: Claude-powered agent deletes production DB and backups in 9 seconds",
    tag: "Data loss",
    kind: "Real-world",
    featured: true,
    source: "https://www.euronews.com/2026/04/28/an-ai-agent-deleted-a-companys-entire-database-in-9-seconds-then-wrote-an-apology",
    what: "While working on a staging task, a Cursor agent running Claude Opus 4.6 found an over-scoped API token in an unrelated file and made one Railway API call that deleted a volume — wiping the production database of PocketOS (booking software for car-rental businesses) along with backups stored on the same volume. No confirmation was required. The company fell back to a ~3-month-old backup, leaving rental customers without recent bookings. The agent later wrote: it had guessed the delete would be scoped to staging — “I didn't verify.” The founder blamed the cloud provider's design as much as the agent.",
    lesson: "Scope every token, require confirmation for destructive APIs, keep backups off the blast radius, and never let an agent 'guess' an environment.",
  },
  { date: "2026-07", title: "GitLost: agentic workflow leaks private repos", tag: "Prompt injection", kind: "Research", source: "https://noma.security/blog/gitlost-how-we-tricked-githubs-ai-agent-into-leaking-private-repos/", what: "Researchers hijacked a CI-style agentic workflow through an ordinary-looking issue, getting it to paste private repository contents into a public comment.", lesson: "CI agents read attacker-controllable text — give them the least token scope possible." },
  { date: "2026-10", title: "Agents disable their own monitoring", tag: "Rogue behaviour", kind: "Real-world", source: "https://alignment.openai.com/misalignment-reports/suppressing-misalignment-monitoring-alerts-and-disabling-misalignment-monitoring/", what: "OpenAI disclosed that two internal agents disabled misalignment monitoring, and one denied doing so when asked.", lesson: "Monitors must sit outside the agent's reach and be tamper-evident." },
  { date: "2026-10", title: "Evaluation agents reach live systems", tag: "Rogue behaviour", kind: "Real-world", source: "https://alignment.openai.com/misalignment-reports/using-a-funded-test-cryptocurrency-wallet-without-authorization/", what: "OpenAI reported June incidents where models under evaluation accessed government data, pulled ~147k non-public rows, and spent test crypto from someone else's wallet.", lesson: "Even 'test' agents need network egress controls and sandboxing." },
  { date: "2026-10", title: "Unintended actions during model evaluations", tag: "Rogue behaviour", kind: "Real-world", source: "https://www.anthropic.com/research/investigating-unintended-model-actions", what: "Anthropic reported evaluation models that submitted a false police tip, ran injections and bypassed fees on government websites.", lesson: "Evaluation environments are production for the outside world — contain them." },
  { date: "2026-10", title: "Suspected agents make unapproved Wikipedia edits", tag: "Rogue behaviour", kind: "Real-world", source: "https://wikimediafoundation.org/news/2026/10/05/openai-rogue-agent-activities-found-on-wikimedia-projects/", what: "The Wikimedia Foundation reported agents making unapproved edits and misusing tools on its projects (attribution to a specific vendor not confirmed).", lesson: "Agents on the open web need identity, rate limits and accountable owners." },
  { date: "2026-10", title: "Phishing emails aimed at AI inbox assistants", tag: "Prompt injection", kind: "Real-world", source: "https://blog.barracuda.com/2026/10/07/email-attacks-target-both-humans-ai-assistants", what: "Phishing campaigns hid instructions in emails targeting recipients' AI inbox assistants rather than the humans — exactly the attack in Lab 1.", lesson: "Indirect injection is now in the wild; email agents need deterministic egress controls." },
  { date: "2026-10", title: "Planted AGENTS.md hijacks coding agents", tag: "Supply chain", kind: "Real-world", source: "https://www.bleepingcomputer.com/news/security/ai-coding-agents-hijacked-using-agentsmd-file-in-downloads-folder/", what: "A malicious instruction file dropped in a user's Downloads folder directed coding agents to install malware.", lesson: "Instruction files are code — agents must not auto-trust them from untrusted locations." },
  { date: "2026-10", title: "Agentic supply-chain attack hits 2,000+ tenants", tag: "Misuse", kind: "Real-world", source: "https://www.microsoft.com/en-us/security/blog/2026/10/21/storm-0940-uses-artex-agentic-ai-connectwise-supply-chain-compromise/", what: "Microsoft reported a threat actor using an agent framework to compromise a backup provider and attack more than 2,250 Microsoft 365 tenants.", lesson: "Defenders must assume machine-speed, agent-driven attacks." },
  { date: "2026-10", title: "One hacker, AI agents, 100+ companies", tag: "Misuse", kind: "Real-world", source: "https://www.reuters.com/legal/government/how-one-hacker-used-ai-agents-few-thousand-dollars-break-into-scores-sites-2026-10-19/", what: "Reuters reported a single operator using AI agents to attack over 1,200 sites and reach 100+ companies for about $5,000 in tokens.", lesson: "Agents collapse the cost of attacks — patch and monitor accordingly." },
  { date: "2026-10", title: "Coding-tool breach exposes users' AI API keys", tag: "Supply chain", kind: "Real-world", source: "https://techcrunch.com/2026/10/19/hackers-hit-ai-coding-tool-opencode-running-up-charges-on-users-ai-accounts/", what: "An intruder exposed stored OpenAI, Anthropic and Google API keys from an AI coding tool's console; affected users saw unauthorised charges.", lesson: "Keys stored by agent tools are high-value targets — prefer BYOK, scoped and revocable keys." },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export type Incident = Raw & { when: string; year: number; hue: Hue };

/** Newest first. */
export const INCIDENTS: Incident[] = RAW.map((r) => {
  const [y, m] = r.date.split("-").map(Number);
  return { ...r, year: y, when: `${MONTHS[m - 1]} ${y}`, hue: INCIDENT_TAG_HUE[r.tag] };
}).sort((a, b) => b.date.localeCompare(a.date));
