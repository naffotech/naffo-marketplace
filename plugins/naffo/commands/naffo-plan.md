---
description: Create a production plan — what to manufacture, when, and how much — based on demand forecasts, current stock, and constraints
allowed-tools: mcp__naffo__naffo_navigate, mcp__naffo__naffo_check_forecast_readiness, mcp__naffo__naffo_forecast_demand, mcp__naffo__naffo_get_product_forecast_context, mcp__naffo__naffo_get_stock_on_hand, mcp__naffo__naffo_get_stock_report, mcp__naffo__naffo_get_sales_report, mcp__naffo__naffo_optimize_plan, mcp__naffo__naffo_search_item, mcp__naffo__naffo_whoami
---

Follow the `naffo-optimization` skill to create a production plan.

Steps:
1. Ask (or infer from context): planning window (start/end dates) and products.
   Default: next 7 days, all main products.
2. Resolve product names with `naffo_search_item`.
3. Check forecast readiness: `naffo_check_forecast_readiness({ product_ids: [...] })`.
4. Get demand forecasts: `naffo_forecast_demand({ product_ids, horizon_days })`.
5. Get supply signals: `naffo_get_product_forecast_context` for each product.
6. For each product compute: gap = p50_demand - stock_on_hand - pending_supply.
7. Ask the user 2 optimization questions (objective and hard constraints).
8. Run the optimizer:
   `naffo_optimize_plan({ template: "production_plan", data: { products: [...], constraints: {...} } })`
9. Present the plan table (product | recommended qty | feasibility | notes).
   Show optimizer status (OPTIMAL / FEASIBLE / INFEASIBLE) prominently.
10. State next steps (start production, order materials, etc.).
