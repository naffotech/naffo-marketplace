---
name: monthly-digest
description: Generate a concise monthly financial digest from Naffo ERP — sales vs last month, top customers, expense breakdown, anomaly alerts, and one recommended action. A quick "state of business" snapshot.
when_to_use: monthly digest, monthly summary, how did we do this month, business summary, monthly review, month overview, sales summary, expense summary, monthly report, financial snapshot, how is business going.
---

# Monthly Digest

Produces a "state of business" snapshot for any calendar month in under 5 minutes.

## Step 1 — MIS dashboard

```
naffo_get_mis_dashboard()
```

Captures: today's sales, this-month sales, total receivables, total payables,
bank/cash balance. Use as the headline numbers.

## Step 2 — Sales breakdown

```
naffo_get_sales_report({ groupBy: "customer", fromDate, toDate })
naffo_get_sales_report({ groupBy: "product",  fromDate, toDate })
```

Find top 5 customers and top 5 products by revenue for the month.
Then pull prior month with the same call to calculate month-over-month change.

## Step 3 — Expense breakdown

```
naffo_get_expense_summary({ fromDate, toDate })
```

Returns totals by category and payment mode. Flag any category that jumped
more than 20% vs the prior month.

## Step 4 — Anomaly scan

```
naffo_detect_anomalies({
  domains:       ["sales", "stock", "receivables"],
  lookback_days: 30,
  baseline_days: 90,
})
```

Include HIGH and MEDIUM anomalies in the digest with their `suggested_action`.

## Step 5 — Overdue receivables

```
naffo_list_overdue_invoices()
```

Total overdue amount and count. Flag any party overdue more than 60 days.

## Digest output format

```
# Monthly Digest — [Month Year]

## Key Numbers
| Metric              | This Month | Last Month | Change  |
|---------------------|------------|------------|---------|
| Sales               | ₹XX,XXX    | ₹XX,XXX    | +/-XX%  |
| Expenses            | ₹XX,XXX    | ₹XX,XXX    | +/-XX%  |
| Net                 | ₹XX,XXX    | —          | —       |
| Receivables (total) | ₹XX,XXX    | —          | —       |
| Overdue (>30d)      | ₹X,XXX     | —          | —       |

## Top 5 Customers (by sales)
1. [Name] — ₹X,XXX
...

## Top 5 Products
1. [Product] — X units / ₹X,XXX
...

## Expense Highlights
| Category        | Amount    | vs Last Month |
|-----------------|-----------|---------------|
| [Category]      | ₹X,XXX    | +/-XX%        |

## Anomalies & Alerts
- ⚠️ [description] → [suggested_action]

## One Recommended Action
[Most important thing to do this week based on the data]
```

## Rules

- Numbers must come from tool output — never estimate or invent.
- Always state the month and date range clearly.
- Reply in the user's language (Hindi / Gujarati / English / Hinglish).
- The "One Recommended Action" must be grounded in the data (e.g. biggest overdue customer, biggest expense spike, low stock).
