---
name: gps-design
description: "Implement or redesign GPS/IoT interface components, pages, markers, map cursors, alarms or dashboard customization in the existing app. Use for concrete visual or interaction work, not pure calculations, backend-only changes, review-only or read-only requests."
---

# GPS Design — execute with proportional depth

Applicability guard: if the current request has no visual/interaction/design-session intent, do not load the design context merely because GPS/IoT is mentioned. Return to the ordinary task workflow. Honor read/propose/review-only mode before any write.

## Input and boundaries

Use the user's target, intent, mode and constraints. Read repository instructions, context/design/ENTRY.md, BRAND.md and relevant baseline/registry entries. Read current target and shared consumers; inspect pending changes without overwriting unrelated work.

This is not a blank-canvas rewrite. Preserve functional/data contracts, language, theme, focus and navigation. A user asking only for ideas does not authorize implementation. This skill does not authorize external writes, paid assets, destructive actions or new dependencies.

## 1. Select a path

Micro: exact small change, e.g. circle to small arrow or refine map cursor. State narrow target; inspect semantics, states and renderer. Use existing identity, implement a reversible solution and run focused checks. No forced three-concept presentation, terminology interview or global audit.

Standard: new meaningful component or page redesign. Define a concise contract: user job / available data / preserved behavior / proposed behavior / scope / success criteria. Use context/design/templates/task-contract.md when the task needs a record, not for every CSS adjustment.

Behavior-rich: dashboard customization, alarm workflows or changed cluster interaction. Read DASHBOARD.md or MAP-IOT.md; separate appearance from new state/persistence/actions. Clarify consequential gaps; do not create backend APIs or change severity/aggregation silently.

Ambiguous creative goal: consult gps-explore, not an unrelated engineering architect ritual. If the user delegated implementation, choose a reversible concept; otherwise propose and stop.

## 2. Author the solution

Choose expression level and a domain rationale. Standard primitives may stay familiar. Custom composition should reflect location/device/time/data/control. Preserve sci-fi-leaning identity without visual competition around critical content.

Read VISUAL.md and task-relevant INTERACTION.md. For imported code consult gps-adapt/EXTERNAL.md. For expensive dimensional treatment consult gps-dimension/DEPTH-PERFORMANCE.md. Do not run all skills as a mandatory chain.

## 3. Implement incrementally

Pilot important section when changing a page. Preserve routes, props/handlers, selection, filters and data truth. Reuse tokens; no second theme. No full-page refactor for a marker task. Scoped CSS/custom SVG is welcome; dependency escalation needs justification/permission.

If unavailable integration blocks actual behavior, label fixtures and isolate adapter boundary. A local preference is not cross-device persistence; an acknowledged preview event is not server-resolved.

## 4. Validate

Use QUALITY.md proportionately and current tools. Test behavior, real language/modes, keyboard/touch/reduced motion, and relevant map/chart resize/rendering. Compare before/after if screenshots are available. Source-only work remains visually unverified. Failed check is not approval.

## Output

- Target, chosen design idea and expression level.
- Implemented paths/changes and preserved behavior.
- Data/persistence/dependency decisions and limitations.
- Checks actually run with PASS/FAIL/NOT TESTED.
- Reusable pattern candidates and approval state.

Do not automatically invoke imprint/save or edit records in read-only mode. A normal implementation may report candidates; capture them when requested or project workflow explicitly authorizes it. Never mark owner-approved yourself.
