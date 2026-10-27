---
name: gps-review
description: "Read-only review of GPS/IoT visual or interaction work against scope, approved identity, data semantics, accessibility and performance. Use for design audits or post-change verification, not to implement fixes, certify production readiness or review unrelated backend-only work."
---

# GPS Review — evidence before praise or criticism

Applicability guard: if the current request has no visual/interaction/design-session intent, do not load the design context merely because GPS/IoT is mentioned. Return to the ordinary task workflow. Honor read/propose/review-only mode before any write.

## Read-only boundary

Do not change code, registry, decisions or handoff. Run safe relevant checks only within tool permissions; request approval for side-effecting/expensive tests. No auto-fix. A review may recommend next steps but the owner decides.

## 1. Establish benchmark

Read task/accepted contract, context/design/ENTRY.md, BRAND.md, relevant product/domain files and QUALITY.md. A formal plan is not mandatory if the user's task already states the desired behavior. Ask only when no meaningful benchmark exists.

Inspect actual changed files/consumers and baseline when available. Don't infer current code from historical screenshots.

## 2. Evaluate four layers

- Intent/scope: requested work done, no missing or invented functions; new behavior/persistence implemented as claimed.
- Identity/craft: connected IoT precision + futuristic depth, hierarchy, material cohesion, meaningful originality instead of copied demo aesthetics.
- Operational integrity/accessibility: counts/timestamps/heading/severity/data truth, keyboard/touch/RTL/theme/states, non-drag alternatives and focus.
- Implementation/performance: existing architecture, rendering choice, dependency/bundle/load cost, fallback and measured evidence.

Use relevant MAP-IOT/DASHBOARD cases. For a micro change review its risk surface, not all pages. A preference is not automatically a violation.

## 3. Report

Each finding: Critical/Important/Minor; location; expected vs actual; evidence; impact; optional smallest remedy. Separate observation, interpretation and suggestion. Use PASS/FAIL/NOT TESTED/NA. Include environment and tests actually run; a still doesn't prove animation or a source read prove runtime success.

Outcome: validated for stated scope / issues found / implementation pending verification. Never "ready for production" solely because no defect was found in partial checks.

## Stop

Do not fix anything after reporting. If asked to fix, transition to a scoped gps-design task. A good review is not owner approval of the visual pattern. Use context/design/templates/review-report.md in the answer or a requested report artifact.
