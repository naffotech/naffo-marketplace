---
name: naffo-optimization
description: Demand forecasting, production planning, inventory optimization, and stock transfer recommendations using Naffo ERP data. Use this skill when the user asks what they *should do next* — how much to produce, where to transfer stock, what to reorder, or what the demand outlook looks like.
---

# Naffo Optimization & Planning

Handles **forward-looking, analytical, and optimization** questions: demand
forecasts, production planning, reorder recommendations, stock transfer
decisions, and business planning summaries. Always data-driven — never estimates.

---

## 1. Mental model

```
Understand scope → Gather signals → Compute gap → Recommend → (optionally) Store plan
```

Every recommendation starts with **two questions**:
- **Scope:** Which product(s)? Which location? Over how many days?
- **Confidence:** Is the data fresh enough to trust?

If vague, ask **one** clarifying question before proceeding.

---

## 2. Step A — Understand scope

Clarify before computing:
- Product(s): use `naffo_search_item` to resolve loose names to exact IDs
- Location / warehouse / outlet: use `naffo_list_warehouses` or ask the user
- Horizon: default **30 days** unless specified
- If asking about dairy production: confirm product type (dahi, paneer, ghee, etc.)

---

## 3. Step B — Demand signal (sales history)

```
naffo_get_sales_report({
  groupBy: "product",    // or "customer"
  period: "last_90_days" // adjust to horizon
})
```

For per-product daily history:
```
naffo_list_sale_invoices({ productId: "...", limit: 500 })
```

Then compute:
- **Average daily demand** = total_units ÷ days_with_sales
- **Trend** = compare last 30 days vs prior 30 days
- **Seasonality flag** = festivals upcoming (`naffo_list_calendar_events`)

> **Data quality check:** if fewer than 15 data points exist for a product,
> note "thin data — low confidence" before giving any recommendation.

---

## 4. Step C — Supply signal (current inventory)

```
naffo_get_stock_on_hand({ productId: "..." })   // current qty
naffo_list_batch_expiry_alerts({})               // expiry-driven urgency
naffo_get_outlet_stock_matrix({})                // all outlets (for transfers)
```

Compute:
```
gap = (avg_daily_demand × horizon_days) - current_stock - pending_purchase_orders
```

- gap > 0 → **shortfall** (need to order or produce)
- gap < 0 → **surplus** (no action or reduce)

---

## 5. Step D — Recommend

### Single product — order/reorder recommendation

Use the newsvendor approach: order the amount that minimises expected cost.

```
conservative_order  = p10_demand × safety_factor    // risk-averse
expected_order      = p50_demand                    // neutral
high_order          = p90_demand × fill_rate_target // service-level focus
```

State: recommended qty, rationale (cost of stockout vs overstock), and the
confidence level based on data points.

### Multi-product / constrained — production planning

When multiple SKUs compete for the same capacity or budget:

1. Get the complete OR-Tools input package:
```
naffo_get_production_optimization_context({
  planning_from: "<ISO-8601>",
  planning_until: "<ISO-8601>",
  product_ids: ["..."]
})
```
This returns: time-bucketed demand, BOMs, workstation capacity, current stock,
raw material costs, and existing work-order commitments.

2. Analyse the context:
   - Which products have demand > available stock?
   - Which workstations are bottlenecks?
   - Which raw materials are short?

3. Recommend a production sequence:
   - Prioritise by margin (revenue - variable cost)
   - Respect BOM constraints (can't produce without raw materials)
   - Flag capacity constraints explicitly

4. For dairy production specifically:
```
naffo_compute_standardization({ ... })      // fat/SNF blending
naffo_create_dairy_production_plan({ ... }) // formal plan
```

### Stock transfers — FEFO-aware rebalancing

```
naffo_get_outlet_stock_matrix({})          // where stock is
naffo_batch_transfer_suggestions({})       // expiry-driven FEFO picks
naffo_list_batch_expiry_alerts({})         // urgent expiry items
```

Recommend transfers by priority:
1. **Expiry-push** (high urgency) — move stock expiring < 7 days to high-velocity outlets
2. **Demand-pull** (medium urgency) — move from over-stocked to under-stocked outlets
3. **Rebalance** (low urgency) — equalise days-of-supply across locations

---

## 6. Step E — Create a formal planning run (optional)

When the recommendation will be acted on and needs an audit trail:

```
naffo_create_production_planning_run({
  planning_from: "...",
  planning_until: "...",
  product_ids: [...],
  idempotencyKey: "plan-YYYYMMDD-weekly",
  solver_name: "claude-code"
})
```

This stores an immutable ERP snapshot (status = READY). An external OR-Tools
solver can then process it and submit results via:
```
naffo_submit_production_plan_result({ run_id: "...", result: { ... } })
```

---

## 7. Confidence rules — mandatory

Before presenting any number:

| Condition | What to say |
|---|---|
| < 15 data points for the product | "⚠️ Thin data — low confidence" |
| Last sale > 30 days ago | "⚠️ Stale data — verify before ordering" |
| Seasonal product near a festival | "📅 Festival effect likely — consider +20–50%" |
| Workstation at > 90% utilisation | "🔴 Capacity bottleneck — not all products feasible" |
| BOM missing or inactive | "❌ No BOM found — production planning not possible for this SKU" |

Never present a forecast without stating confidence level.

---

## 8. Output format

### For demand forecast
```
Product: [name]
Horizon: [N] days
Avg daily demand (last 90d): [X] units/day
Expected demand: [X × N] units
Conservative: [p10 × 1.1] | Expected: [p50] | High: [p90 × fill_rate]
Data quality: [N data points, freshness: X days]
Recommendation: Order [qty] by [date]
```

### For production plan
```
Planning window: [from] → [to]
Products: [list]

| Product | Demand | Stock | Gap | Recommended qty | Feasible? |
|---------|--------|-------|-----|-----------------|-----------|
| ...     | ...    | ...   | ... | ...             | ✅/⚠️/❌   |

Raw material gaps: [list or "none"]
Capacity: [workstation] at [X]% utilisation
Next step: [create planning run / order materials / start production]
```

### For stock transfers
```
| SKU | From | To | Qty | Reason | Urgency |
|-----|------|----|-----|--------|---------|
```

---

## 9. Safety rules

- Every number must come from a tool call — no estimates.
- Never accept `organizationId` from the user.
- Writes (planning runs) require `idempotencyKey`.
- Solver INFEASIBLE = report the conflict exactly; never fake a feasible result.
- If `naffo_get_production_optimization_context` returns `readiness.ready = false`,
  list the errors before proceeding.
