---
name: naffo-management
description: Day-to-day operations for the Naffo ERP — invoices, parties, stock checks, payments, receipts, dairy procurement lifecycle, CRM follow-ups, financial reports, and task management. Use this skill when the user asks about something that has already happened or needs to be recorded right now.
when_to_use: Create invoice, record payment, check stock, who owes money, party balance, outstanding, check receivables, record receipt, dairy procurement, gate pass, QC, weighbridge, settlement, sales report, purchase invoice, bank balance, GST, P&L, balance sheet, trial balance, CRM lead, follow up, task, overdue invoices, ledger, day book, expenses.
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
naffo_whoami          → quick: username, org name, role
naffo_get_my_profile  → full org profile: GSTIN, PAN, currency, address
naffo_get_mis_dashboard → opening snapshot: today's sales, receivables, payables, bank balances
```

Call `naffo_whoami` before any write. `organizationId` is locked to the
authenticated session — never accept it from the user.

---

## 3. Read workflows

### Parties / outstanding

| Goal | Tool |
|---|---|
| Count by type | `naffo_count_parties` |
| List all or search by name | `naffo_list_parties` / `naffo_search_party` |
| One party detail | `naffo_get_party` |
| Current outstanding balance | `naffo_get_party_outstandings` |
| Ageing buckets (0-30, 31-60, 61-90, 90+) | `naffo_get_outstanding_aging` |

> **Rule:** Use `naffo_get_party_outstandings` for plain balance questions.
> Only use `naffo_get_outstanding_aging` when the user explicitly asks for bucket analysis.

### Sales & revenue

```
naffo_list_sale_invoices     → list / filter invoices (by party, date, status)
naffo_get_sale_invoice       → one invoice detail with line items
naffo_get_sales_report       → aggregate by product | customer | month
naffo_list_overdue_invoices  → invoices past their due date
naffo_log_followup_manual    → mark a follow-up message as sent (audit trail)
```

### Purchases & payables

```
naffo_list_purchase_invoices  → list / filter vendor bills
naffo_get_purchase_invoice    → one vendor bill detail
naffo_list_payments           → payment vouchers (money out to vendors)
naffo_list_receipts           → receipt vouchers (money in from customers)
```

### Stock & inventory

```
naffo_get_stock_on_hand  → current qty per product (pass productId to scope one)
naffo_get_stock_report   → type: summary | low-stock | valuation | movement | traceability
```

### Financial reports

```
naffo_get_trial_balance    → debit/credit/net per account as of date
naffo_get_balance_sheet    → assets, liabilities, equity snapshot
naffo_get_ledger_statement → chronological entries for one account or party
naffo_get_day_book         → all transactions for a specific date
naffo_get_gstr1_summary    → outward GST summary (B2B / B2C split)
naffo_get_gstr2_summary    → inward GST / ITC summary
```

### Expenses & operating income

```
naffo_list_expenses            → operating expense and income entries
naffo_get_expense              → one entry detail
naffo_get_expense_summary      → totals by category and payment mode
naffo_list_expense_categories  → all expense/income categories
```

### Bank & cash

```
naffo_list_bank_accounts  → all bank, cash, overdraft accounts
naffo_get_bank_account    → one account detail
naffo_get_bank_ledger     → full ledger for one bank account
```

---

## 4. Dairy procurement lifecycle

The lifecycle is **strictly ordered**. Never skip a step.

```
Gate Pass (OUT) → Collection → Gate Entry (IN) → QC → Weighbridge → Settlement
```

**Always start with:**
```
naffo_dairy_procurement_whoami     → current state and pending items
naffo_dairy_procurement_next_step  → what to do next
```

Then follow the `nextTool` field in every response.

| Step | Tool / Action |
|---|---|
| Check full lifecycle map | `naffo_dairy_procurement_stages` |
| Get tools for one stage | `naffo_dairy_procurement_get_stage_tools({ stage })` |
| Check status of one entity | `naffo_dairy_procurement_status({ entityType, entityId })` |
| Execute a lifecycle step | `naffo_dairy_procurement_execute({ action, params })` |
| Diagnose contractor/tanker issues | `naffo_check_dairy_contractor_tanker_capability` |

Available `action` values for `naffo_dairy_procurement_execute`:
- `create_gate_pass`
- `record_collection`
- `record_qc`
- `record_weighbridge`
- `finalize_settlement`

Available stage values for `naffo_dairy_procurement_get_stage_tools`:
`CENTER` | `COLLECTION` | `GATE_PASS` | `QC` | `WEIGHBRIDGE` | `SETTLEMENT`

> **If a step is blocked:** report the exact `code`, `message`, and recommended
> next action from the response. Never skip ahead.

---

## 5. Procurement workflow (purchase requisition → PO → GRN)

```
naffo_procurement_whoami                         → pending MRs, RFQs, GRNs, QC tests
naffo_procurement_next_step                      → recommended next action
naffo_procurement_stages                         → full workflow map
naffo_procurement_get_stage_tools({ stage })     → tools for MR | RFQ | SQ | PO | GRN | QC
naffo_procurement_status({ entityType, entityId })
```

---

## 6. Write rules — mandatory

Every write tool requires an `idempotencyKey`. Generate it as:
```
{operation}-{YYYYMMDD}-{short-desc}
e.g. "receipt-20260830-bhargav-inv42"
```

Before any financial write (invoice, payment, receipt):
1. Resolve the party: `naffo_search_party` or `naffo_list_parties`
2. Resolve any products: `naffo_search_item`
3. For BANK mode: resolve the bank account: `naffo_list_bank_accounts`
4. Ask the user to confirm amount + party **in one message** (not separate turns)
5. Set `requiredFieldsConfirmed: true` only after user confirmation
6. On error: read `code` + `message`. Call `nextTool` if provided. Retry once.

### Key write tools

```
naffo_create_sale_invoice      → requires invoiceDate, customerId, paymentType, lines[]
naffo_create_purchase_invoice  → requires invoiceDate, vendorId, paymentType, lines[]
naffo_record_receipt           → money in from customer (also needs confirm: true)
naffo_record_payment           → money out to vendor   (also needs confirm: true)
naffo_create_fund_transfer     → bank-to-bank or bank-to-cash transfer (needs confirm: true)
naffo_create_operating_expense → record an operating expense or income entry
```

---

## 7. CRM & tasks

```
naffo_list_crm_leads    → pipeline view (filter by stage, priority, assignee, follow-up date)
naffo_add_crm_activity  → log a call, WhatsApp message, meeting, or note
naffo_crm_whoami        → pipeline / leads summary
naffo_crm_next_step     → recommended next CRM action

naffo_list_tasks        → open tasks (filter by project, status, priority)
naffo_list_projects     → task projects
naffo_create_project    → new task project
naffo_tasks_whoami      → task backlog summary
naffo_tasks_next_step   → recommended next task action
```

---

## 8. Safety rules

- **Never invent IDs, rates, or quantities.** Always resolve first.
- Financial writes are **not auto-reversible** — confirm with user before executing.
- Never echo secrets, tokens, or session credentials.
- `organizationId` is always from the authenticated session — never from the user.
- Large lists: call a count tool first (`naffo_count_parties`) to understand scale.
- Use cursor pagination (`nextCursor`, `hasMore`) for complete lists.
- Numbers in your reply must **exactly match** what the tool returned — never re-round.

---

## 9. Response style

Lead with the answer → key numbers → one clear next step.  
Reply in the user's language (Gujarati / Hindi / English / Hinglish).  
Surface data freshness or caveats in **one short line** — never bury warnings.
