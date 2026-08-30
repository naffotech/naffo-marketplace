---
name: naffo-optimization
description: Demand forecasting, production planning, inventory optimization, stock transfer recommendations, constraint-based allocation, cash flow planning, and anomaly detection using Naffo ERP data combined with the Naffo Predict Engine and Naffo Optimizer. Use this skill when the user asks what they *should do next* — how much to produce, what to order, where to transfer stock, what the demand outlook looks like, or whether anything looks wrong.
when_to_use: Demand forecast, production plan, what should I produce, how much to order, inventory health, stock analysis, days of supply, low stock alert, which outlet needs stock, cash flow planning, vendor payment priority, anomaly detection, something looks off, kitna banana chahiye, kitna order karein, reorder, overstock, expiry risk, optimize procurement, milk procurement planning.
---

# Naffo Optimization & Planning

Handles **forward-looking, analytical, and optimization** questions using the
Naffo Predict Engine (probabilistic forecasting) and Naffo Optimizer
(constraint-based planning). Always data-driven — never estimates.

---

## Mental model

```
Understand scope → Check data quality → Gather signals → Forecast / Optimize → Present with confidence
```

---

## Step A — Understand scope (always first)

Clarify before computing. Ask **ONE** question if vague:

- **What product(s)?** → `naffo_search_item` to resolve names to ids
- **Which location?** → warehouse / outlet / all
- **How far ahead?** → default **30 days**
- **What is the goal?** → forecasting, optimization, or anomaly detection

---

## Step B — Check data quality before forecasting

```
naffo_check_forecast_readiness({ product_ids: [...] })
```

| Status | Action |
|--------|--------|
| `READY` | Proceed to forecast |
| `THIN` | Forecast with LOW confidence — tell the user |
| `STALE` | Verify no missing data — forecast with caution |
| `NO_DATA` | Cannot forecast — ask user to record more sales first |

**Never skip this step.** A VERY_LOW confidence forecast from stale data is
worse than saying "not enough data."

---

## Step C — Before forecasting: ask exactly 2 questions

Ask these in **one message** (not separately):

**Q1 — Context:** "Is there anything happening in the forecast window?
  (A) Festival / event demand boost expected
  (B) Planned discount or promotion
  (C) Nothing special"

**Q2 — Service level:** "What's your priority?
  (A) Never run out — HIGH (covers 95% of scenarios)
  (B) Balanced — MEDIUM (covers 80%)
  (C) Minimize overstock — LOW (covers 65%)"

Map answers to:
- Q1(A) → `festival_boost: true`
- Q1(B) → `planned_discount: <fraction>` (ask the discount %)
- Q2(A) → `service_level: "HIGH"`
- Q2(B) → `service_level: "MEDIUM"`
- Q2(C) → `service_level: "LOW"`

---

## Step D — Get the demand series

Before running the full forecast, optionally pull the raw history:

```
naffo_get_demand_series({
  product_id:  "...",
  days:        365,          // history window
  as_of_date:  "YYYY-MM-DD"
})
```

Returns daily aggregated sales quantity + data quality metadata (freshness,
gaps, average daily demand). Use this to pre-check data and explain confidence.

---

## Step E — Run the forecast

```
naffo_forecast_demand({
  product_ids:      [...],
  horizon_days:     30,           // or what user specified
  festival_boost:   true,         // from Q1
  planned_discount: 0.20,         // from Q1 if promo (as a fraction)
  service_level:    "MEDIUM",     // from Q2
  history_days:     365,          // optional — how far back to train
})
```

**Handling confidence tiers:**

| Tier | What to say |
|------|-------------|
| `HIGH` | Present numbers directly |
| `MEDIUM` | "Based on partial data — reasonable estimate" |
| `LOW` | "⚠️ Statistical estimate only. Verify before ordering." |
| `VERY_LOW` | "⚠️ Forecasting engine unavailable — rough estimate. Do not place large orders based on this alone." |

**Always show confidence tier to the user.** Never hide a LOW or VERY_LOW result.

**If `fallback_reason` is set:** mention it plainly.
"The predictive engine was unavailable — this is a statistical estimate."

---

## Step F — Supply signal

```
naffo_get_product_forecast_context({ product_id: "..." })
```

Returns: current stock, pending supply, lead time, cost, price.

Compute gap:
```
gap = expected_demand (p50_total) − stock_on_hand − pending_supply_qty
```

- `gap > 0` → **shortfall** (order or produce)
- `gap < 0` → **surplus** (hold or reduce)

Also use `naffo_get_stock_on_hand` directly for current quantity per product,
and `naffo_get_stock_report` for stock movement or low-stock list.

---

## Step G — Before optimization: ask exactly 2 questions

For multi-product or constrained planning, ask in **one message**:

**Q1 — Objective:** "What matters most?
  (A) Maximize profit margin
  (B) Meet all demand (minimize stockout)
  (C) Minimize cost / spending
  (D) Maximize production volume"

**Q2 — Hard constraints:** "Any limits I must respect?
  (A) Budget cap: ₹___
  (B) Machine / production hours: ___ hours
  (C) Storage / vehicle capacity: ___ units
  (D) No hard limit"

---

## Step H — Optimization templates

Choose the right template based on the business question:

| Question | Template |
|----------|----------|
| "₹X budget — what to buy, how much?" | `order_allocation` |
| "What to produce this week given capacity?" | `production_plan` |
| "Move stock between warehouses / outlets?" | `stock_transfer` |
| "How much milk to accept from each center?" | `milk_procurement` |
| "What to send to each outlet?" | `outlet_replenishment` |
| "Which vendor payments to clear now?" | `cashflow_schedule` or `vendor_payment_order` |
| "Which overdue customers to call first?" | `collection_priority` |

```
naffo_optimize_plan({
  template: "<chosen template>",
  data:     { ...template payload... },
  budget:   500000,               // shorthand for data.budget
})
```

**Handling optimizer status:**

| Status | What to say |
|--------|-------------|
| `OPTIMAL` | "✅ Optimal solution found — this is the best possible plan." |
| `FEASIBLE` | "⚠️ Good solution found, but may not be optimal — constraints were tight." |
| `INFEASIBLE` | "❌ No feasible solution — constraints conflict. [Show conflict_hints]." |
| `ERROR` | "Optimizer unavailable — [show warning]. Plan manually or try again." |

**INFEASIBLE is not a failure** — it is useful information. Report the conflict
exactly. Never fake a result or skip the infeasible message.

---

## Dairy milk procurement planning

For dairy businesses planning how much milk to accept from collection centers:

```
naffo_optimize_plan({
  template: "milk_procurement",
  data: {
    centers: [
      { center_id: "...", available_litres: 500, fat_pct: 3.8, rate_per_litre: 32 },
      ...
    ],
    tank_capacity_litres: 2000,
    budget: 65000               // optional
  }
})
```

For the actual dairy procurement cycle execution (gate pass → QC → weighbridge
→ settlement), follow the **naffo-management** skill's dairy procurement section.

---

## Anomaly detection flow

When the user says "something looks off" or "check for problems":

```
naffo_detect_anomalies({
  domains:       ["sales", "stock", "receivables"],
  lookback_days: 30,
  baseline_days: 90,
})
```

Present findings grouped by severity:
- **HIGH** → "Needs immediate attention"
- **MEDIUM** → "Worth investigating"
- **LOW** → "Monitor"

Always show `suggested_action` for each anomaly.

---

## Inventory health analysis (manual)

When `naffo_detect_anomalies` isn't available or the user wants a manual breakdown:

1. `naffo_get_stock_on_hand` — current quantities
2. `naffo_get_stock_report({ type: "low-stock" })` — products below reorder level
3. `naffo_get_sales_report({ groupBy: "product" })` — 30-day sales for avg daily demand
4. Compute: `days_of_supply = stock ÷ avg_daily_demand`
5. Classify:
   - 🔴 **CRITICAL**: days_of_supply < lead_time_days
   - 🟡 **LOW**: days_of_supply < 2 × lead_time_days
   - ✅ **ADEQUATE**: within normal range
   - ⚠️ **EXCESS**: days_of_supply > 60
6. Use `naffo_get_stock_report({ type: "valuation" })` to see stock value

---

## Confidence rules — mandatory

Before presenting any number:

| Condition | What to say |
|-----------|-------------|
| `confidence_tier: VERY_LOW` | "⚠️ Estimate only — engine unavailable. Do not use for large orders." |
| `confidence_tier: LOW` | "⚠️ Statistical estimate — low confidence. Verify before ordering." |
| `data_points < 15` | "⚠️ Thin data — low confidence." |
| `freshness_days > 30` | "⚠️ Last sale was N days ago. Verify data is complete." |
| Festival in window | "📅 Festival effect possible — conservative estimate may be low." |
| `INFEASIBLE` optimizer | "❌ Constraints conflict — [state the conflict exactly]." |

**Never present a forecast without stating confidence level.**
**Never invent a number after a failed or degraded call.**

---

## Output formats

### Demand forecast
```
Product: [name]
Horizon: [N] days | As of: [date]
Confidence: [HIGH/MEDIUM/LOW/VERY_LOW] | Engine: [predict-v1/fallback]

Conservative (p10): [X] units
Expected (p50):     [X] units  ← use this for gap calculation
High (p90):         [X] units

Current stock:      [X] units
Pending supply:     [X] units
Gap:                [+X shortfall / -X surplus]
Recommended order:  [X] units by [date]

[⚠️ Any warnings here]
```

### Optimization plan
```
Template: [template name]
Status: [OPTIMAL / FEASIBLE / INFEASIBLE]

| Item | Recommended qty | Feasible? | Note |
|------|-----------------|-----------|------|
| ...  | ...             | ✅/⚠️/❌  | ...  |

[Conflict hints if INFEASIBLE]
Next step: [what to do]
```

### Anomaly report
```
[N] anomalies detected — [H] HIGH, [M] MEDIUM, [L] LOW

HIGH:
  • [entity]: [description] → [suggested_action]

MEDIUM:
  • [entity]: [description] → [suggested_action]
```

---

## Safety rules

- Every number must come from a tool call — never estimate yourself.
- Never accept `organizationId` from the user.
- `INFEASIBLE` = report the conflict exactly; never fake a feasible result.
- `LOW` / `VERY_LOW` confidence = surface the warning prominently.
- If the Predict Engine or Optimizer is unavailable, say so plainly.
  Never pretend the result is reliable when `engine: "fallback"`.
- All numbers must exactly match tool output — never re-round.
