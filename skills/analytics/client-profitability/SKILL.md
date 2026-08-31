---
name: client-profitability
description: Analyze revenue, outstanding balances, and payment behavior per customer in Naffo ERP to find your most and least profitable accounts. Ranks customers by revenue, flags slow payers, and identifies concentration risk.
when_to_use: client profitability, customer profitability, best customers, which customer is most profitable, top customers, customer revenue analysis, customer ranking, who pays on time, customer analysis, party analysis, best party.
---

# Client Profitability Analysis

Ranks customers by revenue and flags high-risk accounts (slow payers, concentrated revenue) using Naffo ERP data.

## Step 1 — Revenue by customer

```
naffo_get_sales_report({
  groupBy:  "customer",
  fromDate: "<period start>",
  toDate:   "<period end>",
})
```

Ask for the period (default: last 12 months). Returns revenue total per customer.

## Step 2 — Outstanding balances

```
naffo_get_party_outstandings({ type: "CUSTOMER" })
```

Cross-reference each customer's outstanding balance against their total revenue.
High outstanding / revenue ratio = payment risk.

## Step 3 — Overdue check

```
naffo_list_overdue_invoices()
```

Flag customers with invoices overdue > 30 days.

## Step 3b — Tally-accurate aging (if Tally is synced)

```
naffo_get_receivables_payables_ageing({ side: "AR" })    → age buckets from Tally
naffo_get_bill_wise_outstanding({ side: "AR" })          → bill-level open items
```

Use these for more accurate per-bill tracking when Tally sync is active.

## Output format

```
CLIENT PROFITABILITY — [Period]
══════════════════════════════════════════════════════════════
Rank  Customer        Revenue    Outstanding  Overdue  Risk
──────────────────────────────────────────────────────────────
1     [Name]          ₹XX,XXX    ₹X,XXX       —        ✅ Low
2     [Name]          ₹XX,XXX    ₹XX,XXX      30d      ⚠️ Med
3     [Name]          ₹XX,XXX    ₹XXX          —        ✅ Low
──────────────────────────────────────────────────────────────
TOTAL                 ₹X,XX,XXX

Top 3 customers = XX% of revenue
Risk flags: [N] customers with overdue > 30d
══════════════════════════════════════════════════════════════
```

## Risk scoring

| Condition | Flag |
|---|---|
| Outstanding > 30% of 12-month revenue | ⚠️ High balance risk |
| Any invoice overdue > 60 days | 🔴 Collection risk |
| Customer = >25% of total revenue | ⚠️ Concentration risk |
| Customer = >50% of total revenue | 🔴 Critical dependency |

## Recommended actions

- **Collection risk**: Flag for immediate follow-up via `naffo_log_followup_manual` or call
- **Concentration risk**: Recommend diversifying with at least 2 new customers of similar size
- **High balance**: Add to weekly review list; consider tightening credit terms (`creditDays`)

## Rules

- All amounts exactly as returned by tools — never re-round.
- Period defaults to last 12 months unless user specifies.
- Only include customers with at least one invoice in the period.
