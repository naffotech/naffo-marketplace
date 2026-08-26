# Naffo Marketplace

Official Claude Code plugins and skills for the **Naffo ERP** platform — sales, purchases, accounting, inventory, GST, dairy procurement (center → collection → gate pass → QC → weighbridge → settlement), CRM, and task management.

## Install

In Claude Code, run:

```text
/plugin marketplace add naffotech/naffo-marketplace
/plugin install naffo
```

That's it — the `naffo` plugin and its skills are now available in your session.

## What's inside

### Plugins

| Plugin | Description |
|---|---|
| [`naffo`](./plugins/naffo) | Guided workflows & skills for working with Naffo ERP from Claude Code |

### Skills included

- **naffo-erp-guide** — best practices for using Naffo MCP tools correctly: resolving parties/products before writing data, required-field validation for invoices/payments, dairy procurement workflow order, and report selection.

## Requirements

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code)
- A Naffo account with MCP access enabled (Settings → Integrations → MCP)

## Updating

```text
/plugin update naffo
```

## Contributing / Issues

Open an issue on this repository or contact the Naffo team.

## License

MIT
