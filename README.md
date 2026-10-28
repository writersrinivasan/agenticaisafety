# Agent Safety Lab — *Agentic AI Safety: When Agents Become Too Autonomous*

A colourful learning app for a 2-hour session. It has two parts: an end-to-end **safety playbook** and **hands-on labs** that run real **LangGraph.js** agents on **Groq**, using a key each attendee brings (BYOK).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
# or: npm run build && npm start
```

Click **Groq key** in the top bar, paste a key from https://console.groq.com/keys, press **Test** (this loads the models your key can use), and **Save**.

## What's inside

| Route | What |
|---|---|
| `/landscape` | Playbook: autonomy ladder L0–L5, 30 risks in 9 categories, lethal trifecta, OWASP Agentic Top 10, 8-stage lifecycle, defence-in-depth, 2025–26 trends, frameworks, incident wall, readiness checklist |
| `/labs/prompt-injection` | **LangGraph** agent ⇄ tools loop: an email agent reads a poisoned email; toggle 5 defences (offline simulation without a key) |
| `/labs/human-in-the-loop` | **LangGraph** `interrupt()` + `MemorySaver` + `Command({resume})`: an ops agent with an autonomy dial, approve/edit/reject, hard guardrails (works without a key) |
| `/labs/runaway-agent` | Retry storms, ping-pong delegation and sub-agent explosions vs. budgets, a repetition detector, a depth limit and a kill switch |
| `/labs/policy-engine` | Policy-as-code (default deny, deny overrides) with 4 auto-graded challenges |
| `/labs/guardrails` | **LangGraph** parallel fan-out: PII, secrets and injection guards plus an LLM judge, joined by an aggregator |
| `/labs/red-team` | **LangGraph** VaultBot: 4 levels of defence (prompt → input guard → output canary + tool policy) |
| `/use-cases` | 9 industry scenarios with failure chains, controls, KPIs and a decision exercise |
| `/assistant` | "Sentinel": a guarded LangGraph tutor (input guard → tool-using tutor → output guard) with a visible trace |
| `/session` | 120-minute facilitator plan with a live session clock and a 10-question quiz |

## Code map

- `src/lib/agents/*` — LangGraph graphs (assistant, injection, hitl, guardrails, redteam)
- `src/app/api/*` — route handlers. They read the key from the `x-groq-key` header.
- `src/lib/content/*` — all teaching content (edit here to customise the session)
- `src/lib/guards.ts`, `src/lib/policy.ts` — deterministic detectors and the policy engine, shared by browser and server

## BYOK and security notes

- The key is stored only in the browser's `localStorage`. It is sent per request to this app's API routes, which pass it to Groq and never store or log it.
- The HITL lab keeps paused runs in an in-memory checkpointer. That is fine for a single server or a workshop. For serverless or multi-instance hosting, swap `MemorySaver` for a persistent checkpointer (e.g. Postgres).
- Recommend attendees use a throwaway key and revoke it after the session.
