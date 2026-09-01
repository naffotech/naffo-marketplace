---
name: naffo-management
description: Day-to-day operations for the Naffo ERP — invoices, parties, stock, batches, warehouse transfers, payments, receipts, module-specific workflows (dairy procurement, manufacturing, etc.), CRM follow-ups, financial reports, and task management. Use this skill when the user asks about something that has already happened or needs to be recorded right now.
when_to_use: Create invoice, record payment, check stock, who owes money, party balance, outstanding, receivables, record receipt, dairy procurement, gate pass, QC, weighbridge, settlement, sales report, purchase invoice, bank balance, tax report, P&L, balance sheet, trial balance, CRM lead, follow up, task, overdue invoices, ledger, day book, expenses, purchase order, GRN, batch expiry, stock transfer, warehouse, delivery challan, quotation, manufacturing batch.
---

# Naffo Management

Handles **all real-time, transactional, and operational** questions against Naffo ERP.

---

## 1. Start here — every time

```
naffo_navigate({ intent: "<user's goal in plain words>" })
```

Returns 8–12 domain-specific tools and a routing tip. Use **only those tools**.

For detailed schema of any tool:
```
naffo_describe_tools({ names: ["naffo_create_sale_invoice"] })
```

---

## 2. Identity & snapshot

```
naffo_whoami              → username, org name, role
naffo_get_my_profile      → currency, FY start, org address,
                            tax IDs (fields vary by country — e.g. GSTIN/PAN/TAN for India)
naffo_get_mis_dashboard   → today's sales, receivables, payables, bank balances
```

---

## 3. Parties & outstanding

| Goal | Tool | Note |
|---|---|---|
| Search by name/phone/tax ID | `naffo_search_party` | `type`: CUSTOMER/VENDOR/BOTH/EMPLOYEE/TRANSPORTER |
| List all | `naffo_list_parties` | add `fields[]` for projection |
| Count | `naffo_count_parties` | — |
| One party | `naffo_get_party` | — |
| Plain balance | `naffo_get_party_outstandings` | `balanceType`: DR/CR/SETTLED/NOT_COMPUTED/ANY |
| Aging buckets | `naffo_get_outstanding_aging` | `type`: CUSTOMER/VENDOR/BOTH |
| AR/AP aging (Tally) | `naffo_get_receivables_payables_ageing` | `side`: **AR** or **AP** |
| Open bills (Tally) | `naffo_get_bill_wise_outstanding` | `side`: AR or AP |
| Overdue invoices | `naffo_list_overdue_invoices` | `minDaysOverdue`, `maxDaysOverdue`, `partyId` |

> Plain balance → `naffo_get_party_outstandings`.  
> Explicit aging bucket request → `naffo_get_outstanding_aging`.  
> Tally-connected orgs prefer `naffo_get_receivables_payables_ageing(side:"AR")` for accuracy.

---

## 4. Sales

### Invoices & receipts
```
naffo_create_sale_invoice      → invoiceDate, customerId, paymentType, lines[productId+qty+rate]
                                   paymentType: CASH/CARD/CREDIT/CHEQUE/ONLINE/UPI/BANK/SALARY_DEDUCTION/WALLET
naffo_list_sale_invoices       → partyId, status [DRAFT/UNPAID/PARTIAL/PAID/CANCELLED/GST_FILED/ANY]
naffo_get_sale_invoice         → invoiceId
naffo_record_receipt           → partyId, amount, receiptDate, paymentMode, confirm: true
                                   paymentMode: CASH/CHEQUE/BANK/UPI/CARD/CREDIT
naffo_list_receipts
naffo_log_followup_manual      → followUpId, phone, messageBody
```

### Quotations & orders
```
naffo_create_quotation         → quotationDate, partyName, lines[productName+qty+rate]
naffo_list_quotations          → status [DRAFT/SENT/ACCEPTED/REJECTED/EXPIRED/ANY]
naffo_get_quotation            → quotationId

naffo_create_sales_order       → customerId, orderDate, items[productId+qty+rate]
naffo_list_sales_orders        → status [DRAFT/CONFIRMED/DISPATCHED/INVOICED/CANCELLED]
naffo_get_sales_order          → orderId
naffo_get_sales_order_dashboard
```

### Delivery
```
naffo_create_delivery_challan  → vehicleNumber, driverName, dispatchTime, items[]
naffo_list_delivery_challans   → status [PENDING/DISPATCHED/IN_TRANSIT/DELIVERED/CANCELLED]
naffo_get_delivery_challan     → challanId
```

### POS
```
naffo_pos_list_outlets
naffo_get_pos_daily_summary    → date, outletId, topN
naffo_list_outlet_orders       → outletId, status [DRAFT/SUBMITTED/FULFILLED/CANCELLED]
naffo_get_outlet_stock_matrix  → outletId, productId, includeExpiring
naffo_list_outlet_stock_movements → outletId, productId, sinceDays
```

### Reports
```
naffo_get_sales_report         → groupBy [date/customer/product/salesman/month]
naffo_get_purchase_report      → groupBy [date/vendor/product/month]  ← aggregated purchase totals
naffo_get_payment_summary      → total receipts + payments by mode for a period
naffo_get_cash_flow_summary    → operating/financing breakdown + closing bank balance
naffo_get_gstr1_summary        → fromDate, toDate  (India GST — skip if not applicable)
```

---

## 5. Purchases & Procurement

### Simple purchase flow
```
naffo_create_purchase_invoice  → invoiceDate, vendorId, paymentType, lines[productId+qty+rate]
                                   paymentType: CASH/CREDIT/CHEQUE/ONLINE/UPI/BANK
naffo_list_purchase_invoices   → vendorId, status [DRAFT/UNPAID/PARTIAL/PAID/CANCELLED/GST_FILED/ANY]
naffo_get_purchase_invoice     → invoiceId
naffo_record_payment           → partyId, amount, paymentDate, paymentMode, confirm: true
naffo_list_payments
naffo_create_purchase_order    → vendorId, vendorName, financialYearId, lines[]
naffo_list_purchase_requests   → status [DRAFT/SUBMITTED/APPROVED/REJECTED/CANCELLED/CONVERTED_TO_PO]
naffo_get_purchase_request     → id
naffo_get_gstr2_summary        → fromDate, toDate  (India GST — skip if not applicable)
```

### Production procurement (MR → RFQ → SQ → GRN → QC)
```
naffo_procurement_overview               → live counts
naffo_create_material_request            → lines[], mrType [PURCHASE/MATERIAL_TRANSFER/MATERIAL_ISSUE/MANUFACTURE]
naffo_update_material_request            → materialRequestId, status [SUBMITTED/STOPPED/CANCELLED]
naffo_create_rfq_from_material_request   → materialRequestId, vendors[]
naffo_list_procurement_rfqs              → status [DRAFT/SENT/QUOTED/CLOSED/CANCELLED]
naffo_create_supplier_quotation          → vendorId, vendorName, lines[], rfqId
naffo_update_supplier_quotation          → supplierQuotationId, status [RECEIVED/SELECTED/REJECTED/EXPIRED]
naffo_create_purchase_order_from_supplier_quotation → supplierQuotationId
naffo_create_procurement_grn             → vendorId, vendorName, lines[], poId
naffo_create_grn_quality_inspections     → grnId
naffo_update_quality_inspection          → qualityInspectionId, readings[], status [ACCEPTED/REJECTED/ON_HOLD]
naffo_submit_procurement_grn             → grnId, confirm: true  ← posts stock
naffo_list_procurement_grns              → status [DRAFT/QUALITY_INSPECTION_PENDING/QUALITY_APPROVED/SUBMITTED/COMPLETED/CANCELLED]
```

### Transport bills
```
naffo_create_procurement_transport_bill  → billDate, transporterId
naffo_pay_procurement_transport_bill     → transportBillId, amount, confirm: true
```

---

## 6. Stock & Inventory

### On-hand & reports
```
naffo_get_stock_on_hand      → productId (optional to scope one), asOfDate
naffo_get_stock_report       → type [summary/low-stock/valuation/movement/traceability], productId
```

### Adjustments & transfers
```
naffo_record_stock_adjustment → adjustmentDate, reason, lines[]
                                  reason: PHYSICAL_COUNT/DAMAGE/EXPIRY/THEFT/SAMPLING/EVAPORATION/SPILLAGE/LOSS/VARIANCE/OTHER
naffo_list_stock_adjustments  → status [PENDING/APPROVED/REJECTED]
naffo_record_stock_transfer   → fromType [MAIN/OUTLET], toType [MAIN/OUTLET], lines[]
naffo_list_stock_transfers    → status [PENDING/DISPATCHED/RECEIVED/COMPLETED/CANCELLED], outletId
```

### Batches & FEFO
```
naffo_list_batches             → status [ACTIVE/EXPIRED/CONSUMED/ALL], nearExpiry (bool), expiryDays
naffo_get_batch                → batchId
naffo_list_batch_expiry_alerts → window [DAYS_7/DAYS_3/DAYS_1/EXPIRED], productId
naffo_get_fefo_allocation      → productId (required), qty (required)
naffo_batch_transfer_suggestions → productId, status [PENDING/ACCEPTED/REJECTED/ALL]
naffo_get_batch_traceability   → batchId or batchNo
naffo_batch_reverse_trace      → invoiceId or batchId
```

### Warehouses
```
naffo_list_warehouses  → type [COLD_ROOM/FREEZER/DRY_STORE/DISPATCH_BAY/SHOP/OTHER]
naffo_get_warehouse    → warehouseId (includes stock balances)
naffo_create_warehouse → name, code, type, capacityKg/Ltr
```

---

## 7. Dairy Procurement Lifecycle

> **Dairy module only** — available when the org has dairy procurement enabled. Skip if not applicable.

**Strictly ordered — never skip a step.**

```
Gate Pass (OUT) → Tanker Collection → Gate Entry (IN) → QC Test
               → Weighbridge Unload → Sync QC+Weight → Milk Transfer → Settlement
```

**Always start with:**
```
naffo_get_dairy_procurement_dashboard  → KPIs: collection, pending settlements
naffo_get_dairy_operation_contract({ operation: "COLLECTION" })  → permitted tools + cycle state
naffo_dairy_procurement_whoami   → current pending items
naffo_dairy_procurement_next_step → recommended next action
```

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
| Pay center settlement | `naffo_pay_dairy_center_settlement` |

Status tools:
```
naffo_list_dairy_gate_passes
naffo_list_dairy_qc_tests
naffo_list_dairy_settlements
naffo_list_dairy_tanker_loads / naffo_list_dairy_tanker_unloads
naffo_list_dairy_milk_transfers
naffo_dairy_procurement_status({ entityType, entityId })
```

Dairy masters:
```
naffo_list_dairy_centers / naffo_create_dairy_center
naffo_list_dairy_contractors / naffo_create_dairy_contractor_with_tanker
naffo_list_dairy_tankers / naffo_create_dairy_tanker
naffo_list_dairy_tanks / naffo_create_dairy_tank
naffo_list_dairy_farmers / naffo_create_dairy_farmer
naffo_list_dairy_rate_charts / naffo_create_dairy_rate_chart
naffo_list_dairy_quality_standards / naffo_create_dairy_quality_standard
```

If a step is blocked: report exact `code`, `message`, and `nextTool` from response.

---

## 8. Manufacturing & Production

### Status & batches
```
naffo_manufacturing_overview             → live counts
naffo_list_manufacturing_plans           → status [OPEN/IN_PROGRESS/COMPLETED/CANCELLED]
naffo_get_manufacturing_plan             → id
naffo_list_manufacturing_batches         → status [DRAFT/PENDING_QC/COMPLETED/QC_FAILED/CANCELLED], recipe_id
naffo_get_manufacturing_batch            → id
naffo_resolve_manufacturing_qc           → batchId, result [PASS/FAIL]
naffo_list_manufacturing_boms            → search, main_product_id
naffo_get_manufacturing_bom              → id
```

### Production flow engine (advanced)
```
naffo_production_flows_overview
naffo_production_flow_search             → query, status [DRAFT/ACTIVE/ARCHIVED], industry (optional filter)
naffo_production_flow_get                → flowId
naffo_list_active_production_flow_runs
naffo_list_production_flow_runs          → flowId, status [DRAFT/IN_PROGRESS/COMPLETED/CANCELLED]
naffo_production_run_get                 → runId
naffo_production_run_get_state           → runId (guides next input/output needed)
naffo_production_run_update_stage        → runId, stageRunId, inputs[], outputs[], parameters{}
naffo_production_run_complete            → runId, finalize: true
naffo_get_production_flow_run_live_costs → runId
```

---

## 9. Financial Reports

**Standard (always available):**
```
naffo_get_trial_balance       → asOfDate
naffo_get_balance_sheet       → asOnDate
naffo_get_day_book            → fromDate, toDate
naffo_get_ledger_statement    → accountId or partyId; fromDate, toDate
naffo_get_expense_summary     → fromDate, toDate
naffo_get_sales_report        → groupBy [date/customer/product/salesman/month]
naffo_get_purchase_report     → groupBy [date/vendor/product/month]
naffo_get_payment_summary     → total receipts + payments by mode (scalar totals, no raw rows)
naffo_get_cash_flow_summary   → operating/financing cash flow + closing balance
```

**Tally-accurate (use when Tally is synced):**
```
naffo_get_pnl_from_legs               → fromDate, toDate, financialYearId
naffo_get_balance_sheet_from_legs     → asOfDate, financialYearId
naffo_get_trial_balance_from_legs     → asOfDate, financialYearId
naffo_get_ledger_breakdown            → fromDate, toDate, rootGroup, ledgerSearch
naffo_get_item_wise_breakdown         → fromDate, toDate, itemSearch (stock item P&L)
naffo_get_receivables_payables_ageing → side [AR/AP], asOfDate
naffo_get_bill_wise_outstanding       → side [AR/AP], asOfDate
naffo_get_tally_voucher_summary       → fromDate, toDate
```

**Bank:**
```
naffo_list_bank_accounts   → classification [BANK/CASH/BANK_OD/ANY]
naffo_get_bank_ledger      → bankId, fromDate, toDate
naffo_create_fund_transfer → fromAccountType, toAccountType, transferMode, amount, confirm: true
```

**Tax reports** *(region-dependent — check which apply to your org):*
```
naffo_get_gstr1_summary   → fromDate, toDate  (India: GST output summary)
naffo_get_gstr2_summary   → fromDate, toDate  (India: GST input tax credit summary)
```

---

## 10. Expenses & income

```
naffo_create_operating_expense  → date, categoryId, amount, transactionMode [EXPENSE/INCOME], paymentMode
naffo_list_expenses             → categoryId, transactionMode [EXPENSE/INCOME/ANY], status [PAID/PENDING/CANCELLED/ANY]
naffo_get_expense_summary       → fromDate, toDate
naffo_list_expense_categories   → type [EXPENSE/INCOME/ANY]
```

---

## 11. CRM & tasks

```
naffo_list_crm_leads    → pipelineId, stageId, priority [LOW/MEDIUM/HIGH/URGENT], dueBefore
naffo_create_lead       → pipeline + party details
naffo_update_lead       → leadId (edit fields)
naffo_move_lead_stage   → leadId, stageId  ← dedicated stage transition tool
naffo_add_crm_activity  → leadId, type [CALL/WHATSAPP/MEETING/EMAIL/DEMO/NOTE/SITE_VISIT], outcome
naffo_list_calendar_events → from, to, types[], include_overdue

naffo_list_tasks        → projectId, status [TODO/IN_PROGRESS/REVIEW/DONE], priority
naffo_list_projects
naffo_create_project
```

---

## 12. HR & Payroll

```
naffo_list_employees        → search, activeOnly, sortBy
naffo_get_employee          → employeeId
naffo_count_employees
naffo_create_employee       → name, designation, department, salary, joiningDate
naffo_list_departments / naffo_create_department
naffo_list_payroll_records  → employeeId, month (YYYY-MM)
```

---

## 13. Other assets

```
naffo_list_fixed_assets / naffo_get_fixed_asset / naffo_create_fixed_asset
  depreciationType: SLM or WDV

naffo_list_loans / naffo_get_loan / naffo_create_loan / naffo_record_loan_emi
  loanType: SECURED/UNSECURED/LENT

naffo_list_investments / naffo_get_investment / naffo_create_investment

naffo_list_other_current_assets / naffo_create_other_current_asset
  (e.g. prepaid expenses, withholding tax receivable, security deposit)
```

---

## 14. Write rules — mandatory

1. **Resolve first.** Party → `naffo_search_party`. Product → `naffo_search_item`. Bank → `naffo_list_bank_accounts`.
2. **`idempotencyKey` on every write:** `{operation}-{YYYYMMDD}-{short-desc}`
3. **One confirm message.** Ask user to confirm all values before calling any write tool.
4. `requiredFieldsConfirmed: true` only after user confirms.
5. `confirm: true` required for: `record_receipt`, `record_payment`, `create_fund_transfer`, `submit_procurement_grn`, `record_loan_emi`.
6. On error: read `code` + `message`. If response includes `nextTool`, call it. Retry once.

---

## 15. Safety rules

- Never invent IDs, rates, or quantities — always resolve first.
- Financial writes are not auto-reversible — confirm with user before executing.
- Never echo secrets, tokens, or session credentials.
- `organizationId` always from the authenticated session — never from the user.
- Large lists: count first (`naffo_count_parties`), then paginate (`nextCursor`, `hasMore`).
- Numbers in responses must **exactly match** tool output — never re-round.

---

## 16. Response style

Lead with the answer → key numbers → one clear next step.  
Reply in the user's language.  
Surface caveats in **one short line** — never bury warnings.
