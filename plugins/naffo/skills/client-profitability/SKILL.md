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

Flag customers with invoices overdue beyond your standard credit terms
(default 30 days — adjust to your actual payment terms).

## Step 3b — Tally-accurate aging (if Tally is synced)

```
naffo_get_receivables_payables_ageing({ side: "AR" })    → age buckets from Tally
naffo_get_bill_wise_outstanding({ side: "AR" })          → bill-level open items
```

Use these for more accurate per-bill tracking when Tally sync is active.

## Output format

Use the org's currency symbol from `naffo_get_my_profile`. Replace `[curr]` with it below.

```
CLIENT PROFITABILITY — [Period]
══════════════════════════════════════════════════════════════
Rank  Customer        Revenue         Outstanding    Overdue  Risk
──────────────────────────────────────────────────────────────────
1     [Name]          [curr]XX,XXX    [curr]X,XXX    —        ✅ Low
2     [Name]          [curr]XX,XXX    [curr]XX,XXX   30d      ⚠️ Med
3     [Name]          [curr]XX,XXX    [curr]XXX       —        ✅ Low
──────────────────────────────────────────────────────────────────
TOTAL                 [curr]X,XX,XXX

Top 3 customers = XX% of revenue
Risk flags: [N] customers with overdue > [your credit terms]d
══════════════════════════════════════════════════════════════
```

## Risk scoring

These thresholds are starting points — calibrate to your industry and credit policy:

| Condition | Flag |
|---|---|
| Outstanding > 30% of 12-month revenue | ⚠️ High balance risk *(adjust % to your norms)* |
| Any invoice overdue > 60 days | 🔴 Collection risk *(adjust to your credit terms)* |
| Customer = >25% of total revenue | ⚠️ Concentration risk *(adjust to your risk appetite)* |
| Customer = >50% of total revenue | 🔴 Critical dependency *(adjust to your risk appetite)* |

## Recommended actions

- **Collection risk**: Flag for immediate follow-up via `naffo_log_followup_manual` or call
- **Concentration risk**: Recommend diversifying with at least 2 new customers of similar size
- **High balance**: Add to weekly review list; consider tightening credit terms (`creditDays`)

## Rules

- All amounts exactly as returned by tools — never re-round.
- Period defaults to last 12 months unless user specifies.
- Only include customers with at least one invoice in the period.
