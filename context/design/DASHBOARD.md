# Dashboard Customization — behavior and visual identity together

## Task classification

Show/hide, reorder, resize and change information view are functional customization features with a designed interaction model. Inspect current widgets/state/storage first; do not produce draggable mock cards and call the feature complete.

## Contract before implementation

Define widget identity, supported capabilities and persistence scope. Ask if the unresolved choice materially changes architecture: per-user server preferences vs this-browser local demo, edit mode apply/cancel vs immediate save, shared layouts vs private layouts. If user delegates a demo, a local-only option may be chosen and labeled explicitly. Do not invent backend endpoints or cross-device sync.

Do not ask a dozen styling questions. Use existing theme and widget structure; surface only consequential behavior decisions.

## Capability model (illustrative, not mandatory schema)

A widget definition may expose stable id, title, min/max grid spans, supported sizes, allowed view kinds, optional hideability, and a renderer for a fixed metric/query.

A layout preference may store schemaVersion, widget ids/order/positions, sizes, visibility, and view kind. Keep preferences separate from telemetry/data/permissions. Hidden widgets are not deleted, and restored widgets retain identity. Persist serializable choices, not component functions or unsafe code.

Use existing state architecture before introducing a new store. Display variants must use compatible data: a single KPI cannot become a historical line chart without history. A chart/table swap must preserve metric, units, filters and time range. Don't create extra view modes for every widget just to meet an example.

## Interaction model

- View mode prioritizes reading; edit/customize mode makes handles/options explicit.
- Widget library/visibility list allows restore of hidden items; all-hidden state provides a clear recovery action.
- Drag handle does not steal chart interactions or text selection.
- Keyboard and explicit click/tap move controls, position menu or equivalent non-drag alternatives.
- Resize handle with clear boundaries plus size presets or numeric controls; a keyboard-only alternative is insufficient for non-drag pointer access.
- View selector shows only supported variants and explains unavailable choices.
- Use save/cancel or immediate persistence consistently; make state visible. Offer reset-to-default; resetting saved preferences should have an appropriate confirmation/undo within current app conventions.
- Critical/pinned widgets may be non-hideable only if product policy defines them; don't invent this policy.

## Responsive and RTL layout

Use stable ids, not array indices, to preserve chart/filter state through reorder. Define how layout reflows at narrow widths: stacking, size constraints, and canonical order. Do not silently persist a mobile fallback over the desktop arrangement.

Horizontal move direction should match visible RTL order. Avoid flip-based CSS that reverses chart data or actual chronological meaning. Keep focus on moved/resized widget or explain where it went; announcements can be polite and concise.

If resizing a map/chart, notify/recompute with that renderer's supported resize mechanism when container dimensions change. Don't assume rerender alone updates a map canvas.

## Persistence and migration

Use existing preferences services if present. Otherwise state local-only vs server scope explicitly. Include versioning/defaults; validate known ids, bounds and allowed views on restore. Merge newly added widget defaults deliberately. Handle removed widgets, duplicate/unknown ids, malformed JSON, storage failure, schema upgrades and stale saved layouts. Scope preferences appropriately to user/account if real multi-user login exists; do not leak one user's layout to another.

Save semantic layout at commit/end of interaction or a controlled debounce, not every pointer pixel. Avoid needless live data resubscription or resetting timers when layout changes.

No database or production writes without their required approval. Local UI edits and external connector actions are different permission contexts.

## Performance

Don't add a giant dashboard/drag framework before comparing existing tools and required accessibility. New dependencies need project permission. Batch layout measurement, limit reflow, pause expensive offscreen decorations and avoid canvas per widget just for depth. Use CSS transforms for drag previews when compatible; do not sacrifice actual resize correctness.

## Acceptance cases

1. Hide then restore the same widget without data/identity loss.
2. Reorder via drag, keyboard and click/tap alternative.
3. Resize with min/max constraints and non-drag presets.
4. Switch supported view without changing metric/time/filter meaning.
5. Reload restores preferences in the agreed scope; no persistence claims without test.
6. Mobile layout does not corrupt desktop arrangement; RTL controls match visual movement.
7. All hidden, reset, save failure, invalid saved config and newly added/removed widget.
8. Charts/map recompute dimensions; controls and focus remain usable.
9. Live data stays live during layout edits; no duplicate subscriptions.

## Output

Report design idea, state/persistence decisions, preserved functions, implementation, tests and limitations. Registry stores reusable customization grammar; task record stores feature-specific choices. This document defines expectations, not proof of implementation.
