---
name: process-operations
description: Process templates, instances, stage handoffs, and SLA aging in Naffo ERP. Use when the user asks about process templates, open process runs, what is on their ball, over-SLA handoffs, advancing a stage, or next-action highlighting from aging.
when_to_use: process templates, process instances, process aging, ball in court, over SLA, advance stage, handoff, Lead to Cash, Procure to Pay, month-end process, my ball, SLA aging, next action process
---

# Process Templates + Handoff / SLA Aging

Use this skill for **org process runs** (module `core.processes`) ? templates such as Lead?Cash, Procure?Pay, Month-end, plus active instances, ball-in-court ownership, and SLA aging.
This is **not** task status/priority and **not** company Now/Next/Later priorities.

## Tools

```
naffo_list_process_templates  ? status [ACTIVE/ARCHIVED]
naffo_list_process_instances  ? status [ACTIVE/DONE/CANCELLED], templateId, mine
naffo_get_process_instance    ? instanceId
naffo_advance_process_instance ? instanceId, nextOwnerId?, idempotencyKey
naffo_list_process_aging      ? mine, overSla, bucket [0-2/3-7/8-14/14+], templateId
```

Verified names from dhandho.tech `src/mcp/tools/processes.ts` (feat/process-templates-sla-aging / PR #91).

## Read flows

1. **Catalog** ? `naffo_list_process_templates` to show available templates and ids.
2. **Open work** ? `naffo_list_process_instances` with `status: ACTIVE`. Use `mine: true` for "what's on my ball".
3. **One run** ? `naffo_get_process_instance` for stage path, owner, ageDays, overSla, bucket.
4. **Aging board** ? `naffo_list_process_aging` for handoff aging. Prefer `overSla: true` first, then `mine: true`, then bucket filters.

## Advance (write) rules

1. Resolve the instance with list/get first ? never invent `instanceId`.
2. Confirm with the user: title, current stage, next stage (if known), and optional `nextOwnerId` before calling `naffo_advance_process_instance`.
3. Every advance needs `idempotencyKey`: `{operation}-{YYYYMMDD}-{short-desc}`.
4. Stage advances are **not auto-reverted** ? treat like other non-reversible operational writes.
5. `organizationId` always comes from the authenticated session.

## Next-action highlighting

When summarizing aging or "what should I do":

1. Lead with **OVER SLA** rows (from `naffo_list_process_aging` with `overSla: true`, or instances where `overSla` is true).
2. Then **my ball** (`mine: true`) sorted oldest / highest ageDays first.
3. Call out bucket: `0-2` / `3-7` / `8-14` / `14+`.
4. For each highlighted row: title, current stage, owner, ageDays, and the concrete next action ? usually "confirm advance" or "reassign owner then advance".
5. Do not advance until the user confirms.

## Response style

- Group: **Over SLA** ? **My ball** ? **Other active**.
- Show age as `Nd` and flag `OVER SLA` clearly.
- Keep template name + current stage visible on every row.
