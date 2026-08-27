---
description: Analyze current inventory — stock levels, days of supply, expiry risk, and reorder alerts across all products or a specific product
allowed-tools: mcp__naffo__naffo_navigate, mcp__naffo__naffo_get_stock_on_hand, mcp__naffo__naffo_get_outlet_stock_matrix, mcp__naffo__naffo_list_batch_expiry_alerts, mcp__naffo__naffo_get_fefo_allocation, mcp__naffo__naffo_batch_transfer_suggestions, mcp__naffo__naffo_get_sales_report, mcp__naffo__naffo_search_item, mcp__naffo__naffo_whoami
---

Follow the `naffo-optimization` skill to analyze inventory health.

Steps:
1. If a product was specified, resolve it with `naffo_search_item`; otherwise analyze all.
2. Fetch stock: `naffo_get_stock_on_hand` (warehouse view) + `naffo_get_outlet_stock_matrix` (outlet view).
3. Fetch expiry alerts: `naffo_list_batch_expiry_alerts`.
4. Compute avg daily demand from 30-day sales history (`naffo_get_sales_report`).
5. Compute days_of_supply = current_stock ÷ avg_daily_demand per product.
6. Classify each product:
   - 🔴 CRITICAL: days_of_supply < lead_time_days
   - 🟡 LOW: days_of_supply < 2 × lead_time_days
   - ✅ ADEQUATE: days_of_supply in normal range
   - ⚠️ EXCESS: days_of_supply > 60 days
   - ☠️ EXPIRY RISK: batch expiring < 7 days
7. Present as a table with action recommendations.
8. If any products have `naffo_batch_transfer_suggestions`, include top transfer picks.
