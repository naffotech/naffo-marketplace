---
description: Create a production plan — what to manufacture, when, and how much — based on demand forecasts, current stock, and constraints
allowed-tools: mcp__naffo__naffo_navigate, mcp__naffo__naffo_describe_tools, mcp__naffo__naffo_check_forecast_readiness, mcp__naffo__naffo_get_demand_trend, mcp__naffo__naffo_detect_changepoint, mcp__naffo__naffo_forecast_demand, mcp__naffo__naffo_get_product_forecast_context, mcp__naffo__naffo_get_stock_on_hand, mcp__naffo__naffo_get_stock_report, mcp__naffo__naffo_get_sales_report, mcp__naffo__naffo_optimize_plan, mcp__naffo__naffo_optimize_custom, mcp__naffo__naffo_search_item, mcp__naffo__naffo_whoami
---

Follow the `naffo-optimization` skill to create a production plan.

Steps:
1. Ask (or infer from context): planning window (start/end dates) and products.
   Default: next 7 days, all main products.
2. Resolve product names with `naffo_search_item`.
3. Check forecast readiness: `naffo_check_forecast_readiness({ product_ids: [...] })`.
4. Check direction and structural drops before committing capacity — **optional,
   skip if `naffo_describe_tools` reports these missing on this deployment**:
   `naffo_get_demand_trend({ product_id, periods: 6 })`, then
   `naffo_detect_changepoint({ product_id })` for anything trending `DECLINE`.
   Apply `dampening_factor` to the forecast before planning quantities.
5. Get demand forecasts: `naffo_forecast_demand({ product_ids, horizon_days })`.
6. Get supply signals: `naffo_get_product_forecast_context` for each product.
7. For each product compute: gap = p50_demand - stock_on_hand - pending_supply.
8. Ask the user 2 optimization questions (objective and hard constraints).
9. Run the optimizer:
   `naffo_optimize_plan({ template: "production_plan", data: { products: [...], constraints: {...} } })`
   For shift scheduling or delivery routing, use `naffo_optimize_custom` instead.
10. Present the plan table (product | recommended qty | feasibility | notes).
    Show optimizer status (OPTIMAL / FEASIBLE / INFEASIBLE) prominently.
11. State next steps (start production, order materials, etc.).
