---
name: gps-imprint
description: "Capture a GPS/IoT design pattern or audit existing visual consistency when explicitly requested or an agreed capture workflow applies. Do not auto-promote code to approved style, normalize all classes, change application code or run for non-design work."
---

# GPS Imprint — learn patterns without freezing creativity

Applicability guard: if the current request has no visual/interaction/design-session intent, do not load the design context merely because GPS/IoT is mentioned. Return to the ordinary task workflow. Honor read/propose/review-only mode before any write.

## Modes

capture <target>: record an inspected component/pattern.
audit <scope>: read/report inconsistencies and propose baseline; no writes.
apply-baseline: write only the specifically owner-confirmed baseline.

No mode/target: infer only if recent scoped changes are clear and capture is requested; otherwise ask a short clarification. Do not scan the whole repository for every invocation.

## Read

context/design/ENTRY.md, BRAND.md, REGISTRY.md, DECISIONS.md and current target/consumers. Capture behavior and meaning as well as concrete visual roles. Follow existing permissions for actual file writes.

## Capture procedure

1. Inspect current source and available visual evidence; note unverified runtime behavior.
2. Record purpose, domain rationale, variant scope, tokens/type/material, state semantics, motion triggers/stops, depth tier/fallback, RTL/theme and accessibility.
3. Include external provenance/license, dependencies and measured cost or NOT TESTED. Do not invent missing paths/evidence.
4. Update one entry rather than duplicate; preserve supersession history. Default status is observed-existing or implemented-unreviewed. Only explicit owner acceptance permits owner-approved and only for the accepted scope.
5. Report what was captured and what future reuse should preserve; do not demand exact classes everywhere.

## Audit procedure

Inspect requested scope, representative roles and current token sources. Classify: true drift / intentional variant / unverified. A different radius in a showcase vs dense toolbar is not inherently a bug. An existing majority does not establish good design.

List issues by role/context, evidence and recommendation. Propose a baseline consistent with BRAND and approved entries. Stop before registry/code edits. Write baseline only after explicit agreement, not on the strength of your own report.

## Important difference from old imprint

Capture responsive/context variants, functional boundaries, motion, dimensional treatment, data meaning and reuse limits when relevant. Do not omit these merely because they are contextual. Do not preserve an accidental implementation as permanent identity.

No code fixes, global token rewrite or user approval fabricated by this skill. Use REGISTRY.md template instead of a parallel ui-registry.md.
