---
description: Analyze current inventory — stock levels, days of supply, expiry risk, and reorder alerts across all products or a specific product
allowed-tools: mcp__naffo__naffo_navigate, mcp__naffo__naffo_get_stock_on_hand, mcp__naffo__naffo_get_stock_report, mcp__naffo__naffo_get_sales_report, mcp__naffo__naffo_detect_anomalies, mcp__naffo__naffo_search_item, mcp__naffo__naffo_whoami
---

Follow the `naffo-optimization` skill to analyze inventory health.

Steps:
1. If a product was specified, resolve it with `naffo_search_item`; otherwise analyze all.
2. Fetch current stock:
   - `naffo_get_stock_on_hand` — current quantities per product
   - `naffo_get_stock_report({ type: "low-stock" })` — products below reorder level
   - `naffo_get_stock_report({ type: "valuation" })` — stock value
3. Compute avg daily demand from 30-day sales history:
   `naffo_get_sales_report({ groupBy: "product", fromDate: <30 days ago>, toDate: <today> })`
4. Compute days_of_supply = current_stock ÷ avg_daily_demand per product.
5. Classify each product:
   - 🔴 CRITICAL: days_of_supply < lead_time_days (or < 3 days if unknown)
   - 🟡 LOW: days_of_supply < 2 × lead_time_days
   - ✅ ADEQUATE: days_of_supply in normal range
   - ⚠️ EXCESS: days_of_supply > 60 days
6. Run anomaly detection for the stock domain:
   `naffo_detect_anomalies({ domains: ["stock"], lookback_days: 30, baseline_days: 90 })`
7. Present as a table with product, stock qty, days of supply, status, and recommended action.
