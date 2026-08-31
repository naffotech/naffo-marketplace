---
name: naffo-optimization
description: Demand forecasting, production planning, inventory optimization, batch expiry risk, stock transfer recommendations, dairy production planning, constraint-based allocation, cash flow planning, anomaly detection, business intelligence signals, and complete forecast-to-order decision chain using Naffo ERP data. Use this skill when the user asks what they should do next — how much to produce, what to order, where to transfer stock, what the demand outlook looks like, or whether anything looks wrong.
when_to_use: Demand forecast, production plan, what should I produce, how much to order, inventory health, days of supply, low stock alert, batch expiry, expiry risk, near-expiry, FEFO, stock transfer, which outlet needs stock, cash flow plan, vendor payment priority, anomaly detection, something looks off, kitna banana chahiye, kitna order karein, reorder, overstock, milk procurement planning, standardization, dairy recipe, production flow, batch cost, yield, planning run, business intel, customer churn, wastage risk, supplier risk, shift scheduling, delivery routing, forecast scenarios, order scenarios, changepoint, demand trend, demand features, uncertainty band, newsvendor, MOQ, safety stock, decision hardening, approval gate.
---

# Naffo Optimization & Planning

Handles **forward-looking, analytical, and optimization** questions.
Always data-driven — every number comes from a tool call.

---

## Mental model

```
Understand scope → Check data quality → Gather signals → Forecast / Plan / Optimize → Present with confidence
```

---

## Step A — Understand scope (always first)

Ask **one** question if the request is vague:
- **What product(s)?** → `naffo_search_item` to resolve names to ids
- **Which location / outlet?** → warehouse, specific outlet, or all
- **How far ahead?** → default **30 days**
- **Goal?** → forecasting, inventory health, production plan, or anomaly scan

---

## Step B — Pre-flight: data quality + supply context

**Before forecasting, always run both:**

```
naffo_check_forecast_readiness({ product_ids: [...] })
```

| Status | Action |
|---|---|
| `READY` | Proceed |
| `THIN` | Warn user — LOW confidence forecast |
| `STALE` | Verify no missing data, caution user |
| `NO_DATA` | Stop — ask user to record more sales first |

```
naffo_get_product_forecast_context({ product_id: "..." })
```

Returns: current stock, pending supply, lead time, cost, sale price, reorder level.

```
naffo_get_demand_series({ product_id, days: 365 })
```

Returns: daily aggregated sales series, freshness, gaps, average daily demand.
Use this to show the user the raw history before giving a forecast.

---

## Step C — Festival/event check

```
naffo_list_calendar_events({ from: "<today>", to: "<forecast end date>" })
```

Check for upcoming festivals, promotions, events that could boost demand.
Map findings to `festival_boost: true` in the forecast call.

---

## Step D — Ask 2 context questions (one message)

**Q1 — Context:** "Anything special in the forecast window?
  (A) Festival / event demand boost
  (B) Planned discount or promotion — what %?
  (C) Nothing special"

**Q2 — Service level:** "What's your priority?
  (A) Never run out — HIGH (95%)
  (B) Balanced — MEDIUM (80%)
  (C) Minimize overstock — LOW (65%)"

Map:
- Q1(A) → `festival_boost: true`
- Q1(B) → `planned_discount: <fraction>` (e.g. 0.15 for 15% off)
- Q2 → `service_level: "HIGH" / "MEDIUM" / "LOW"`

---

## Step E — Run the forecast

```
naffo_forecast_demand({
  product_ids:      [...],
  horizon_days:     30,
  festival_boost:   true,
  planned_discount: 0.15,
  service_level:    "MEDIUM",
  history_days:     365,
})
```

Confidence tiers:

| Tier | Response |
|---|---|
| `HIGH` | Present numbers directly |
| `MEDIUM` | "Reasonable estimate — partial data" |
| `LOW` | "⚠️ Statistical estimate only. Verify before ordering." |
| `VERY_LOW` | "⚠️ Engine unavailable — rough estimate. Do not place large orders." |

**Always show confidence tier.** If `fallback_reason` is set, mention it explicitly.

Compute gap:
```
gap = p50_total − stock_on_hand − pending_supply_qty
gap > 0 → shortfall (order/produce)   gap < 0 → surplus (hold/reduce)
```

---

## Step F — Inventory health (full analysis)

```
naffo_get_stock_on_hand                  → current qty per product
naffo_get_stock_report({ type: "low-stock" })   → products below reorder point
naffo_get_stock_report({ type: "valuation" })   → stock value

naffo_list_batch_expiry_alerts({ window: "DAYS_7" })   → expiring within 7 days
naffo_list_batch_expiry_alerts({ window: "DAYS_3" })   → critical (3 days)
naffo_get_fefo_allocation({ productId, qty })           → FEFO pick plan
naffo_batch_transfer_suggestions({ productId })         → near-expiry transfer recs
```

Compute per product:
```
days_of_supply = stock ÷ avg_daily_demand
```

Classify:
- 🔴 **CRITICAL**: days_of_supply < lead_time_days
- 🟡 **LOW**: days_of_supply < 2 × lead_time_days
- ✅ **ADEQUATE**: normal range
- ⚠️ **EXCESS**: days_of_supply > 60 days
- ☠️ **EXPIRY RISK**: batch expiring ≤ 7 days (from `list_batch_expiry_alerts`)

For outlet-level view:
```
naffo_get_outlet_stock_matrix({ includeExpiring: true })
naffo_list_outlet_stock_movements({ sinceDays: 7 })
```

---

## Step G — Optimization: ask 2 questions (one message)

**Q1 — Objective:**
  (A) Maximize profit margin
  (B) Meet all demand (minimize stockout)
  (C) Minimize cost / spending
  (D) Maximize production volume

**Q2 — Hard constraints:**
  (A) Budget cap: ₹___
  (B) Machine / production hours: ___ hours
  (C) Storage / vehicle capacity: ___ units
  (D) No hard limit

---

## Step H — Optimization templates

| Business question | Template |
|---|---|
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
  budget:   500000,
})
```

Optimizer status:

| Status | What to say |
|---|---|
| `OPTIMAL` | "✅ Optimal solution — best possible plan." |
| `FEASIBLE` | "⚠️ Good solution — constraints were tight, may not be globally optimal." |
| `INFEASIBLE` | "❌ No feasible solution — [show conflict_hints exactly]." |
| `ERROR` | "Optimizer unavailable — [show warning]. Plan manually or retry." |

**INFEASIBLE = report the conflict exactly. Never fake a result.**

---

## Dairy milk procurement planning

```
naffo_optimize_plan({
  template: "milk_procurement",
  data: {
    centers: [
      { center_id: "...", available_litres: 500, fat_pct: 3.8, rate_per_litre: 32 },
    ],
    tank_capacity_litres: 2000,
    budget: 65000
  }
})
```

Get current tank state:
```
naffo_list_dairy_tanks             → capacity and current fill level
naffo_view_dairy_tank              → one tank detail
naffo_get_dairy_procurement_dashboard → daily milk KPIs
```

---

## Dairy production planning

**Step-by-step dairy product planning:**

```
# 1. List available dairy recipes (BOMs)
naffo_list_dairy_recipes
naffo_get_dairy_recipe           → recipeId (inputs, outputs, yield)

# 2. Preview what a recipe run would produce
naffo_preview_dairy_recipe_production({ recipeId, qty })

# 3. Check standardization (fat/SNF balancing)
naffo_list_standardization_methods
naffo_compute_standardization({ ... })   → fat/SNF target mix

# 4. Create a dairy production plan
naffo_create_dairy_production_plan({ ... })
naffo_list_dairy_production_plans → status [DRAFT/IN_PROGRESS/COMPLETED/CANCELLED]
naffo_get_dairy_production_plan   → id

# 5. Produce from recipe
naffo_produce_from_dairy_recipe({ recipeId, qty, ... })

# 6. Post by-products
naffo_post_dairy_by_product

# 7. Track batch variance
naffo_get_dairy_batch_variance   → batchId
naffo_get_mass_balance           → shift/date-based mass balance
```

---

## Advanced production flow engine

For BOMs with stages, constraints, and live cost tracking:

```
# Discover
naffo_production_flows_overview
naffo_production_flow_search({ query, status: "ACTIVE", industry: "DAIRY" })
naffo_production_flow_get        → flowId (stages, inputs, outputs, formulas)

# Pre-run checks
naffo_production_flow_check_readiness({ flowId, multiplier })
naffo_get_production_flow_readiness({ flowId, multiplier })  → live stock + WAC check
naffo_preview_production_flow_cost({ flowId, mode: "standard" })

# Start a run
naffo_production_run_start({ flowId, baseQtyMultiplier, shift: "MORNING" })
naffo_production_run_get_state   → runId (tells you what's missing / next)
naffo_production_run_update_stage → runId, stageRunId, inputs[], outputs[], parameters{}
naffo_production_run_complete    → runId, finalize: true
naffo_get_production_flow_run_live_costs → runId  (real-time WAC)
```

Analytics:
```
naffo_production_flow_get_analytics({ days: 30, flowId })  → cycle/output/wastage/shift
naffo_get_production_flow_yield_drift                       → fixed yield vs actuals
```

---

## Formal production planning runs (OR-Tools solver)

When a plan needs to be executed and have an audit trail:

```
# Get OR-Tools input package
naffo_get_production_optimization_context({
  planning_from:  "YYYY-MM-DD",
  planning_until: "YYYY-MM-DD",
  product_ids:    [...],
})
```

Check `readiness.ready`. If false: list the blocking errors — do NOT proceed.

```
# Store planning snapshot
naffo_create_production_planning_run({
  planning_from:  "...",
  planning_until: "...",
  product_ids:    [...],
  idempotencyKey: "plan-YYYYMMDD-weekly",
})
```

```
# Monitor
naffo_list_production_planning_runs  → status [DRAFT/READY/SUBMITTED/RUNNING/APPROVED/FAILED/STALE]
naffo_get_production_planning_run    → run_id
```

---

## Anomaly detection

```
naffo_detect_anomalies({
  domains:       ["sales", "stock", "receivables"],
  lookback_days: 30,
  baseline_days: 90,
})
```

Present by severity:
- **HIGH** → "Needs immediate attention — [entity]: [description] → [suggested_action]"
- **MEDIUM** → "Worth investigating"
- **LOW** → "Monitor"

Always show `suggested_action` for every anomaly found.

---

## Cash flow planning

```
naffo_get_cash_flow_statement({ fromDate, toDate })  → direct-method statement
naffo_optimize_plan({ template: "cashflow_schedule", data: {...} })  → payment schedule
naffo_optimize_plan({ template: "vendor_payment_order", data: {...} })  → vendor priority
```

---

## Output formats

### Demand forecast
```
Product: [name]
Horizon: [N] days | As of: [date]
Confidence: [HIGH/MEDIUM/LOW/VERY_LOW] | Engine: [predict-v1/fallback]

Conservative (p10): [X] units
Expected (p50):     [X] units  ← use for gap calc
High (p90):         [X] units

Current stock:      [X] units
Pending supply:     [X] units
Gap:                [+X shortfall / -X surplus]
Recommended:        [X] units by [date]

[⚠️ warnings]
```

### Inventory health table
```
Product | Stock | Avg/day | DoS | Status     | Action
--------|-------|---------|-----|------------|-------
[name]  | X kg  | Y kg    | Z d | 🔴 CRITICAL | Order now
[name]  | X kg  | Y kg    | Z d | ☠️ EXPIRY   | Transfer to [outlet]
```

### Optimizer plan
```
Template: [name] | Status: [OPTIMAL/FEASIBLE/INFEASIBLE]

| Item | Recommended | Feasible? | Note |
|------|-------------|-----------|------|

[Conflict hints if INFEASIBLE]
Next step: [what to do]
```

---

## Confidence rules — mandatory

| Condition | What to say |
|---|---|
| `confidence_tier: VERY_LOW` | "⚠️ Estimate only — engine unavailable. Do not use for large orders." |
| `confidence_tier: LOW` | "⚠️ Statistical estimate — verify before ordering." |
| `data_points < 15` | "⚠️ Thin data — low confidence." |
| `freshness_days > 30` | "⚠️ Last sale was N days ago. Verify data is complete." |
| Festival in window | "📅 Festival effect possible — conservative estimate may be low." |
| `INFEASIBLE` optimizer | "❌ Constraints conflict — [state exactly]." |
| `readiness.ready = false` | "❌ [list blocking errors]. Cannot proceed until resolved." |

---

## Safety rules

- Every number must come from a tool call — never estimate yourself.
- Never accept `organizationId` from the user.
- `INFEASIBLE` = report the conflict exactly; never fake a feasible result.
- `LOW` / `VERY_LOW` confidence = surface the warning prominently.
- If Predict Engine or Optimizer is unavailable, say so plainly.
- Writes (planning runs, dairy plans, batch starts) require `idempotencyKey`.
- Numbers must exactly match tool output — never re-round.

---

## Complete forecast-to-order decision chain

For a single product, follow these steps in order. Never skip.

### Step 1 — Data quality gate
```
naffo_check_forecast_readiness({ product_ids: [pid] })
```
| Status | Action |
|---|---|
| `READY` | Proceed |
| `THIN` | Warn user — LOW confidence forecast |
| `STALE` | Ask: "Has demand changed since then?" |
| `NO_DATA` | Stop — tell user to record more sales first |

### Step 2 — Demand character (pure math, no Lambda)
```
naffo_get_demand_features({ product_id: pid })
```
Returns: `demand_pattern` (STABLE/TREND/FESTIVAL_DRIVEN/VOLATILE),
`confidence_boost` (+0.10/+0.05/0/−0.05), `yoy_growth_pct`, `momentum_7d`,
`is_wedding_season`, `is_harvest_season`, lag values (1d/7d/30d/365d).

- **VOLATILE** → lower confidence; suggest collecting more data before large order.
- **FESTIVAL_DRIVEN** → flag upcoming festival window; check `is_wedding_season`.
- **TREND** → model captures direction; reliable for GROWTH patterns.
- **STABLE** → most reliable; standard confidence.

### Step 3 — Directional trend (pure math, no Lambda)
```
naffo_get_demand_trend({ product_id: pid, periods: 6 })
```
Returns: `direction` (GROWTH/FLAT/DECLINE), `trend_pct` (%).
- **DECLINE** → run changepoint check (Step 4) before large order.

### Step 4 — Changepoint guard (pure math, no Lambda)
```
naffo_detect_changepoint({ product_id: pid })
```
Returns: `is_downshift` (bool), `severity` (0–1), `dampening_factor` (≤1).
- `is_downshift: true` → demand has structurally dropped (lost customer, discontinued line).
- Apply `dampening_factor` to any forecast result before computing order qty.
  e.g. `dampening_factor: 0.7` → multiply forecast by 0.7 before ordering.
- Do NOT skip this for a product showing `direction: DECLINE`.

### Step 5 — Probabilistic forecast (calls Lambda)
```
naffo_forecast_demand({ product_ids: [pid], horizon_days: 30,
    festival_boost, planned_discount, service_level, history_days: 365 })
```
Returns: `conservative_estimate` (p10), `expected_estimate` (p50),
`high_estimate` (p90), `engine`, `confidence_tier`, `fallback_reason`.

Engine meaning:
- `engine: "predict-v1"` → full TimesFM + Chronos + StatsForecast ensemble ✅
- `engine: "fallback"` + `fallback_reason: "predict_engine_unavailable"` → Lambda down; statistical estimate; say so
- `engine: "fallback"` + `fallback_reason: "insufficient_history"` → < 3 data points; VERY_LOW confidence

### Step 6 — Correct the uncertainty bands (pure math, no Lambda)
```
naffo_aggregate_forecast_range({
    p10_daily:      result.p10_daily,
    p50_daily:      result.p50_daily,
    p90_daily:      result.p90_daily,
    history_values: your_daily_series   ← from naffo_get_demand_series
})
```
Returns: `corrected_low`, `corrected_high`, `overstatement_pct`.
- The naive range (`sum(p10_daily)` to `sum(p90_daily)`) overstates uncertainty by 40–80%.
- Use `corrected_low`..`corrected_high` when presenting the range to the user.

### Step 7 — Cost-optimal order quantity (pure math, no Lambda)
```
naffo_newsvendor_order_qty({
    p10_total: result.conservative_estimate,
    p50_total: result.expected_estimate,
    p90_total: result.high_estimate,
    unit_cost, sell_price, salvage_value,
    current_stock    ← from naffo_get_stock_on_hand
})
```
Returns: `order_qty`, `critical_ratio`, `basis`, `rationale`.
- Without `unit_cost`/`sell_price` → falls back to p50 coverage (cite `basis: "fallback_no_costs"`).
- `critical_ratio > 0.5` → stockout hurts more → order above median.
- `critical_ratio < 0.5` → overstock hurts more → order below median.

### Step 8 — Apply business guardrails (pure math, no Lambda)
```
naffo_harden_order_decision({
    initial_order_qty,
    expected_demand: p50_total,
    low_demand:      p10_total,
    high_demand:     p90_total,
    current_stock,
    unit_price:      sell_price,
    moq:             product.minOrderQuantity ?? 1,
    lead_time_days:  product.leadTimeDays ?? 7,
    data_age_days:   result.data_freshness_days,
    horizon_days:    30,
})
```
Returns: `final_order_qty`, `decision_status`, `urgency`, `guardrails[]`,
`approval_required`, `notify_manager`, `order_band` (floor/expected/high).

**Always use `final_order_qty` — not the raw newsvendor `order_qty`.**

| decision_status | Meaning |
|---|---|
| `order_recommended` | Normal order — proceed |
| `do_not_order_overstock` | Stock already covers high demand — do not order |
| `capped_for_uncertainty` | Uncertain data — capped to high-case need |
| `approval_recommended` | MOQ creates overstock — route to manager |

| urgency | Action |
|---|---|
| `URGENT` | Stockout before replenishment — present immediately |
| `NORMAL` | Standard priority |

Guardrail flags to surface explicitly:
- `stock_may_run_out_before_replenishment` → 🚨 urgent
- `moq_may_create_overstock` → ⚠️ needs approval
- `current_stock_covers_high_case` → 🚫 do not order
- `uncertainty_cap_to_high_case` → ⚠️ capped

### Step 9 — Present all three scenarios (pure math, no Lambda)
```
naffo_forecast_scenarios({
    p10_total, p50_total, p90_total,
    current_stock, unit_price, moq, lead_time_days,
    horizon_days: 30,
})
```
Returns: `scenarios[LOW, EXPECTED, HIGH]` each with `qty_recommended`, `order_value`,
`stockout_risk`, `approval_required`.

**Always show all three.** Let the owner choose based on their cash flow and risk appetite.
- LOW (p10) → conservative/safe — lower cost, accepts some stockout risk
- EXPECTED (p50) → balanced best estimate
- HIGH (p90) → aggressive — avoids stockout, higher cost

---

## Business intelligence signals (run weekly)

```
naffo_get_business_intel({ lookback_days: 90, top_n: 10 })
```

Returns three modules:
1. **Customer churn risk** — customers who have gone silent (days_inactive).
   - `churn_risk > 0.70` → "Assign sales visit immediately"
   - `churn_risk 0.40–0.70` → "Monitor — moderate risk"
2. **SKU wastage risk** — products with high demand volatility + excess stock (over-ordered).
   - `wastage_risk > 0.60` → "Reduce next order by X%"
   - `days_of_cover > 90` → "Overstock — hold before reordering"
3. **Supplier delivery risk** — vendors with overdue purchase invoices (payment → delivery risk).
   - `escalation: HIGH` → "Escalate to management"
   - `escalation: MEDIUM` → "Follow up for payment commitment"

Always run `naffo_detect_anomalies` alongside for statistical outliers.

---

## Custom optimization templates (CP-SAT, calls Lambda)

For business problems not covered by the standard 8 templates:

### Shift scheduling
```
naffo_optimize_custom({
    template: "shift_scheduling",
    data: {
        shifts:    [{ id: "S1", required: 2, skill: "DRIVER" }],
        employees: [{ id: "E1", available_shifts: ["S1"], skills: ["DRIVER"], cost: 450 }]
    }
})
```
→ Assigns employees to shifts minimizing total cost while meeting coverage requirements.

### Delivery routing
```
naffo_optimize_custom({
    template: "delivery_routing",
    data: {
        orders: [{ id: "O1", distances: { "V1": 12, "V2": 8 } }],
        slots:  [{ id: "V1", capacity: 3 }, { id: "V2", capacity: 5 }]
    }
})
```
→ Assigns orders to vehicles/time-slots minimizing total distance, respecting capacity.

Both templates return `OPTIMAL / FEASIBLE / INFEASIBLE / ERROR` — same rules as `naffo_optimize_plan`.

---

## Confidence & fallback rules (complete reference)

| Condition | What to say |
|---|---|
| `confidence_tier: HIGH` | Present numbers directly |
| `confidence_tier: MEDIUM` | "Reasonable estimate" |
| `confidence_tier: LOW` | "⚠️ Statistical estimate only — verify before ordering." |
| `confidence_tier: VERY_LOW` | "⚠️ Rough estimate only. Do not use for large orders." |
| `fallback_reason: "insufficient_history"` | "< 3 data points — very rough estimate." |
| `fallback_reason: "predict_engine_unavailable"` | "AI engine down — statistical estimate only." |
| `is_downshift: true` | "Demand has structurally dropped. Forecast dampened by [N]%." |
| `demand_pattern: VOLATILE` | "High demand variance — low-confidence forecast." |
| `demand_pattern: FESTIVAL_DRIVEN` | "Festival-driven demand — check the festival calendar." |
| `urgency: URGENT` | "🚨 Stockout within [N] days — order immediately." |
| `approval_required: true` | "🔒 Order value ₹[N] — needs manager approval before placing." |
| `INFEASIBLE` | "❌ Constraints conflict — [state conflict_hints exactly]." |
| `data_points < 15` | "⚠️ Thin data — LOW confidence." |
| `freshness_days > 30` | "⚠️ Last sale [N] days ago. Verify before ordering." |
