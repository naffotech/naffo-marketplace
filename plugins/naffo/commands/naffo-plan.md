---
description: Create a production plan — what to manufacture, when, and how much — based on demand forecasts, current stock, BOMs, and workstation capacity
allowed-tools: mcp__naffo__naffo_navigate, mcp__naffo__naffo_get_production_optimization_context, mcp__naffo__naffo_create_production_planning_run, mcp__naffo__naffo_list_production_planning_runs, mcp__naffo__naffo_get_stock_on_hand, mcp__naffo__naffo_get_sales_report, mcp__naffo__naffo_search_item, mcp__naffo__naffo_list_manufacturing_boms, mcp__naffo__naffo_list_manufacturing_plans, mcp__naffo__naffo_whoami
---

Follow the `naffo-optimization` skill to create a production plan.

Steps:
1. Ask (or infer from context): planning window (start/end dates) and products.
   Default: next 7 days, all products with active BOMs.
2. Fetch the complete optimization context:
   `naffo_get_production_optimization_context({ planning_from, planning_until, product_ids })`
   This includes demand forecasts, BOMs, workstation capacity, current stock, raw material costs.
3. Check `readiness.ready`. If false, list the blocking errors and stop.
4. For each product compute: gap = demand - stock - incoming_orders.
5. Prioritise by: (1) expiry urgency, (2) gross margin, (3) customer commitment.
6. Check workstation capacity — flag bottlenecks.
7. Check raw material sufficiency — flag shortfalls.
8. Present the plan table (product | recommended_qty | feasibility | notes).
9. Ask: "Should I create a formal planning run for this?" 
   If yes → `naffo_create_production_planning_run` with idempotencyKey.
10. State the next steps (start production, order materials, etc.).
