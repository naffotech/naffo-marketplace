---
description: Forecast demand for one or more products using sales history from the Naffo ERP
allowed-tools: mcp__naffo__naffo_navigate, mcp__naffo__naffo_search_item, mcp__naffo__naffo_check_forecast_readiness, mcp__naffo__naffo_get_demand_series, mcp__naffo__naffo_forecast_demand, mcp__naffo__naffo_get_product_forecast_context, mcp__naffo__naffo_get_stock_on_hand, mcp__naffo__naffo_get_sales_report, mcp__naffo__naffo_whoami
---

Follow the `naffo-optimization` skill to generate a demand forecast.

Steps:
1. If no product was specified in the command, ask: "Which product(s) and how many days ahead?"
2. Resolve product names with `naffo_search_item`.
3. Check data quality with `naffo_check_forecast_readiness({ product_ids: [...] })`.
   - If NO_DATA: tell the user and stop.
   - If THIN or STALE: warn the user before proceeding.
4. Ask the user 2 context questions (festival boost? service level priority?).
5. Run `naffo_forecast_demand` with the resolved product IDs and user answers.
6. Fetch the supply signal with `naffo_get_product_forecast_context`.
7. Compute gap = p50_total − stock_on_hand − pending_supply_qty.
8. Present in the structured forecast format from the naffo-optimization skill,
   always showing confidence tier.
