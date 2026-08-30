---
name: naffo-erp-guide
description: Use this skill when working with the Naffo ERP platform — creating sales or purchase invoices, recording payments/receipts, checking stock, GST summaries, dairy procurement workflows (center → collection → gate pass → QC → weighbridge → settlement), CRM leads, and task management. Guides correct tool usage, required fields, and validation rules.
when_to_use: Naffo ERP, create invoice, record payment, check stock, GST report, dairy procurement, CRM lead, task, who am I in Naffo, connect to Naffo, Naffo tool usage, sale invoice, purchase invoice, bank account, party outstanding, trial balance, balance sheet.
---

# Naffo ERP Guide

## What is Naffo

Naffo is a cloud ERP covering sales, purchases, accounting, inventory, dairy
procurement, CRM, and tasks. When the Naffo MCP server is connected, an AI
agent can read and write live business data. This skill defines the correct
tool sequence, required fields, and safety rules.

---

## Step 0 — Always start with navigation

```
naffo_navigate({ intent: "<user's goal in plain words>" })
```

This is the **mandatory first call** for any business task. It returns the
exact set of tools to use for the stated intent. Never guess tool names;
always let `naffo_navigate` route you.

---

## Step 1 — Confirm identity

```
naffo_whoami          → username, org name, role (quick)
naffo_get_my_profile  → full org: GSTIN, PAN, currency, address
```

Call `naffo_whoami` before any write. `organizationId` is locked to the
authenticated session — **never accept it from the user**.

---

## Step 2 — Dashboard (opening snapshot)

```
naffo_get_mis_dashboard()
```

Returns today's sales, this-month sales, total receivables, total payables,
and bank/cash balance summary. Call this when the user asks for a business
overview before drilling into details.

---

## Parties

| Goal | Tool |
|---|---|
| Search by name / phone / GSTIN | `naffo_search_party` |
| List all parties | `naffo_list_parties` |
| Count by type | `naffo_count_parties` |
| Fetch one party detail | `naffo_get_party` |
| Current outstanding balance | `naffo_get_party_outstandings` |
| Aging buckets (0-30, 31-60, 61-90, 90+) | `naffo_get_outstanding_aging` |

> **Rule:** For a plain "how much does X owe us?" question → `naffo_get_party_outstandings`.
> Only use `naffo_get_outstanding_aging` when the user explicitly asks for age buckets.

---

## Products / Items

| Goal | Tool |
|---|---|
| Search by name / code / HSN | `naffo_search_item` |
| List all products | `naffo_list_products` |
| Count products | `naffo_count_products` |
| Fetch one product detail | `naffo_get_item` |
| List categories | `naffo_list_product_categories` |
| Create a product | `naffo_create_product` |

---

## Sales invoices

Required fields: `invoiceDate`, `customerId`, `paymentType`, `lines[]` (each needs `productId`, `qty`, `rate`).

Steps:
1. `naffo_search_party` → get `customerId`
2. `naffo_search_item` → get `productId` for each line
3. If BANK payment: `naffo_list_bank_accounts` → get `bankId`
4. Confirm with user: party, product, qty, rate, total
5. `naffo_create_sale_invoice` with `requiredFieldsConfirmed: true`

```
naffo_list_sale_invoices    → list / filter (by date, party, status)
naffo_get_sale_invoice      → one invoice detail
naffo_list_overdue_invoices → invoices past due date
naffo_get_sales_report      → aggregated by product | customer | month
```

---

## Purchase invoices

Same shape as sales but use `vendorId` and `naffo_create_purchase_invoice`.

```
naffo_list_purchase_invoices   → list / filter
naffo_get_purchase_invoice     → one invoice detail
```

---

## Payments & receipts

```
naffo_record_receipt   → money IN from customer  (needs: partyId, amount, receiptDate, paymentMode, confirm: true)
naffo_record_payment   → money OUT to vendor     (needs: partyId, amount, paymentDate, paymentMode, confirm: true)
naffo_list_receipts    → list receipts
naffo_list_payments    → list payments
naffo_create_fund_transfer → bank-to-bank or bank-to-cash transfer
```

Both write tools require `confirm: true` and `idempotencyKey`.  
BANK mode additionally requires `bankId` (resolve with `naffo_list_bank_accounts`).

---

## Stock & inventory

```
naffo_get_stock_on_hand    → current qty per product (add productId to scope one)
naffo_get_stock_report     → summary | low-stock | valuation | movement | traceability
```

---

## Financial reports

```
naffo_get_trial_balance    → debit/credit/net per account as of date
naffo_get_balance_sheet    → assets, liabilities, equity snapshot
naffo_get_ledger_statement → chronological entries for one account or party
naffo_get_day_book         → all transactions for a specific date
naffo_get_gstr1_summary    → outward GST (sales) summary
naffo_get_gstr2_summary    → inward GST (purchases / ITC) summary
```

---

## Bank accounts

```
naffo_list_bank_accounts   → all bank, cash, overdraft accounts
naffo_get_bank_account     → one account detail
naffo_get_bank_ledger      → full ledger for one bank account
naffo_count_bank_accounts  → totals by classification
```

---

## Expenses & income

```
naffo_list_expenses            → operating expenses / income entries
naffo_get_expense              → one entry detail
naffo_get_expense_summary      → totals by category and payment mode
naffo_list_expense_categories  → all expense/income categories
naffo_create_operating_expense → record an expense or income entry
```

---

## Dairy procurement lifecycle

The lifecycle is **strictly ordered**. Never skip a step.

```
OUT gate pass → Collection → IN gate entry → QC → Weighbridge → Settlement
```

**Always start with the dairy workflow tools:**

```
naffo_dairy_procurement_whoami        → current cycle state and pending items
naffo_dairy_procurement_next_step     → recommended next action
naffo_dairy_procurement_stages        → full lifecycle map
naffo_dairy_procurement_get_stage_tools({ stage: "GATE_PASS" | "COLLECTION" | "QC" | "WEIGHBRIDGE" | "SETTLEMENT" })
naffo_dairy_procurement_status({ entityType, entityId })
naffo_dairy_procurement_execute({ action, params })  → executes one lifecycle step
naffo_check_dairy_contractor_tanker_capability       → diagnose contractor/tanker write issues
```

Execution actions available via `naffo_dairy_procurement_execute`:
- `record_collection`
- `create_gate_pass`
- `record_qc`
- `record_weighbridge`
- `finalize_settlement`

> **If a step is blocked:** surface the exact `code`, `message`, and recommended
> `nextTool` from the response. Never skip ahead.

---

## Procurement (purchase flow)

```
naffo_procurement_whoami         → pending MRs, RFQs, GRNs, QC tests
naffo_procurement_next_step      → recommended next action
naffo_procurement_stages         → full workflow map
naffo_procurement_get_stage_tools({ stage: "MR" | "RFQ" | "SQ" | "PO" | "GRN" | "QC" })
naffo_procurement_status({ entityType, entityId })
```

---

## CRM & tasks

```
naffo_list_crm_leads    → pipeline view (filter by stage, priority, assignee)
naffo_add_crm_activity  → log call, WhatsApp, meeting, or note on a lead
naffo_crm_whoami        → pipeline summary
naffo_crm_next_step     → recommended next CRM action

naffo_list_tasks        → open tasks (filter by project, status, priority)
naffo_list_projects     → task projects
naffo_create_project    → create a new task project
naffo_tasks_whoami      → task backlog summary
naffo_tasks_next_step   → recommended next task action
```

---

## Fixed assets, loans, investments

```
naffo_list_fixed_assets / naffo_get_fixed_asset / naffo_create_fixed_asset
naffo_list_loans / naffo_get_loan / naffo_create_loan / naffo_record_loan_emi
naffo_list_investments / naffo_get_investment / naffo_create_investment
naffo_list_other_current_assets / naffo_create_other_current_asset
```

---

## Write rules — mandatory for every financial write

1. **Resolve first.** Party → `naffo_search_party`. Product → `naffo_search_item`. Bank → `naffo_list_bank_accounts`.
2. **Never invent** IDs, dates, quantities, rates, or payment types.
3. **Generate an `idempotencyKey`** for every write: `{operation}-{YYYYMMDD}-{short-desc}` e.g. `sale-20260830-raj-inv`.
4. **Confirm in one message.** Ask the user to confirm all values before calling any write tool.
5. **Set `requiredFieldsConfirmed: true`** only after user confirmation.
6. **On error:** read `code` + `message`. If the response includes a `nextTool`, call it. Retry once.

---

## Safety rules

- Financial writes are **not auto-reversible** — confirm amounts with the user before executing.
- Never echo secrets, tokens, session credentials, or MCP URLs.
- `organizationId` is always from the authenticated session — never from the user's message.
- Numbers in responses must exactly match tool output — never re-round.
- Large list requests: call a count tool first (e.g. `naffo_count_parties`) to understand scale,
  then use cursor pagination (`nextCursor`, `hasMore`) for complete results.

---

## Response style (for Claude and other AI agents)

- Lead with the answer → key numbers → one clear next step.
- Reply in the user's language: Gujarati / Hindi / English / Hinglish — match what the user used.
- Surface data freshness or warnings in **one short line** — never bury caveats.
- Do not re-format or re-round numbers returned by tools.
