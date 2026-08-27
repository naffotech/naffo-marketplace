---
name: naffo-optimization
description: Demand forecasting, production planning, inventory optimization, stock transfer recommendations, constraint-based allocation, cash flow planning, and anomaly detection using Naffo ERP data combined with the Naffo Predict Engine and Naffo Optimizer. Use this skill when the user asks what they *should do next* — how much to produce, what to order, where to transfer stock, what the demand outlook looks like, or whether anything looks wrong.
when_to_use: Any forward-looking or planning question — how much to produce, what to reorder, where to transfer stock, demand forecast, inventory health, production plan, kitna banana chahiye, kitna order karein, cash flow, vendor payment priority, anomaly, something looks off.
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
- **What is the goal?** → know if this is forecasting, optimization, or anomaly detection

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

## Step D — Run the forecast

```
naffo_forecast_demand({
  product_ids:      [...],
  horizon_days:     30,           // or what user specified
  festival_boost:   true,         // from Q1
  planned_discount: 0.20,         // from Q1 if promo
  service_level:    "MEDIUM",     // from Q2
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

## Step E — Supply signal

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

---

## Step F — Before optimization: ask exactly 2 questions

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

## Step G — Optimization templates

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

## Dairy production — specific flow

For dairy businesses (paneer, ghee, butter, dahi):

1. **Milk procurement planning:**
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

2. **Standardization (fat/SNF targeting):**
```
naffo_compute_standardization({ ... })
```

3. **Formal production plan:**
```
naffo_create_dairy_production_plan({ ... })
```

Always follow `naffo-management` skill for the actual production cycle execution.

---

## Anomaly detection flow

When the user says "something looks off" or "check for problems":

```
naffo_detect_anomalies({
  domains:      ["sales", "stock", "receivables"],  // or all 6
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

## Formal planning run (when acting on a plan)

When the recommendation will be executed and needs an audit trail:

```
naffo_create_production_planning_run({
  planning_from:  "...",
  planning_until: "...",
  product_ids:    [...],
  idempotencyKey: "plan-YYYYMMDD-weekly",
  solver_tag:     "naffo-optimize"
})
```

Status=READY → external solver can process → `naffo_submit_production_plan_result`.

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
| `BOM missing` | "❌ No BOM found — production planning not possible for this SKU." |

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

### Production plan
```
Planning window: [from] → [to]

| Product | Expected demand | Stock | Gap | Recommended | Feasible? |
|---------|-----------------|-------|-----|-------------|-----------|
| ...     | ...             | ...   | ... | ...         | ✅/⚠️/❌  |

Material gaps:   [list or "none"]
Capacity:        [workstation] at [X]% utilisation
Optimizer status: [OPTIMAL/FEASIBLE/INFEASIBLE]
Next step:       [create run / order materials / start production]
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
- Writes (planning runs, dairy plans) require `idempotencyKey`.
- `INFEASIBLE` = report the conflict exactly; never fake a feasible result.
- `LOW` / `VERY_LOW` confidence = surface the warning prominently.
- If the Predict Engine or Optimizer is unavailable, say so plainly.
  Never pretend the result is reliable when `engine: "fallback"`.
