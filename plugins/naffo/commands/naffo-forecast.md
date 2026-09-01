---
description: Forecast demand for one or more products using sales history from the Naffo ERP, then turn it into a cost-optimal order decision
allowed-tools: mcp__naffo__naffo_navigate, mcp__naffo__naffo_describe_tools, mcp__naffo__naffo_search_item, mcp__naffo__naffo_check_forecast_readiness, mcp__naffo__naffo_get_demand_series, mcp__naffo__naffo_get_demand_features, mcp__naffo__naffo_get_demand_trend, mcp__naffo__naffo_detect_changepoint, mcp__naffo__naffo_forecast_demand, mcp__naffo__naffo_aggregate_forecast_range, mcp__naffo__naffo_newsvendor_order_qty, mcp__naffo__naffo_harden_order_decision, mcp__naffo__naffo_forecast_scenarios, mcp__naffo__naffo_get_product_forecast_context, mcp__naffo__naffo_get_stock_on_hand, mcp__naffo__naffo_get_sales_report, mcp__naffo__naffo_whoami
---

Follow the **complete forecast-to-order decision chain** in the `naffo-optimization`
skill.

Steps 1, 7, and 9 are the required backbone. The steps marked **(gated)** use
refinement tools that older Naffo deployments may not expose — confirm them in one
call first and take the skill's documented fallback for anything reported `missing`:

```
naffo_describe_tools({ names: ["naffo_get_demand_features", "naffo_get_demand_trend",
  "naffo_detect_changepoint", "naffo_aggregate_forecast_range",
  "naffo_newsvendor_order_qty", "naffo_harden_order_decision",
  "naffo_forecast_scenarios"] })
```

Never fabricate a missing tool's output — name the unavailable refinement instead.

1. If no product was specified in the command, ask: "Which product(s) and how many days ahead?"
2. Resolve product names with `naffo_search_item`.
3. Data quality gate — `naffo_check_forecast_readiness({ product_ids: [...] })`.
   - `NO_DATA`: tell the user and stop.
   - `THIN` / `STALE`: warn before proceeding.
4. **(gated)** Demand character — `naffo_get_demand_features` (pattern, YoY growth, momentum).
5. **(gated)** Trend direction — `naffo_get_demand_trend({ periods: 6 })`.
6. **(gated)** Structural drop guard — `naffo_detect_changepoint`. Mandatory when trend is
   `DECLINE`. Apply `dampening_factor` to the forecast before any order maths.
7. Probabilistic forecast — `naffo_forecast_demand` with the user's context answers
   (festival boost, planned discount, service level). Report `engine` and
   `confidence_tier`.
8. **(gated)** Correct the range — `naffo_aggregate_forecast_range` using the daily series from
   `naffo_get_demand_series`. Present `corrected_low`..`corrected_high`, never the
   naive p10–p90 sum.
9. Supply signal — `naffo_get_product_forecast_context` and `naffo_get_stock_on_hand`.
   Compute gap = p50_total − stock_on_hand − pending_supply_qty.
10. **(gated)** Cost-optimal quantity — `naffo_newsvendor_order_qty` (needs unit_cost / sell_price;
    otherwise cite `basis: "fallback_no_costs"`).
11. **(gated)** Business guardrails — `naffo_harden_order_decision`. Always present
    `final_order_qty`, plus `decision_status`, `urgency`, and every guardrail flag.
12. **(gated)** Three scenarios — `naffo_forecast_scenarios`. Always show LOW / EXPECTED / HIGH
    and let the owner choose.

Present using the structured forecast format from the `naffo-optimization` skill.
Always show the confidence tier. Numbers must match tool output exactly.
