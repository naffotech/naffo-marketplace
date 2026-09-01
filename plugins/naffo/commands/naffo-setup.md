---
description: Show a quick-start guide for connecting Claude Code to Naffo ERP
allowed-tools: Read, Bash
---

# Naffo Quick Start

Show this guide to the user:

## Connecting to Naffo

The `naffo` plugin already ships the MCP server, so there is nothing to copy or
paste. Authentication is OAuth — you sign in to your own Naffo account in the
browser and the token never appears in a config file.

1. Install the plugin (`/plugin install naffo`). The bundled MCP server points at
   `https://naffo.tech/api/mcp`.
2. On first use Claude Code opens your browser to sign in to Naffo and asks you to
   approve the connection. Scopes: `read`, `write`, `destructive` (writes such as
   invoices, payments, and receipts).
3. Run `/mcp` to check connection status, sign in again, or disconnect.

Using another MCP client, or want the server outside the plugin:

```
claude mcp add naffo --transport http https://naffo.tech/api/mcp
```

Verify the connection by asking Claude:
"Who am I in naffo?" (runs `naffo_whoami`)

If a tool reports missing access, it is a **scope or role** problem, not a wrong
URL — check the role and module permissions on your Naffo user.

## What you can do once connected

- Create sales/purchase invoices ("Create a sale invoice for X of 10 units at 500")
- Record payments and receipts
- Check stock, tax summaries, trial balance, balance sheet
- Run dairy procurement workflows end-to-end
- Follow up overdue invoices, manage CRM leads and tasks
- India GST: GSTR-1/2B/3B mapping and ITC reconciliation (the `india-gst` skill
  loads automatically when your org profile has a GSTIN)
