---
name: revenue-concentration
description: Measure how dependent the business is on a small number of customers. Calculates each customer's revenue share, flags dangerous concentration, and recommends diversification targets — using Naffo ERP sales data.
when_to_use: revenue concentration, customer concentration, business risk, dependency on one customer, top customer share, HHI, diversification, what percentage of revenue comes from one customer, client risk, revenue risk, single customer dependency.
---

# Revenue Concentration Risk

Measures how dependent the business is on a small number of customers.
A single large customer loss can be existential — this skill quantifies that risk.

## Step 1 — Revenue by customer (12 months)

```
naffo_get_sales_report({
  groupBy:  "customer",
  fromDate: "<12 months ago>",
  toDate:   "<today>",
})
```

Returns total revenue per customer. Sort descending.

## Step 2 — Calculate concentration

For each customer:
```
Revenue Share (%) = Customer Revenue / Total Revenue × 100
```

Compute the **Herfindahl-Hirschman Index (HHI)**:
```
HHI = Σ (each customer's share %)²
```

## Step 3 — Output

Use the org's currency symbol from `naffo_get_my_profile`. Replace `[curr]` with it below.

```
REVENUE CONCENTRATION — [Period]
══════════════════════════════════════════════════════
Customer         Revenue          Share    Cumulative
──────────────────────────────────────────────────────
[Name]           [curr]XX,XXX     40%      40%
[Name]           [curr]XX,XXX     25%      65%
[Name]           [curr]XX,XXX     15%      80%
[Others]         [curr]XX,XXX     20%      100%
──────────────────────────────────────────────────────
Total            [curr]X,XX,XXX   100%

HHI Score:         [value]
Concentration:     LOW / MODERATE / HIGH
Top customer:      [name] at [X]%
Top 3 customers:   [X]% of revenue
══════════════════════════════════════════════════════
```

## HHI thresholds

| HHI | Level | What it means |
|---|---|---|
| < 1,500 | Low | 7+ roughly equal customers — healthy |
| 1,500–2,500 | Moderate | 3–6 customers dominate — manageable |
| > 2,500 | High | 1–2 customers dominate — risky |

## Risk flags

These thresholds are starting points — calibrate to your industry and risk appetite:

| Condition | Flag |
|---|---|
| Any single customer > 25% | ⚠️ Key-account risk *(adjust to your comfort level)* |
| Any single customer > 40% | 🔴 Critical dependency *(adjust to your comfort level)* |
| Top 3 customers > 70% | ⚠️ Concentrated portfolio *(adjust to your comfort level)* |

## Recommended actions per risk level

- **Low**: No action needed. Monitor quarterly.
- **Moderate**: Actively pursue 2–3 new customers of similar size this quarter.
- **High**: Immediate diversification priority. Set a target for maximum single-customer share (common benchmark: 20–25%) and a timeline to reach it.

## Rules

- Use 12 months minimum for meaningful analysis. Shorter periods distort results.
- All revenue figures exactly as returned by `naffo_get_sales_report` — never re-round.
- If any customer name is ambiguous (multiple parties with similar names), resolve with `naffo_search_party` before including.
