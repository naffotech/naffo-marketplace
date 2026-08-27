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

## Skills included

| Skill | What it does |
|---|---|
| `naffo-erp-guide` | Core ERP rules — invoices, payments, GST, dairy procurement, reports |
| `naffo-management` | Real-time operations — record transactions, check stock, CRM, tasks |
| `naffo-optimization` | Forward-looking — demand forecasting, production planning, anomaly detection |

## Skill locations

- Top-level (auto-detected by most CLIs): `skills/`
- Plugin-bundled: `plugins/naffo/skills/`

## MCP connection

Get your personal MCP URL from naffo.tech:
**Settings → Integrations → MCP**

Then connect:
```bash
claude mcp add naffo --transport <type> <your-mcp-url>
```

## Safety

Every financial write (invoice, payment, receipt) requires explicit user
confirmation. All writes are logged in naffo.tech's audit trail.
Never invent IDs, amounts, or dates — always resolve via read tools first.
