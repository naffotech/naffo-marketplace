# Naffo ERP — Claude Skills

This repository contains official Claude skills and plugins for the
[Naffo ERP](https://naffo.tech) platform.

## Install in Claude Code (full plugin)

```text
/plugin marketplace add naffotech/naffo-marketplace
/plugin install naffo
```

## Install skills only (any agent)

```bash
npx skills add naffotech/naffo-marketplace
```

## Connect your MCP server

The `naffo` plugin bundles the MCP server. It's a shared OAuth 2.1 endpoint, so
there is no personal URL to copy — Claude Code signs you in through the browser
and you approve the `read`, `write`, and `destructive` scopes. Use `/mcp` to check
or refresh the connection.

For other clients, or to register the server outside the plugin:

```bash
claude mcp add naffo --transport http https://naffo.tech/api/mcp
```

Verify:
```
Who am I in Naffo?
```

## Skills included

| Skill | What it does |
|---|---|
| `naffo-erp-guide` | Core ERP rules — correct tool usage, required fields, party/product resolution, dairy lifecycle, report selection, safety rules |
| `naffo-management` | Real-time operations — invoices, payments, stock, dairy procurement, CRM, tasks, financial reports |
| `naffo-optimization` | Forward-looking analytics — demand forecasting, production planning, inventory health, anomaly detection |
| `month-end-close` | Month-end close checklist — reconcile, GST check, trial balance, anomaly scan |
| `monthly-digest` | Monthly snapshot — sales vs last month, top customers, expenses, anomaly alerts |
| `client-profitability` | Customer revenue ranking, slow-payer flags, concentration risk |
| `revenue-concentration` | Customer concentration risk with HHI score |
| `seasonal-patterns` | Monthly revenue seasonality — peak/trough index, cash planning |
| `runway-calculator` | Cash runway — burn rate, months of operation, three scenarios |
| `india-gst` | India layer — GSTR-1/2B/3B mapping, ITC reconciliation, CGST-SGST vs IGST, GSTIN/HSN reading, e-invoice & e-way bill limits, April–March FY, lakh/crore formatting |

## Skill locations

- Top-level (source of truth, read by `npx skills add` and other agents): `skills/`
- Plugin-bundled copy used by Claude Code plugin installs: `plugins/naffo/skills/`

Claude Code copies only the plugin directory on install, so the plugin needs its own
copy of each skill. Never edit `plugins/naffo/skills/` by hand — edit `skills/` and
regenerate the mirror:

```bash
node scripts/sync-skills.mjs          # write the mirror
node scripts/sync-skills.mjs --check  # CI: fail if it drifted
```

## Repo checks

```bash
node scripts/validate-repo.mjs        # manifests, version agreement, frontmatter,
                                      # command allowed-tools, agents.json registration
node scripts/check-live-tools.mjs     # every naffo_* name the skills use vs the live
                                      # MCP catalog (network; add --strict to fail)
```

`.github/workflows/validate.yml` runs the first two on every push and PR. The live
catalog check stays manual because it depends on the deployed server build: when it
reports a tool as missing, that capability must sit behind a **(gated)** marker with
a documented fallback, per the capability gate in `naffo-erp-guide`.

## Slash commands (Claude Code plugin only)

| Command | What it does |
|---|---|
| `/naffo-setup` | Quick-start connection guide |
| `/naffo-forecast` | Demand forecast for a product |
| `/naffo-analyze` | Full inventory health analysis |
| `/naffo-plan` | Production plan from demand + constraints |

## Safety

Every financial write (invoice, payment, receipt) requires explicit user
confirmation. All writes are logged in naffo.tech's audit trail.
Never invent IDs, amounts, or dates — always resolve via read tools first.
