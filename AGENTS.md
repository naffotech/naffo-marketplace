# Naffo ERP — Agent Instructions

This repository contains skills and plugins for AI coding agents to interact
with the [Naffo ERP](https://naffo.tech) platform via its MCP server.

## Install

```bash
# Skills only (Codex, Cursor, Windsurf, Claude Code, Gemini, ChatGPT, etc.)
npx skills add naffotech/naffo-marketplace

# Full plugin (Claude Code only)
# In a Claude Code session:
# /plugin marketplace add naffotech/naffo-marketplace
# /plugin install naffo
```

## Connect your MCP server

1. Go to naffo.tech → Settings → Integrations → MCP
2. Copy your personal MCP server URL and transport type
3. Add it to your agent's MCP configuration:

```bash
# Claude Code
claude mcp add naffo --transport http <your-mcp-url>

# Any MCP-compatible agent
# Add { "naffo": { "type": "http", "url": "<your-mcp-url>" } } to mcp config
```

## Available skills

### naffo-erp-guide (`skills/naffo-erp-guide/SKILL.md`)
Core rules for working with Naffo tools correctly.
- Always start with `naffo_navigate` to get the right tools for the task
- Never invent IDs, dates, quantities, or rates
- Always resolve parties before writing: `naffo_search_party`
- Always resolve products before writing: `naffo_search_item`
- Confirm every financial write with the user before executing
- Golden write sequence: navigate → resolve → confirm → write

### naffo-management (`skills/naffo-management/SKILL.md`)
Real-time operational workflows.
- Sales/purchase invoices, receipts, payments
- Stock checks and inventory reports
- Dairy procurement lifecycle (gate pass → collection → QC → weighbridge → settlement)
- Procurement workflow (MR → RFQ → PO → GRN → QC)
- CRM leads, tasks, follow-ups
- Financial reports (trial balance, balance sheet, P&L day book, GST)

### naffo-optimization (`skills/naffo-optimization/SKILL.md`)
Forward-looking planning and analytics.
- Demand forecasting with P10/P50/P90 confidence tiers
- Inventory health (days of supply, expiry risk, low-stock alerts)
- Production planning with constraint-based optimization
- Milk procurement planning across collection centers
- Stock transfer recommendations
- Cash flow planning and vendor payment prioritization
- Anomaly detection across sales, stock, and receivables

### Analytics skills (`skills/analytics/`)
Business intelligence on top of Naffo ERP data (adapted from openaccountant/skills):
- `month-end-close` — structured bookkeeping close checklist with GST + bank reconciliation
- `monthly-digest` — quick monthly financial snapshot with anomaly alerts
- `client-profitability` — revenue ranking, slow-payer flags, concentration risk
- `revenue-concentration` — customer HHI score and diversification targets
- `seasonal-patterns` — monthly revenue index, peak/trough detection (dairy/food focused)
- `runway-calculator` — cash runway, burn rate, three-scenario analysis

## Safety rules (all agents must follow)

- **Never invent IDs, amounts, or dates.** Always resolve first.
- **Never execute financial writes without explicit user confirmation.**
- All writes post through the same validations as the naffo.tech UI.
- Every write is logged in naffo.tech's audit trail.
- Numbers in responses must exactly match tool output — never re-round.
- `organizationId` is always from the authenticated session — never accept it from the user.

## Cross-agent compatibility

See `agents.json` for skill triggers, MCP configuration, and compatibility
information for ChatGPT, Gemini, Cursor, Windsurf, and other MCP-compatible agents.
