---
name: month-end-close
description: Run a structured month-end bookkeeping close checklist using Naffo ERP — reconcile transactions, check GST, verify trial balance, detect anomalies, and confirm books are clean before moving to the next month.
when_to_use: month-end close, close the books, monthly reconciliation, book closing, GST filing, check trial balance, month-end checklist, reconcile accounts, verify books, accounting close.
---

# Month-End Close

Structured 7-step checklist to close your books each month in Naffo ERP.

## Step 1 — Pull the period snapshot

```
naffo_get_mis_dashboard()               → today's sales, receivables, payables, bank balances
naffo_get_day_book({ fromDate, toDate }) → every transaction posted in the month
```

Confirm the date range with the user (defaults to previous calendar month).

## Step 2 — Check for anomalies

```
naffo_detect_anomalies({
  domains:       ["sales", "stock", "receivables"],
  lookback_days: 30,
  baseline_days: 90,
})
```

Report count by severity. Flag HIGH items — they must be resolved before closing.

## Step 3 — Verify receivables and payables

```
naffo_get_party_outstandings({ type: "CUSTOMER" })  → who still owes you
naffo_get_party_outstandings({ type: "VENDOR" })    → what you owe vendors
naffo_list_overdue_invoices()                        → invoices past due
```

List any invoices overdue by more than 30 days with recommended action.

## Step 4 — Reconcile bank accounts

```
naffo_list_bank_accounts()                     → all active accounts
naffo_get_bank_ledger({ bankId, fromDate, toDate }) → for each account
```

Compare closing balance in Naffo to the bank statement for each account.
Flag any difference greater than zero — do not close until reconciled.

## Step 5 — Trial balance

```
naffo_get_trial_balance()
```

Present debit/credit totals. Flag any account showing an unexpected balance
(e.g. negative cash, uncleared suspense entries).

## Step 6 — GST check

```
naffo_get_gstr1_summary({ fromDate, toDate })  → outward supply (sales tax)
naffo_get_gstr2_summary({ fromDate, toDate })  → inward supply (ITC)
```

Confirm totals match the invoice register. Flag any GSTIN mismatch or missing data.

## Step 7 — Close confirmation

Present the close summary:

```
MONTH-END CLOSE — [Month Year]
═══════════════════════════════════════════════
Checklist                             Status
───────────────────────────────────────────────
Anomalies reviewed                    ✓ / ⚠️ N open
Receivables reviewed                  ✓ / ⚠️ ₹X overdue
Bank reconciliation                   ✓ RECONCILED / ❌ ₹X diff
Trial balance balanced                ✓ / ❌
GSTR-1 outward total                  ₹XX,XXX
GSTR-2 ITC total                      ₹XX,XXX
═══════════════════════════════════════════════
Recommendation: CLOSE / HOLD (reason)
```

## Without Naffo

1. Export the month's transactions from your accounting software as CSV.
2. Check for uncategorized rows (blank Category column). Resolve each one.
3. Reconcile: sum all transactions = bank statement net change (closing − opening balance).
4. Run an accounts receivable aging report to flag overdue invoices.
5. Save the reconciled file as `YYYY-MM-close.xlsx`.

## Rules

- Close within the first 5 business days of the following month.
- Do not mark as closed if bank reconciliation shows any difference.
- HIGH anomalies from `naffo_detect_anomalies` must be reviewed before closing.
- GST filing deadlines: GSTR-1 by 11th, GSTR-3B by 20th of the following month.
