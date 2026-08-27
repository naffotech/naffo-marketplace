# Naffo ERP — Agent Instructions

This repository contains skills and plugins for AI coding agents to interact
with the [Naffo ERP](https://naffo.tech) platform via its MCP server.

## Install

```bash
# Skills only (Codex, Cursor, Windsurf, Claude Code, etc.)
npx skills add naffotech/naffo-marketplace

# Full plugin (Claude Code only)
# In a Claude Code session:
# /plugin marketplace add naffotech/naffo-marketplace
# /plugin install naffo
```

## Available skills

### naffo-erp-guide (`skills/naffo-erp-guide/SKILL.md`)
Core rules for working with Naffo tools correctly.
- Never invent IDs, dates, quantities, or rates
- Always resolve parties before writing: `naffo_search_party`
- Always resolve products before writing: `naffo_search_item`
- Confirm every financial write with the user before executing
- Golden tool sequence: navigate → read → confirm → write

### naffo-management (`skills/naffo-management/SKILL.md`)
Real-time operational workflows.
- Sales/purchase invoices, receipts, payments
- Stock checks, inventory transfers
- Dairy procurement lifecycle (gate pass → QC → weighbridge → settlement)
- CRM leads, tasks, follow-ups
- Financial reports (P&L, balance sheet, trial balance, GST)

### naffo-optimization (`skills/naffo-optimization/SKILL.md`)
Forward-looking planning and analytics.
- Demand forecasting with confidence tiers
- Production planning and BOM-aware scheduling
- Stock transfer recommendations across outlets
- Cash flow planning and vendor payment prioritisation
- Anomaly detection across sales, stock, and receivables

## Connecting to Naffo MCP

1. Go to naffo.tech → Settings → Integrations → MCP
2. Copy your personal MCP server URL and transport type
3. Add it to your agent's MCP configuration

## Safety rules (all agents must follow)

- **Never invent IDs, amounts, or dates.** Always resolve first.
- **Never execute financial writes without explicit user confirmation.**
- All writes post through the same validations as the naffo.tech UI.
- Every write is logged in naffo.tech's audit trail.
- Numbers in responses must exactly match tool output — never re-round.
