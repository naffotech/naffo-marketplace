# Naffo ERP — GitHub Copilot Instructions

This repository contains skills and instructions for working with the
[Naffo ERP](https://naffo.tech) platform via its MCP server.

## Context

Naffo is a full-stack ERP covering:
- Sales invoicing & collections
- Purchase bills & vendor payments
- Inventory, stock transfers, batch tracking
- Dairy procurement (collection → gate pass → QC → weighbridge → settlement)
- Accounting (P&L, balance sheet, GST, trial balance)
- CRM leads, tasks, and follow-ups

## Skills in this repo

Load these files for domain context:

| File | Use when |
|---|---|
| `skills/naffo-erp-guide/SKILL.md` | Any Naffo ERP task — load always |
| `skills/naffo-management/SKILL.md` | Recording transactions, checking data |
| `skills/forms-requests/SKILL.md` | Customer questionnaires, brief summaries, review and optional quotation/customer/lead/project connections |
| `skills/naffo-optimization/SKILL.md` | Forecasting, planning, anomaly detection |
| `skills/regional/india-gst/SKILL.md` | GST, ITC, e-way bill, HSN, Indian FY (org has a GSTIN) |

## Install

```bash
npx skills add naffotech/naffo-marketplace
```

## Critical rules

- **Resolve before writing**: use the relevant read tools for every referenced
  record; call `naffo_search_party` and `naffo_search_item` when parties or products
  are involved. Standalone forms do not require a party or product. Never guess IDs.
- **Confirm before money moves**: show the user exactly what will happen
  and wait for explicit confirmation before any invoice, payment, or receipt.
- **Never alter tool output numbers**: present figures exactly as returned.
- **idempotencyKey required** on all write tools — format:
  `{operation}-{YYYYMMDD}-{short-description}`

## More information

Full setup guide: https://naffo.tech/claude
Marketplace source: https://github.com/naffotech/naffo-marketplace
