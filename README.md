# Naffo Marketplace

Official Claude Code plugins and skills for the **Naffo ERP** platform — sales,
purchases, accounting, inventory, GST, dairy procurement, production planning,
demand forecasting, inventory optimization, CRM, and task management.

## Install

In Claude Code, run:

```
/plugin marketplace add naffotech/naffo-marketplace
/plugin install naffo
```

Then connect your Naffo MCP server (Settings → Integrations → MCP in your
Naffo account) and verify the connection:

```
Who am I in Naffo?
```

---

## What's inside

### Plugin: `naffo`

| Component | What it does |
|---|---|
| Skill: **naffo-erp-guide** | Core tool usage rules — resolving parties/products before writes, required fields, dairy lifecycle order, report selection, safety rules |
| Skill: **naffo-management** | Day-to-day operations — invoices, payments, stock checks, dairy procurement, CRM follow-ups, financial reports |
| Skill: **naffo-optimization** | Demand forecasting, production planning, inventory health, milk procurement optimization, anomaly detection |
| Command: `/naffo-setup` | Quick-start connection guide |
| Command: `/naffo-forecast` | Instant demand forecast for a product |
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

### `naffo-optimization` — Forecasting & Planning

Handles **forward-looking, analytical, and optimization** questions.

Example prompts:
- *"How much paneer should we produce next week?"*
- *"Forecast demand for our top 5 products for the next 30 days"*
- *"Kitna order karein SMP-500 ke liye?"*
- *"Create a milk procurement plan for tomorrow"*
- *"Which products are running low?"*
- *"Check for any anomalies in our sales or stock"*

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
- A Naffo account with MCP access enabled (Settings → Integrations → MCP)

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
