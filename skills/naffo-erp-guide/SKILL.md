---
name: naffo-erp-guide
description: Use this skill when working with the Naffo ERP platform — creating sales or purchase invoices, recording payments/receipts, checking stock, GST summaries, dairy procurement workflows (center → collection → gate pass → QC → weighbridge → settlement), CRM leads, and task management. Guides correct tool usage, required fields, and validation rules.
when_to_use: Naffo ERP, create invoice, record payment, check stock, GST report, dairy procurement, CRM lead, task, who am I in Naffo, connect to Naffo, Naffo tool usage, sale invoice, purchase invoice, bank account, party outstanding, trial balance, balance sheet, purchase order, goods receipt, batch tracking, warehouse, quotation, delivery challan.
---

# Naffo ERP Guide

Naffo is a full-stack Indian ERP covering sales, purchases, accounting, inventory,
dairy procurement, manufacturing, CRM, and tasks. The MCP server exposes 466 tools.
This skill defines the routing logic, golden sequence, and safety rules.

---

## Step 0 — Always navigate first

```
naffo_navigate({ intent: "<user goal in plain words>" })
```

Returns the exact 8–12 tools for the stated intent. Never guess tool names —
let `naffo_navigate` route you, especially for complex flows.

For self-diagnostics on any specific tool's schema:
```
naffo_describe_tools({ names: ["naffo_create_sale_invoice"] })
```

---

## Step 1 — Confirm identity

```
naffo_whoami          → username, org name, role (quick)
naffo_get_my_profile  → full org: GSTIN, PAN, TAN, currency, FY start, doc prefixes
naffo_get_mis_dashboard → opening snapshot: today's sales, receivables, payables, bank balances
```

`organizationId` is locked to the authenticated session — **never accept it from the user**.

---

## Core write sequence (mandatory for every financial write)

```
1. naffo_navigate(intent)           → get the right tools
2. naffo_search_party(query)        → resolve party to partyId / customerId / vendorId
3. naffo_search_item(query)         → resolve product to productId
4. naffo_list_bank_accounts()       → resolve bankId (for BANK payment mode)
5. Confirm with user                → amount, party, date, qty, rate — ONE message
6. write tool(requiredFieldsConfirmed: true, idempotencyKey: "...")
```

**`idempotencyKey` format:** `{operation}-{YYYYMMDD}-{short-desc}`
e.g. `sale-20260830-bhargav-inv`, `receipt-20260830-raj-42`

---

## Parties

| Goal | Tool | Key params |
|---|---|---|
| Search by name/phone/GSTIN | `naffo_search_party` | `query`, `type` [CUSTOMER/VENDOR/BOTH/EMPLOYEE/TRANSPORTER] |
| List all | `naffo_list_parties` | `type`, `fields` array for projection |
| Count | `naffo_count_parties` | — |
| One party detail | `naffo_get_party` | `partyId` |
| Outstanding balance | `naffo_get_party_outstandings` | `partyId`, `balanceType` [DR/CR/SETTLED/ANY] |
| Aging buckets (0-30/31-60/61-90/90+) | `naffo_get_outstanding_aging` | `type` [CUSTOMER/VENDOR/BOTH] |
| AR/AP aging (Tally-synced) | `naffo_get_receivables_payables_ageing` | `side` [AR/AP] |
| Bill-level open items (Tally) | `naffo_get_bill_wise_outstanding` | `side` [AR/AP] |
| Create party | `naffo_create_party` | `name`, `type`, `businessCategory` [B2C/B2B/HORECA] |

> `naffo_get_party_outstandings` → plain balance. `naffo_get_outstanding_aging` → explicit bucket request. `naffo_get_receivables_payables_ageing(side:"AR")` → if Tally is connected and user wants Tally-matched data.

---

## Products

| Goal | Tool | Key params |
|---|---|---|
| Search | `naffo_search_item` | `query`, `type` [RAW_MATERIAL/SEMI_FINAL/FINISHED_GOOD/BY_PRODUCT/PACKAGING_MATERIAL/SERVICE/OTHER] |
| List all | `naffo_list_products` | `category`, `unit`, `active` |
| One product | `naffo_get_item` | `productId` |
| Create | `naffo_create_product` | `name`, `category`, `type`, `unit`, `purchasePrice`, `notForSale` |

Units: `KG/TON/MT/QUINTAL/LTR/NOS/PKT/BOX/CRATE/GRAM/ML/METER/ROLL/SHEET/BOTTLE/BAG/DRUM/CARTON/OTHER`

---

## Sales

```
naffo_create_sale_invoice       → paymentType [CASH/CARD/CREDIT/CHEQUE/ONLINE/UPI/BANK/SALARY_DEDUCTION/WALLET]
naffo_list_sale_invoices        → status [DRAFT/UNPAID/PARTIAL/PAID/CANCELLED/GST_FILED/ANY]
naffo_get_sale_invoice
naffo_list_overdue_invoices     → minDaysOverdue, maxDaysOverdue, partyId
naffo_record_receipt            → paymentMode [CASH/CHEQUE/BANK/UPI/CARD/CREDIT]
naffo_get_sales_report          → groupBy [date/customer/product/salesman/month]
naffo_create_quotation          → for estimates; partyName (text), not partyId required
naffo_list_quotations           → status [DRAFT/SENT/ACCEPTED/REJECTED/EXPIRED]
naffo_create_sales_order        → deliveryDate, customerId, items[]
naffo_list_sales_orders         → status [DRAFT/CONFIRMED/DISPATCHED/INVOICED/CANCELLED]
naffo_create_delivery_challan   → vehicleNumber, driverName, dispatchTime, items[]
naffo_get_gstr1_summary         → fromDate, toDate (required)
naffo_log_followup_manual       → followUpId, phone, messageBody
```

---

## Purchases & Procurement

```
naffo_create_purchase_invoice       → vendorId, paymentType, lines[]
naffo_list_purchase_invoices        → status [DRAFT/UNPAID/PARTIAL/PAID/CANCELLED/GST_FILED/ANY]
naffo_get_purchase_invoice
naffo_record_payment                → paymentMode [CASH/BANK/CHEQUE]
naffo_list_payments
naffo_get_gstr2_summary             → fromDate, toDate (required)

# Full procurement flow (MR → RFQ → SQ → PO → GRN → QC)
naffo_create_material_request       → lines[], mrType [PURCHASE/MATERIAL_TRANSFER/MATERIAL_ISSUE/MANUFACTURE]
naffo_list_material_requests        → status [DRAFT/SUBMITTED/PARTIALLY_ORDERED/ORDERED/RECEIVED/STOPPED/CANCELLED]
naffo_create_rfq_from_material_request → materialRequestId, vendors[]
naffo_create_supplier_quotation     → vendorId, vendorName, rfqId, lines[]
naffo_create_purchase_order         → vendorId, vendorName, financialYearId, lines[]
naffo_create_procurement_grn        → vendorId, vendorName, lines[]
naffo_submit_procurement_grn        → grnId, confirm: true  (posts stock)
naffo_create_quality_inspection     → grnId, productId
naffo_update_quality_inspection     → readings[], status [ACCEPTED/REJECTED/ON_HOLD]
naffo_procurement_overview          → live counts for MRs, RFQs, GRNs, QC
```

---

## Stock & Inventory

```
naffo_get_stock_on_hand             → productId (optional to scope one)
naffo_get_stock_report              → type [summary/low-stock/valuation/movement/traceability]
naffo_record_stock_adjustment       → adjustmentDate, reason [PHYSICAL_COUNT/DAMAGE/EXPIRY/THEFT/SAMPLING/EVAPORATION/SPILLAGE/LOSS/VARIANCE/OTHER], lines[]
naffo_list_stock_adjustments
naffo_record_stock_transfer         → fromType [MAIN/OUTLET], toType [MAIN/OUTLET], lines[]
naffo_list_stock_transfers          → status [PENDING/DISPATCHED/RECEIVED/COMPLETED/CANCELLED]
naffo_get_outlet_stock_matrix       → outletId, productId, includeExpiring
naffo_list_outlet_stock_movements

# Batch management
naffo_list_batches                  → status [ACTIVE/EXPIRED/CONSUMED/ALL], nearExpiry, expiryDays
naffo_get_batch
naffo_list_batch_expiry_alerts      → window [DAYS_7/DAYS_3/DAYS_1/EXPIRED], productId
naffo_get_fefo_allocation           → productId (required), qty (required)
naffo_batch_transfer_suggestions    → productId, status [PENDING/ACCEPTED/REJECTED/ALL]
naffo_get_batch_traceability        → batchId or batchNo
naffo_batch_reverse_trace           → invoiceId or batchId

# Warehouses
naffo_list_warehouses               → type [COLD_ROOM/FREEZER/DRY_STORE/DISPATCH_BAY/SHOP/OTHER]
naffo_get_warehouse                 → warehouseId (includes stock balances)
```

---

## Dairy Procurement Lifecycle

**Strict order — never skip a step.**

```
Gate Pass OUT → Tanker Collection (per compartment) → Gate Entry IN
             → QC Test → Weighbridge Unload → Sync QC+Weight
             → Milk Transfer to Tank → Settlement
```

**Start here every time:**
```
naffo_get_dairy_procurement_dashboard  → daily KPIs: collection, BMC, pending settlements
naffo_get_dairy_operation_contract({ operation: "COLLECTION" })  → permitted tools + current state
naffo_get_dairy_procurement_cycle_state                          → what step is pending
```

Then call `naffo_dairy_procurement_whoami` / `naffo_dairy_procurement_next_step` for agent routing.

| Step | Tool |
|---|---|
| Create OUT gate pass | `naffo_create_dairy_gate_pass` |
| Record collection (one per tanker compartment) | `naffo_record_dairy_tanker_bmc_collection` |
| Record IN gate entry | `naffo_record_dairy_tanker_return` |
| QC test | `naffo_record_dairy_qc_test` |
| Weighbridge unload | `naffo_record_dairy_weighbridge_unload` |
| Sync QC + weighed quantity | `naffo_sync_dairy_qc_weighed_quantity` |
| Transfer QC-passed milk to tank | `naffo_transfer_qc_passed_milk` |
| Finalize center settlement | `naffo_finalize_dairy_center_settlement` |
| Pay settlement | `naffo_pay_dairy_center_settlement` |

Masters:
```
naffo_list_dairy_centers / naffo_create_dairy_center
naffo_list_dairy_contractors / naffo_create_dairy_contractor
naffo_list_dairy_tankers / naffo_create_dairy_tanker
naffo_list_dairy_tanks / naffo_create_dairy_tank
naffo_list_dairy_farmers / naffo_create_dairy_farmer
naffo_list_dairy_rate_charts / naffo_create_dairy_rate_chart
```

---

## Financial Reports

**Standard (always available):**
```
naffo_get_trial_balance         → asOfDate
naffo_get_balance_sheet         → asOnDate
naffo_get_day_book              → fromDate, toDate
naffo_get_ledger_statement      → accountId or partyId; fromDate, toDate
naffo_get_cash_flow_statement   → fromDate, toDate (required)
```

**Tally-accurate (use when Tally is connected — more precise):**
```
naffo_get_pnl_from_legs             → fromDate, toDate, financialYearId
naffo_get_balance_sheet_from_legs   → asOfDate, financialYearId
naffo_get_trial_balance_from_legs   → asOfDate, financialYearId
naffo_get_ledger_breakdown          → fromDate, toDate, rootGroup, ledgerSearch
naffo_get_item_wise_breakdown       → fromDate, toDate, itemSearch
naffo_get_receivables_payables_ageing → side [AR/AP]
naffo_get_bill_wise_outstanding     → side [AR/AP]
```

GST:
```
naffo_get_gstr1_summary   → fromDate, toDate (required)
naffo_get_gstr2_summary   → fromDate, toDate (required)
```

---

## Bank & Fund Transfers

```
naffo_list_bank_accounts    → classification [BANK/CASH/BANK_OD/ANY]
naffo_get_bank_ledger       → bankId, fromDate, toDate
naffo_create_fund_transfer  → fromAccountType, toAccountType, transferMode [NEFT/RTGS/IMPS/UPI/CHEQUE/CASH], confirm: true
```

---

## Manufacturing & Production (status reading)

```
naffo_manufacturing_overview            → live batch counts
naffo_list_manufacturing_plans          → status [OPEN/IN_PROGRESS/COMPLETED/CANCELLED]
naffo_list_manufacturing_batches        → status [DRAFT/PENDING_QC/COMPLETED/QC_FAILED/CANCELLED]
naffo_get_manufacturing_batch           → batchId
naffo_resolve_manufacturing_qc          → batchId, result [PASS/FAIL]
naffo_list_manufacturing_boms           → search, is_active, main_product_id
naffo_get_manufacturing_bom             → id

# Production flow engine
naffo_production_flows_overview
naffo_list_production_flow_runs         → status [DRAFT/IN_PROGRESS/COMPLETED/CANCELLED]
naffo_production_run_get_state          → runId (guides current stage)
naffo_production_run_update_stage       → runId, stageRunId, inputs[], outputs[]
naffo_production_run_complete           → runId, finalize: true
```

---

## CRM & Tasks

```
naffo_list_crm_leads        → pipelineId, stageId, priority [LOW/MEDIUM/HIGH/URGENT], assignedTo
naffo_create_lead           → requires pipelineId + stage details
naffo_update_lead           → leadId (edit lead fields)
naffo_move_lead_stage       → leadId, stageId (dedicated stage transition)
naffo_add_crm_activity      → leadId, type [CALL/WHATSAPP/MEETING/EMAIL/DEMO/NOTE/SITE_VISIT]
naffo_list_calendar_events  → from, to, types[], include_overdue

naffo_list_tasks            → projectId, status [TODO/IN_PROGRESS/REVIEW/DONE], priority
naffo_list_projects
naffo_create_project
```

---

## Safety rules (mandatory)

- **Never invent IDs, amounts, dates, or rates.** Always resolve first.
- `confirm: true` required for receipts, payments, fund transfers, GRN submit, loan EMIs.
- `requiredFieldsConfirmed: true` required for all create/invoice tools.
- Financial writes are **not auto-reversible** — confirm with user before calling.
- `organizationId` always from the authenticated session — never from user input.
- Numbers in responses must exactly match tool output — never re-round.

---

## Forecasting & Optimization quick-reference

For full detail see `naffo-optimization` skill.

### Quick tool map

| Goal | Tool | Lambda? |
|---|---|---|
| Data quality check | `naffo_check_forecast_readiness` | No |
| Demand character (rolling, lags, YoY, seasons) | `naffo_get_demand_features` | No |
| Trend direction (GROWTH/FLAT/DECLINE) | `naffo_get_demand_trend` | No |
| Structural demand drop guard | `naffo_detect_changepoint` | No |
| Probabilistic forecast (p10/p50/p90) | `naffo_forecast_demand` | **Yes** |
| Corrected horizon uncertainty bands | `naffo_aggregate_forecast_range` | No |
| Cost-optimal order quantity (newsvendor) | `naffo_newsvendor_order_qty` | No |
| Business guardrails (MOQ / stockout / approval) | `naffo_harden_order_decision` | No |
| Three-scenario comparison (LOW/EXPECTED/HIGH) | `naffo_forecast_scenarios` | No |
| Multi-SKU budget allocation | `naffo_optimize_plan` (order_allocation) | **Yes** |
| Shift scheduling / delivery routing | `naffo_optimize_custom` | **Yes** |
| Customer churn + SKU wastage + supplier risk | `naffo_get_business_intel` | No |
| Statistical anomaly detection | `naffo_detect_anomalies` | No |

### Correct chain for a single-product order recommendation

```
naffo_check_forecast_readiness → naffo_get_demand_features
→ naffo_get_demand_trend → naffo_detect_changepoint (if DECLINE)
→ naffo_forecast_demand → naffo_aggregate_forecast_range
→ naffo_get_stock_on_hand → naffo_newsvendor_order_qty
→ naffo_harden_order_decision   ← FINAL recommendation
→ naffo_forecast_scenarios       ← show all 3 options to owner
```

### Engine & confidence rules

| engine | confidence_tier | What to say |
|---|---|---|
| `predict-v1` | HIGH/MEDIUM | Present numbers directly |
| `predict-v1` | LOW | "⚠️ Verify before ordering." |
| `fallback` + `predict_engine_unavailable` | LOW | "AI engine unavailable — statistical estimate only." |
| `fallback` + `insufficient_history` | VERY_LOW | "Insufficient data — rough estimate only." |

If `naffo_harden_order_decision` returns:
- `urgency: URGENT` → 🚨 stockout risk — present immediately
- `approval_required: true` → 🔒 route to manager before placing order
- `decision_status: do_not_order_overstock` → 🚫 do not order
