# Merge into existing agent instructions — do not replace them

The section below is the small routing layer to merge into the existing AGENTS.md and/or CLAUDE.md that your host actually reads. Keep all existing engineering/security/product rules. Do not paste the whole design pack into startup context.

---

## GPS / IoT design routing

Classify each task before loading design material:
- Non-design: arithmetic, data-only algorithms, backend-only fixes, general explanations or text-only editing without visual/interaction intent. Use normal workflow; do NOT load design context or activate GPS design skills.
- Visual/interaction: components, pages, maps/markers/clusters, alarms, dashboard customization, mouse cursors, hover/motion/3D or external UI adaptation. Read `context/design/ENTRY.md` and only its task-selected references.
- Mixed: apply design rules only to the interface/interaction slice; preserve normal engineering rules for the rest.
- Read/propose/review only: no code, registry or handoff edits unless separately requested.

Choose one primary GPS skill when appropriate:
- `gps-design`: scoped execution/new or existing interface; micro path for precise small changes.
- `gps-explore`: vague creative direction/alternatives; no forced concept workshop for exact edits.
- `gps-adapt`: external component/source transformation.
- `gps-dimension`: relevant 2.5D/3D/rendering trade-off, not every task.
- `gps-review`: read/test/report only.
- `gps-imprint`: requested pattern capture/audit, no automatic baseline promotion.
- `gps-recover`: diagnose a failed design iteration before more patches.
- `gps-handoff`: explicit save/restore of design continuity.

Do not invoke all skills or require a full architect cycle for a tiny edit. Natural-language tasks can select relevant skills; explicit invocation uses the host's supported syntax. If skills are not discoverable, read the named SKILL.md from its installed location and follow it without claiming native activation.

Approved direction: precise operational identity, quiet depth, science-fiction-leaning futurism and connected IoT relationships between devices/location/movement/time/data/control, with clear usability. `context/design/BRAND.md` is the reference. This is an existing app, not a rewrite.

Preserve functional contracts, real data semantics, demo labels, Arabic/English, RTL and theme choice. Dependencies, destructive actions and external writes require their usual permissions. Skills don't override them.

Before applying an old generic architect/imprint/recover/remember/review skill to GPS design, use the scoped GPS procedure instead. Old skills may remain for unrelated engineering work, but must not impose JobPilot specs or exact-class/global-white-card rules on this design work.
