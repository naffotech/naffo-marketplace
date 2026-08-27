---
name: naffo-erp-guide
description: Use this skill when working with the Naffo ERP platform — creating sales or purchase invoices, recording payments/receipts, checking stock, GST summaries, dairy procurement workflows (center → collection → gate pass → QC → weighbridge → settlement), CRM leads, and task management. Guides correct tool usage, required fields, and validation rules.
---

# Naffo ERP Guide

## Overview

Naffo is an ERP platform covering sales, purchases, accounting, inventory,
dairy procurement, CRM, and tasks. When connected via the Naffo MCP server,
Claude can read and write business data directly. This skill describes the
correct way to use Naffo tools.

## Golden rules

1. **Never invent IDs, dates, payment types, quantities, or rates.** Always
   resolve parties with `naffo_search_party` / `naffo_list_parties` and
   products with `naffo_search_item` first.
2. **Ask before writing money.** For any invoice, payment, receipt, or
   transfer, gather ALL missing required values in one question and set
   `requiredFieldsConfirmed=true` only after the user supplied or confirmed them.
3. **Read tools first.** Use `naffo_get_mis_dashboard` as an opening snapshot
   (today's sales, receivables, payables, bank balances).
4. **Plain outstanding questions** → `naffo_get_party_outstandings`.
   Ageing-bucket analysis only → `naffo_get_outstanding_aging`.

## Common workflows

### Sales invoice
Required: invoiceDate, customerId, paymentType, lines (productId, qty, rate).
- Resolve customer: `naffo_search_party type=CUSTOMER`
- Resolve products: `naffo_search_item`
- BANK payment additionally requires bankId (`naffo_list_bank_accounts`)
- Create with `naffo_create_sale_invoice`

### Purchase invoice
Same shape but vendorId; use `naffo_create_purchase_invoice`.

### Payments & receipts
- `naffo_record_receipt` (money in from customer)
- `naffo_record_payment` (money out to vendor)
- Both require explicit `confirm=true`; BANK mode requires bankId.

### Dairy procurement
Flow: Center → Collection → Gate Pass → QC → Weighbridge → Settlement.
Start with `naffo_dairy_procurement_whoami` and follow `next_step`
recommendations.

### Reports
- Stock: `naffo_get_stock_on_hand`, `naffo_get_stock_report`
- Sales trends: `naffo_get_sales_report groupBy=product|customer|month`
- GST: `naffo_get_gstr1_summary` / `naffo_get_gstr2_summary`
- Books sanity: `naffo_get_trial_balance`, `naffo_get_balance_sheet`

## Safety

- Financial writes are logged and not auto-reversible; prefer confirming
  amounts with the user.
- Never echo secrets, tokens, or credentials.
