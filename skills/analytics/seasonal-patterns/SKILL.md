---
name: seasonal-patterns
description: Detect monthly revenue and expense seasonality using 12–24 months of Naffo ERP sales data. Calculates a seasonal index per month, identifies peak and trough periods, and gives cash planning recommendations — especially useful for dairy and food businesses.
when_to_use: seasonal patterns, seasonality, which month is best, peak month, slow season, seasonal revenue, monthly trends, revenue trend, best time of year, festival season impact, Diwali sales, seasonal demand, seasonal analysis, revenue cycle, monthly sales pattern.
---

# Seasonal Pattern Analysis

Reveals which months are strong and which are slow — critical for dairy, food,
and agricultural businesses with festival-driven or harvest-linked demand.

## Step 1 — Monthly revenue (12–24 months)

```
naffo_get_sales_report({
  groupBy:  "month",
  fromDate: "<24 months ago>",
  toDate:   "<today>",
})
```

Minimum 12 months. 24+ months gives statistical confidence to distinguish
genuine seasonal patterns from one-time events.

## Step 2 — Monthly expenses

```
naffo_get_expense_summary({ fromDate: "<month start>", toDate: "<month end>" })
```

Run for each month in the window (or use day book summaries). Build a monthly
expense series to detect expense seasonality (festival bonuses, insurance renewals, etc.).

## Step 3 — Calculate seasonal index

```
Average Monthly Revenue = Total Revenue / Number of Months
Seasonal Index (month) = Month Revenue / Average Monthly Revenue × 100
```

- Index > 100 → above-average month
- Index < 100 → below-average month
- Seasonal Range = Peak Index − Trough Index

## Step 4 — Output

```
SEASONAL PATTERN — [Period]
══════════════════════════════════════════════════════════
Month   Avg Revenue   Index   Avg Expense   Pattern
──────────────────────────────────────────────────────────
Jan     ₹X,XX,XXX       82    ₹XX,XXX       Slow start
Feb     ₹X,XX,XXX       78    ₹XX,XXX       ▼ Trough
Mar     ₹X,XX,XXX       95    ₹XX,XXX       Recovering
Apr     ₹X,XX,XXX      105    ₹XX,XXX       ▲ Above avg
...
Oct     ₹X,XX,XXX      130    ₹XX,XXX       ▲▲ Diwali peak
Nov     ₹X,XX,XXX      118    ₹XX,XXX       ▲ Above avg
Dec     ₹X,XX,XXX       90    ₹XX,XXX       Cooling
──────────────────────────────────────────────────────────
Peak:   [Month] (Index [N])    Trough: [Month] (Index [N])
Range:  [N] points — [Low / Moderate / High] seasonality
══════════════════════════════════════════════════════════
```

## Seasonality classification

| Range | Level | Implication |
|---|---|---|
| < 20 points | Low | Revenue is stable month-to-month |
| 20–50 points | Moderate | Noticeable cycles — plan cash accordingly |
| > 50 points | High | Significant peaks and troughs — critical to plan |

## Actionable recommendations (always include)

- **Cash reserves**: Build during peak months (Index > 120) to fund trough months
- **Procurement timing**: Place large raw material orders before peak demand months
- **Hiring / capacity**: Staff up 4–6 weeks before peak; plan maintenance during trough
- **Promotions**: Run discount campaigns during trough months (Index < 85) to smooth revenue

## Rules

- Need at least 12 months. If < 12 months: tell the user and do not compute an index.
- With exactly 12 months: caveat that one-time events (new customer, closure) can distort the pattern.
- Overlay seasonal patterns with `naffo_forecast_demand` results (from naffo-optimization skill) for the most accurate demand planning.
- Always call out the Diwali / festival window explicitly for Indian dairy and food businesses.
