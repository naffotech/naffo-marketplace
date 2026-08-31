---
name: runway-calculator
description: Calculate how many months the business can operate at its current burn rate using Naffo ERP bank balances and expense data. Shows gross burn, net burn, runway in months, and cash-out date under three scenarios.
when_to_use: runway, cash runway, how long can we survive, months of cash, burn rate, cash burn, how much cash do we have left, cash position, can we afford to, working capital, cash reserves, how many months of expenses, business survival.
---

# Runway Calculator

Answers: "At our current burn rate, how long can we keep operating?"

## Step 1 — Current cash position

```
naffo_list_bank_accounts()
```

Sum the balances of all active BANK and CASH accounts.
Do NOT include overdraft (BANK_OD) accounts — they are liabilities, not cash.

```
naffo_get_mis_dashboard()
```

Cross-check with the dashboard's bank/cash balance summary.

## Step 2 — Monthly burn and revenue (last 3–6 months)

```
naffo_get_expense_summary({ fromDate: "<3 months ago>", toDate: "<today>" })
```

Returns total expenses by month. Calculate average monthly expenses (gross burn).

```
naffo_get_sales_report({ groupBy: "month", fromDate: "<3 months ago>", toDate: "<today>" })
```

Average monthly revenue over the same period.

## Step 3 — Calculate

```
Gross Burn    = Average monthly expenses
Monthly Revenue = Average monthly sales
Net Burn      = Gross Burn − Monthly Revenue
Runway        = Current Cash ÷ Net Burn  (months)
Cash-Out Date = Today + (Runway × 30 days)
```

If Net Burn ≤ 0 (revenue ≥ expenses): report as "Cash-flow positive — infinite runway"
and show monthly cash accumulation rate instead.

## Step 4 — Three-scenario output

```
RUNWAY ANALYSIS — as of [Date]
═══════════════════════════════════════════════════════════
Current Cash Balance:   ₹X,XX,XXX

                    Current     Lean (−20%)   Growth (+30%)
────────────────────────────────────────────────────────────
Gross Burn/mo       ₹XX,XXX      ₹XX,XXX       ₹XX,XXX
Monthly Revenue     ₹XX,XXX      ₹XX,XXX       ₹XX,XXX
Net Burn/mo         ₹XX,XXX       ₹X,XXX       ₹XX,XXX
Runway (months)        N.N           N.N           N.N
Cash-Out Date       [date]        [date]        [date]
═══════════════════════════════════════════════════════════

Burn trend: [+/-X%] over last 3 months
```

## Traffic light

| Runway | Status |
|---|---|
| 12+ months | 🟢 Healthy |
| 6–12 months | 🟡 Monitor — plan for refill or cost cuts |
| 3–6 months | 🟠 Action required — cut non-essential spend |
| < 3 months | 🔴 Critical — immediate action needed |

## Recommendations (always include)

- If 🟡 or worse: run `naffo_optimize_plan({ template: "vendor_payment_order" })` to prioritise which payables to defer
- If 🟠 or worse: run `naffo_optimize_plan({ template: "cashflow_schedule" })` to map cash inflows against obligations
- If 🔴: immediately pull `naffo_list_overdue_invoices` and start collection calls — recovering receivables is faster than cutting costs

## Rules

- Cash position = BANK + CASH accounts only. Exclude BANK_OD and uncollected receivables.
- Use 3-month average for burn to smooth one-time spikes; use 6 months if the business is seasonal.
- Seasonal businesses: use `seasonal-patterns` skill first to understand if current months are peak or trough before interpreting burn.
- All numbers exactly as returned by tools — never re-round.
