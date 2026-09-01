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

Naffo's MCP endpoint is a single shared OAuth 2.1 resource — there is no per-user
URL and no token to paste. Clients discover the authorization server from
`https://naffo.tech/.well-known/oauth-protected-resource` and sign the user in
through the browser (PKCE, dynamic client registration). Scopes: `read`, `write`,
`destructive`.

```bash
# Claude Code (the naffo plugin already bundles this server)
claude mcp add naffo --transport http https://naffo.tech/api/mcp

# Any MCP-compatible agent
# Add { "naffo": { "type": "http", "url": "https://naffo.tech/api/mcp" } } to mcp config
```

Unauthenticated `tools/list` works for catalog discovery; every tool call requires
a token. Each tool declares its own `requiredScope` (`read` / `write` /
`destructive`) and `accessPolicy`.

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
Forward-looking planning and analytics — now includes the complete forecast-to-order chain:
- Demand character analysis: rolling stats, lags, YoY growth, India calendar flags, demand pattern (STABLE/TREND/FESTIVAL_DRIVEN/VOLATILE) — `naffo_get_demand_features`
- Trend direction across monthly periods (GROWTH/FLAT/DECLINE) — `naffo_get_demand_trend`
- Structural demand drop guard — detects lost customers/discontinued lines before over-ordering — `naffo_detect_changepoint`
- Probabilistic forecast with P10/P50/P90 confidence tiers — `naffo_forecast_demand`
- AR-1 corrected uncertainty bands (fixes naive range overstatement by 40–80%) — `naffo_aggregate_forecast_range`
- Cost-optimal order quantity via newsvendor model (critical ratio, Cu/Co) — `naffo_newsvendor_order_qty`
- Business guardrails: MOQ, stockout urgency, approval gates, do-not-order check — `naffo_harden_order_decision`
- Three-scenario comparison (LOW/EXPECTED/HIGH) for owner decision — `naffo_forecast_scenarios`
- Inventory health (days of supply, expiry risk, low-stock alerts)
- Production planning with constraint-based optimization (8 templates via `naffo_optimize_plan`)
- Shift scheduling and delivery routing via CP-SAT — `naffo_optimize_custom`
- Customer churn risk, SKU wastage risk, supplier delivery risk — `naffo_get_business_intel`
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

### India layer (`skills/regional/india-gst/SKILL.md`)
Loads only when `naffo_get_my_profile` returns a GSTIN — the core skills stay
country-neutral.
- GST return mapping: GSTR-1 (outward), GSTR-2B (ITC), GSTR-3B, GSTR-9, CMP-08
- CGST + SGST vs IGST from place of supply; counterparty state from the GSTIN prefix
- ITC reconciliation buckets: in both / in Naffo only / in GSTR-2B only
- Post-GST-2.0 slabs (0/5/18/40) — read from the item master, never assumed
- April–March financial year resolution; `GST_FILED` invoices are amendments, not edits
- Boundaries: no IRN, e-way bill, or income-tax TDS tools exist — route to the portal/CA
- Indian formatting (lakh/crore) and festival/wedding/harvest seasonality

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
