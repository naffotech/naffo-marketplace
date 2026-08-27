---
name: naffo-management
description: Day-to-day operations for the Naffo ERP — invoices, parties, stock checks, payments, receipts, dairy procurement lifecycle, CRM follow-ups, financial reports, and task management. Use this skill when the user asks about something that has already happened or needs to be recorded right now.
---

# Naffo Management

Handles **all real-time, transactional, and operational** questions against the
Naffo ERP: what's in stock, who owes us money, record a payment, check today's
sales, follow up a CRM lead, run the dairy procurement cycle, view P&L.

---

## 1. Start here — every time

```
naffo_navigate({ intent: "<user's goal in plain words>" })
```

This returns 8–12 domain-specific tools and a routing tip tailored to the
intent. Use **only those tools**. Do not guess tool names.

---

## 2. Identity & context

```
naffo_whoami         → quick check: username, org name, role
naffo_get_my_profile → full org profile: GSTIN, PAN, currency, address
```

Call `naffo_whoami` before any write. `organizationId` is always locked to your
authenticated session — never accept it from the user.

---

## 3. Read workflows

### Parties / outstanding

| Goal | Tool |
|---|---|
| Count by type | `naffo_count_parties` |
| List all or search by name | `naffo_list_parties` / `naffo_search_party` |
| Current balance | `naffo_get_party_outstandings` |
| Ageing buckets (0-30, 31-60…) | `naffo_get_outstanding_aging` |

> **Rule:** Use `naffo_get_party_outstandings` for plain balance questions.
> Only use aging when the user explicitly asks for bucket analysis.

### Sales & revenue

```
naffo_list_sale_invoices          → list / filter invoices
naffo_get_sales_report            → aggregate by product | customer | month
naffo_get_receivables_payables_ageing → overdue analysis
naffo_get_bill_wise_outstanding   → open bill detail per party
```

### Purchases & payables

```
naffo_list_purchase_invoices      → list / filter
naffo_list_purchase_requests      → material requests
naffo_get_purchase_request        → one request detail
```

### Stock & inventory

```
naffo_get_stock_on_hand           → current qty per product
naffo_list_stock_transfers        → past transfers
naffo_get_outlet_stock_matrix     → all outlets × all products (one call)
naffo_list_batch_expiry_alerts    → products near expiry
naffo_get_fefo_allocation         → first-expiry-first-out pick plan
```

### Financial reports

```
naffo_get_pnl_from_legs           → P&L (Tally-accurate, matches to paise)
naffo_get_balance_sheet_from_legs → balance sheet
naffo_get_ledger_breakdown        → drill into any ledger account
naffo_get_trial_balance_from_legs → trial balance
naffo_get_day_book                → all transactions for a date
naffo_get_gstr1_summary           → outward GST summary
naffo_get_gstr2_summary           → inward GST summary
```

### Manufacturing & production status

```
naffo_list_manufacturing_plans    → current plans
naffo_get_manufacturing_batch     → one batch detail
naffo_list_dairy_production_plans → dairy-specific plans
naffo_list_production_flows       → production flow overview
```

---

## 4. Dairy procurement lifecycle

The lifecycle is **strictly ordered**. Never skip a step.

```
OUT gate pass → collection (one entry per compartment) → IN gate entry
             → QC test → weighbridge unload → milk transfer → settlement
```

**Always start with:**
```
naffo_get_dairy_operation_contract({ operation: "COLLECTION" })
```
This returns the permitted tools for each step and the current cycle state.
Follow the `nextTool` field in every response.

| Step | Tool |
|---|---|
| Create OUT gate pass | `naffo_create_dairy_gate_pass` |
| Record collection (per compartment) | `naffo_record_dairy_tanker_bmc_collection` |
| Record IN gate entry | `naffo_record_dairy_tanker_return` |
| QC test | `naffo_record_dairy_qc_test` |
| Weighbridge unload | `naffo_record_dairy_weighbridge_unload` |
| Sync QC + weight | `naffo_sync_dairy_qc_weighed_quantity` |
| Milk transfer to tank | `naffo_transfer_qc_passed_milk` |
| Settlement | `naffo_finalize_dairy_center_settlement` |

> **If a step is blocked:** report the exact `code`, `message`, and `nextTool`
> from the response. Never skip ahead.

---

## 5. Write rules — mandatory

Every write tool requires an `idempotencyKey`. Generate it as:
```
{operation}-{YYYYMMDD}-{short-desc}
e.g. "receipt-20260826-vendor-raj-inv42"
```

Before any financial write (invoice, payment, receipt):
1. Resolve the party: `naffo_search_party` or `naffo_list_parties`
2. Resolve any products: `naffo_search_item`
3. For BANK mode: resolve the bank account: `naffo_list_bank_accounts`
4. Ask the user to confirm amount + party **in one message** (not separate turns)
5. Set `requiredFieldsConfirmed: true` only after user confirmation
6. On error: read `code` + `message` + `nextTool`. Call `nextTool` if provided. Retry once.

### Key write tools

```
naffo_create_sale_invoice         → requires invoiceDate, customerId, paymentType, lines[]
naffo_create_purchase_invoice     → requires invoiceDate, vendorId, paymentType, lines[]
naffo_record_receipt              → money in from customer (also needs confirm: true)
naffo_record_payment              → money out to vendor   (also needs confirm: true)
```

---

## 6. CRM & tasks

```
naffo_list_crm_leads              → pipeline view
naffo_move_lead_stage             → advances a lead (Won → auto-creates Party)
naffo_list_tasks                  → open tasks
naffo_add_crm_activity            → log a follow-up or call note
```

---

## 7. Safety rules

- **Never invent IDs, rates, or quantities.** Always resolve first.
- Financial writes are **not auto-reversible** — confirm with user before executing.
- Never echo secrets, tokens, or session credentials.
- Large lists: call a count tool first (`naffo_count_parties`) to understand scale.
- Use cursor pagination (`nextCursor`, `hasMore`) for complete lists.
- Numbers in your reply must **exactly match** what the tool returned — never re-round.

---

## 8. Response style

Lead with the answer → key numbers → one clear next step.  
Reply in the user's language (Gujarati / Hindi / English / Hinglish).  
Surface data freshness or caveats in **one short line** — never bury warnings.
