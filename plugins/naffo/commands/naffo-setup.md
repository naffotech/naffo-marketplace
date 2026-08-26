---
description: Show a quick-start guide for connecting Claude Code to Naffo ERP
allowed-tools: Read, Bash
---

# Naffo Quick Start

Show this guide to the user:

## Connecting to Naffo

1. Get your MCP connection details from Naffo Settings → Integrations → MCP.
2. Add the Naffo MCP server:

```
claude mcp add naffo --transport <type-from-settings> <connection-details>
```

3. Verify the connection by asking Claude:
   "Who am I in naffo?" (runs `naffo_whoami`)

## What you can do once connected

- Create sales/purchase invoices ("Create a sale invoice for X of 10 units at 500")
- Record payments and receipts
- Check stock, GST summaries, trial balance, balance sheet
- Run dairy procurement workflows end-to-end
- Follow up overdue invoices, manage CRM leads and tasks
