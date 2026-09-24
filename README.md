# Naffo Marketplace

Official Claude Code plugins and skills for the **Naffo ERP** platform — sales,
purchases, accounting, inventory, GST, dairy procurement, production planning,
demand forecasting, inventory optimization, CRM, task management, and customer forms.

## Install

In Claude Code, run:

```
/plugin marketplace add naffotech/naffo-marketplace
/plugin install naffo
```

The plugin ships the Naffo MCP server, so there's no URL to copy. On first use
Claude Code signs you in to `https://naffo.tech/api/mcp` through your browser
(OAuth 2.1 with PKCE), and you approve the `read`, `write`, and `destructive`
scopes for your Naffo account. Run `/mcp` any time to check the connection or
re-authenticate.

**Installing the plugin does not sign you in.** Approving access is a separate
one-time step, and it's the one people miss:

- **Claude Code:** run `/mcp` → `naffo` → **Authenticate** → approve in the browser.
- **claude.ai (web / mobile / desktop):** Settings → Connectors → Naffo →
  **Connect** → approve in the browser.

If a tool ever answers "this connector requires authentication", that's all this
is — do the step above once. Full walkthrough: <https://naffo.tech/connect>

Verify:

```
Who am I in Naffo?
```

---

## What's inside

Version 1.13 adds Forms & Requests: reusable customer questionnaires, evidence-based
brief summaries, review and clarification workflows, and optional quotation,
customer, lead and project connections. It includes guidance for all 14 Forms MCP
tools and the quotation source handoff. Server rollout and appropriate permissions
are required before these tools appear; installing the skill does not deploy them.
Forms and existing ERP workflows also work independently, with AI optional.

### Plugin: `naffo`

| Component | What it does |
|---|---|
| Skill: **business-memory** | Remember and recall private or administrator-published business context, with source permissions, expiry and versioned corrections |
| Skill: **naffo-erp-guide** | Core tool usage rules — resolving parties/products before writes, required fields, dairy lifecycle order, report selection, safety rules |
| Skill: **naffo-management** | Day-to-day operations — invoices, payments, stock checks, dairy procurement, CRM follow-ups, financial reports |
| Skill: **forms-requests** | Build and publish customer questionnaires, summarize responses, review and request clarification, optionally prepare quotations or connect customers/leads/projects |
| Skill: **naffo-optimization** | Demand forecasting, the full forecast-to-order chain, production planning, inventory health, milk procurement optimization, anomaly detection |
| Skill: **month-end-close** | Month-end close checklist — reconcile, tax check, trial balance, anomaly scan, bank reconciliation |
| Skill: **monthly-digest** | Monthly snapshot — sales vs last month, top customers, expenses, anomaly alerts |
| Skill: **client-profitability** | Customer revenue ranking, slow-payer flags, concentration risk |
| Skill: **revenue-concentration** | Customer concentration risk with HHI score |
| Skill: **seasonal-patterns** | Monthly revenue seasonality — peak/trough index, cash planning |
| Skill: **runway-calculator** | Cash runway — burn rate, months of operation, three scenarios |
| Skill: **company-priorities** | Now/Next/Later company priorities, feedback loops, weekly reset + next-action highlighting |
| Skill: **process-operations** | Process templates, instances, stage advances, handoff/SLA aging (my ball, over SLA) + next-action highlighting |
| Skill: **india-gst** | India layer — GSTR-1/2B/3B mapping, ITC reconciliation, CGST-SGST vs IGST, HSN/GSTIN reading, e-invoice & e-way bill boundaries, April–March FY, lakh/crore formatting |
| Command: `/naffo-setup` | Quick-start connection guide |
| Command: `/naffo-forecast` | Demand forecast → cost-optimal order decision (full 12-step chain) |
| Command: `/naffo-analyze` | Full inventory health analysis (days of supply, expiry risk, reorder alerts) |
| Command: `/naffo-plan` | Create a production plan from demand + capacity constraints |

---

## Skills overview

### `naffo-erp-guide` — Core ERP Rules

The foundation skill. Load this (or let the agent auto-load it) for any Naffo
operation. Contains the golden write sequence, tool routing, required fields
for every write, dairy lifecycle order, and safety rules.

### `naffo-management` — Operational ERP

Handles everything that has **already happened** or needs to be **recorded now**.

Example prompts:
- *"What's my current stock of paneer?"*
- *"Create a sale invoice for Bhargav Dairy — 50 kg paneer at ₹320/kg, cash payment"*
- *"Show me overdue receivables older than 30 days"*
- *"Record a ₹45,000 payment to Raj Packaging"*
- *"What happened in dairy procurement today?"*
- *"Show me this month's P&L"*

### `forms-requests` — Customer Briefs & Optional Connections

Open **Forms & Requests** at [naffo.tech/forms](https://naffo.tech/forms).
Create a blank template or use the Product Development Brief starter, publish,
create a request, and copy its private customer invitation from the management
page. Customers save and submit their own responses; staff review them and may
connect business records. Creating a request does not send a message.

Example prompts:

- *"Create a reusable customer requirements form with contact details, scope, timeline and budget. Keep it standalone and save it as a draft."*
- *"Show submitted form requests and identify which need clarification."*
- *"Summarize this request using its field evidence and draft clarification questions without posting them."*
- *"Prepare a quotation from this request. Show the proposed details and ask me for missing commercial quantities and rates."*
- *"Connect this request to the existing CRM lead after resolving the lead."*

The assistant returns staff links, never private invitation credentials. Internal
notes stay separate from customer-visible messages. A target cost in a brief is
context, never an automatically assigned quotation price. Existing quotations
continue to work without a form. See [testing scenarios](TESTING.md#test-g--forms--requests)
for the complete workflow and deployment checks.

### `naffo-optimization` — Forecasting & Planning

Handles **forward-looking, analytical, and optimization** questions.

Example prompts:
- *"How much paneer should we produce next week?"*
- *"Forecast demand for our top 5 products for the next 30 days"*
- *"Kitna order karein SMP-500 ke liye?"*
- *"Create a milk procurement plan for tomorrow"*
- *"Which products are running low?"*
- *"Check for any anomalies in our sales or stock"*

### `india-gst` — India Compliance Layer

Loads on top of the core skills when your org profile has a **GSTIN**. The core
skills stay country-neutral; this one carries the Indian rules.

- GSTR-1 (outward) / GSTR-2B (ITC) / GSTR-3B mapping, and which Naffo report feeds which
- CGST + SGST vs IGST decided by place of supply, counterparty state read from the GSTIN
- ITC reconciliation in three buckets: in both, in Naffo only, in GSTR-2B only
- Post-GST-2.0 slabs (0 / 5 / 18 / 40) — rates always read from the item master, never assumed
- April–March financial year resolution for "this year" / "FY26" / "annual"
- Where the ERP stops: no IRN, e-way bill, or TDS filing tools — those go to the portal
- Indian formatting (₹12,34,567.89, lakh/crore) and festival/wedding/harvest seasonality

Example prompts:
- *"Reconcile our ITC for last month"*
- *"What's in GSTR-1 for September?"*
- *"Is this a CGST-SGST or IGST sale?"*
- *"Show me FY26 sales"*
- *"GST filing kab hai?"*

---

## Slash commands

```
/naffo-setup     — how to connect Naffo MCP to Claude Code
/naffo-forecast  — demand forecast for a product (prompts for details)
/naffo-analyze   — full inventory health check
/naffo-plan      — production plan from demand + BOMs + capacity
```

---

## Requirements

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) **or** any MCP-compatible agent
- A Naffo account with MCP access enabled (Settings → Integrations → MCP), and a
  role carrying the module permissions for what you ask the agent to do

## Other agents (ChatGPT, Gemini, Cursor, Windsurf)

Skills work with any agent that supports the `npx skills add` protocol or can
read SKILL.md files. See `agents.json` for full cross-agent compatibility details.

```bash
npx skills add naffotech/naffo-marketplace
```

---

## Updating

```
/plugin update naffo
```

---

## Contributing / Issues

Open an issue at [naffotech/naffo-marketplace](https://github.com/naffotech/naffo-marketplace)
or contact the Naffo team.

---

## License

MIT
