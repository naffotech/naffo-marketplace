# Naffo ERP — Claude Skills

This repository contains official Claude skills and plugins for the
[Naffo ERP](https://naffo.tech) platform.

## Install in Claude Code (full plugin)

```text
/plugin marketplace add naffotech/naffo-marketplace
/plugin install naffo
```

## Install skills only (any agent)

```bash
npx skills add naffotech/naffo-marketplace
```

## Connect your MCP server

Get your personal MCP URL from **naffo.tech → Settings → Integrations → MCP**.

```bash
claude mcp add naffo --transport http <your-mcp-url>
```

Verify:
```
Who am I in Naffo?
```

## Skills included

| Skill | What it does |
|---|---|
| `naffo-erp-guide` | Core ERP rules — correct tool usage, required fields, party/product resolution, dairy lifecycle, report selection, safety rules |
| `naffo-management` | Real-time operations — invoices, payments, stock, dairy procurement, CRM, tasks, financial reports |
| `naffo-optimization` | Forward-looking analytics — demand forecasting, production planning, inventory health, anomaly detection |
| `month-end-close` | Month-end close checklist — reconcile, GST check, trial balance, anomaly scan |
| `monthly-digest` | Monthly snapshot — sales vs last month, top customers, expenses, anomaly alerts |
| `client-profitability` | Customer revenue ranking, slow-payer flags, concentration risk |
| `revenue-concentration` | Customer concentration risk with HHI score |
| `seasonal-patterns` | Monthly revenue seasonality — peak/trough index, cash planning |
| `runway-calculator` | Cash runway — burn rate, months of operation, three scenarios |

## Skill locations

- Top-level (auto-detected by most CLIs): `skills/`
- Plugin-bundled (identical copies): `plugins/naffo/skills/`

## Slash commands (Claude Code plugin only)

| Command | What it does |
|---|---|
| `/naffo-setup` | Quick-start connection guide |
| `/naffo-forecast` | Demand forecast for a product |
| `/naffo-analyze` | Full inventory health analysis |
| `/naffo-plan` | Production plan from demand + constraints |

## Safety

Every financial write (invoice, payment, receipt) requires explicit user
confirmation. All writes are logged in naffo.tech's audit trail.
Never invent IDs, amounts, or dates — always resolve via read tools first.
