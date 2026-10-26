# Quality Gates and Evidence

## Outcome states

For each relevant check: PASS / FAIL / NOT TESTED / NOT APPLICABLE, with evidence. Code review, still screenshot, browser interaction, accessibility test and performance profile prove different things.

No untested gate becomes PASS because code looks plausible. "Implemented, awaiting verification" is an honest deliverable. Aesthetic approval is separate from measured quality.

## Non-negotiable checks

- Scope and functional continuity: routes/selection/filters/panels/actions preserved or changes explicitly agreed.
- Data integrity: demo/live, missing/zero, stale/current, movement/connectivity, counts/units/thresholds distinct.
- Usability: first focal point, readable hierarchy, unobstructed geography and predictable controls.
- Identity: futuristic operational IoT direction, not generic SaaS assembly or copied external brand.
- Accessibility: critical actions don't require hover, hue, dragging, motion or 3D alone.
- Theme/language: affected modes/palettes, actual Arabic/English and mixed-direction values checked.
- Performance/fallback: no unjustified rendering escalation, resource cleanup and usable fallback.

## Proportionate checking

Micro marker edit: inspect selection/hit target/rotation/theming, narrow and dense map, don't run a page-wide redesign audit.
Dashboard feature: full relevant acceptance matrix from DASHBOARD.md plus persisted state/gesture checks.
Hero 3D: loading boundary/static meaning/reduced motion/assets/bundle and interaction checks.
Read-only review: no code, registry or handoff writes unless separately requested.

## Accessibility target

Aim for WCAG 2.2 AA for changed UI; reduced-motion support is an additional project requirement. Interaction animation criterion 2.3.3 is AAA, not AA.

- Text contrast typically 4.5:1 normal, 3:1 large; relevant non-text controls/graphics typically 3:1, applying actual criteria/exceptions.
- Target size 24x24 CSS px minimum under 2.5.8 with spacing/exceptions; prefer ~44px for primary touch controls where practical. Visible arrow can be small while hit region is larger.
- Semantic controls, names/labels, visible focus, logical focus order, expanded/selected states, correct modal focus/escape.
- Keyboard operation and explicit single-pointer non-drag alternatives for essential dragging functions. They are separately evaluated requirements.
- Zoom/reflow/readability, no unintended overflow; dense tables may need deliberate scrolling.
- No essential hover-only information; static equivalent for 3D/canvas diagrams; decoration hidden appropriately.
- Review sustained auto-motion pause/stop/hide and avoid flashing.
- Streaming announcements should not overwhelm assistive technology or steal focus.

## Representative matrix

Desktop ~1440px, compact ~1024px, narrow ~390px; these are test cases not forced breakpoints. Also reflow/zoom when relevant. Arabic/RTL + English/LTR with long labels, IDs and numbers; dark/light and affected alternate palette; fine/coarse pointer; keyboard; reduced motion; relevant states.

Map: light/dark tiles, bearing/pitch if supported, selected member, clusters merge/split, alert overlays, pan/zoom, hit targets and attribution.

## Evidence-based performance

Use same-environment baseline/after with cache, device, browser, route and measurement tools. Separate initial/deferred JS/assets from runtime GPU/CPU work. Check repeated navigation/listener cleanup, offscreen work and map/chart resize. Follow DEPTH-PERFORMANCE.md budgets. Never call demo data proof of production scalability.

## Review report

Scope and baseline → findings sorted by severity → evidence → limitations → verification status → owner decision needed.
Each finding: severity, location, expected/actual, evidence, consequence. Suggest a small remedy if useful, but never auto-fix in review-only mode.

Severity: critical (data/permissions/core workflow/critical alarm broken), important (accessibility, material regression, persistent state or major design drift), minor (small polish). Not all style preferences are defects; label preference vs requirement.

## Craft questions

Is the design domain-specific without its accent? Does futurism clarify or obscure? Is one focal point enough? Are standard controls recognizable? Does 3D explain anything? Is composition varied for major content but coherent in material/state language? Does operator intent survive failure/reduced motion/touch?

Score or discuss these as a review aid, not a scientific beauty metric. Do not claim production readiness from a static or source-only review.
