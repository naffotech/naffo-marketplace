---
description: Forecast demand for one or more products using sales history from the Naffo ERP
allowed-tools: mcp__naffo__naffo_navigate, mcp__naffo__naffo_search_item, mcp__naffo__naffo_list_sale_invoices, mcp__naffo__naffo_get_sales_report, mcp__naffo__naffo_get_stock_on_hand, mcp__naffo__naffo_list_batch_expiry_alerts, mcp__naffo__naffo_list_calendar_events, mcp__naffo__naffo_whoami
---

Follow the `naffo-optimization` skill to generate a demand forecast.

Steps:
1. If no product was specified in the command, ask: "Which product(s) and how many days ahead?"
2. Resolve product names with `naffo_search_item`.
3. Fetch 90-day sales history with `naffo_get_sales_report({ groupBy: "product" })`.
4. Fetch current stock with `naffo_get_stock_on_hand`.
5. Check for upcoming festivals with `naffo_list_calendar_events` for the forecast window.
6. Compute avg daily demand, gap, and recommendation.
7. Present in the structured forecast format from the naffo-optimization skill.
