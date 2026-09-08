---
name: company-priorities
description: Company Now/Next/Later priorities, feedback loops, and the weekly reset ritual in Naffo ERP. Use when the user asks what the company should focus on this week, which priorities are off track, how to move work between NOW/NEXT/LATER, or wants next-action highlighting from feedback loops.
when_to_use: company priorities, NOW NEXT LATER, feedback loop, weekly reset, what should we focus on, off track metric, next action, max 3 priorities, company focus, priority board
---

# Company Priorities + Feedback Loops

Use this skill for **company-level** Now / Next / Later priorities (module `core.priorities`).  
This is **not** task `priority` (LOW/MEDIUM/HIGH on `naffo_list_tasks`).

## Tools

```
naffo_list_priorities       → horizon [NOW/NEXT/LATER], status, includeDone, taskId, leadId
naffo_get_priority          → priorityId
naffo_create_priority       → title, horizon, doneWhen, ownerId, linkedTaskIds/LeadIds + idempotencyKey
naffo_update_priority       → priorityId + fields; linkTaskId/unlinkTaskId; linkLeadId/unlinkLeadId
naffo_move_priority         → priorityId, horizon, order  (kanban column move)

naffo_list_feedback_loops   → priorityId, status [ON_TRACK/WATCH/OFF], offTarget
naffo_create_feedback_loop  → priorityId, metricId, target, cadence [DAILY/WEEKLY], actionHints
naffo_update_feedback_loop  → feedbackLoopId + status/actionHints/target/…
```

Hard rule from the product: **at most 3 ACTIVE priorities in NOW**. Always call `naffo_list_priorities` first and read `meta.activeNowCount` before creating or moving into NOW.

## Weekly reset ritual

Run this when the user asks for a weekly reset / focus review:

1. **Snapshot** — `naffo_list_priorities` (ACTIVE) and `naffo_list_feedback_loops` with `offTarget: true`.
2. **Highlight next actions** — for every WATCH/OFF loop, surface `actionHints` (or ask the user to set one via `naffo_update_feedback_loop`). Lead with OFF, then WATCH. Tie each hint to its parent priority title + horizon.
3. **NOW capacity** — if `activeNowCount` is 3 and something important is in NEXT, propose moving a NOW item to NEXT/LATER or marking DONE before promoting.
4. **Promote / park** — with user confirmation, `naffo_move_priority` (NEXT→NOW or NOW→NEXT/LATER) using explicit `order` (0 = top of column).
5. **Refresh signals** — update loop `status` + `actionHints` for the week ahead.
6. **Link execution** — optionally `naffo_update_priority` with `linkTaskId` / `linkLeadId` so the board stays connected to tasks/CRM.

## Write rules

1. Resolve ids with list/get tools first — never invent priority or loop ids.
2. Every write needs `idempotencyKey`: `{operation}-{YYYYMMDD}-{short-desc}`.
3. Confirm title, horizon, and (for loops) metric/target/status with the user before writes.
4. Prefer `naffo_move_priority` for horizon changes; use `naffo_update_priority` for content/links/status.
5. `organizationId` always comes from the authenticated session.

## Response style

- Group by horizon: **NOW** (what must move this week) → **NEXT** → **LATER**.
- Call out ACTIVE NOW count as `n/3`.
- Put off-target feedback loops and their **next actions** at the top of the summary.
