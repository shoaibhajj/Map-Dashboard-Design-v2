---
name: gps-recover
description: "Diagnose failed GPS/IoT visual iterations, broken interactions, performance regressions or wrong design direction before more patches. Use after design work goes wrong, not for generic backend debugging, ordinary creative exploration or destructive Git resets."
---

# GPS Recover — diagnose the failed dimension

Applicability guard: if the current request has no visual/interaction/design-session intent, do not load the design context merely because GPS/IoT is mentioned. Return to the ordinary task workflow. Honor read/propose/review-only mode before any write.

Read user feedback, current target/diff, previous accepted task, context/design/ENTRY.md and relevant BRAND/domain/QUALITY. Don't force the user to repeat evidence already available.

## 1. Identify failure

Expected vs actual, last known good point, attempts already made, and what can be verified. "It feels ordinary" is a design mismatch, not necessarily a code bug. "Arrow wrong after map rotates" may be a renderer/coordinate bug, not weak art direction.

Classify one or more:
- isolated behavior/visual bug;
- identity/concept mismatch;
- cognitive/semantic failure (count, heading, alarm meaning);
- performance/rendering problem;
- scope/context drift across failed patches.

Explain diagnosis and uncertainty. Do not call a root cause proven without evidence. If evidence is insufficient propose the next smallest diagnostic check.

## 2. Choose response

Targeted fix for isolated causes; concept rethink for wrong metaphor/hierarchy; rendering-tier simplification for unjustified effects; scoped clean reimplementation only if preserving good work is understood.

For concept mismatch propose a genuinely different idea rather than polish the same rejected layout. For a failed fix, re-examine the diagnosis; don't repeat blind patches. Two failures are a warning to reassess, not mathematical proof the whole project is wrong.

## 3. Protect work

Read pending changes. Preserve accepted behavior and unrelated edits. "Reset" means a clean brief/context or scoped proposal, never automatic git reset --hard, deleting files, reverting other work or force-pushing. Any destructive rollback requires specific informed permission and normal tool gates.

## 4. Output and mode

Diagnosis/evidence → smallest corrective approach → keep/change list → validation needed. If user already authorized a bounded fix and diagnosis supports it, execute within that scope via gps-design. For a rethink/global or destructive change, present and wait for required agreement.

If session handoff is better, offer a compact reset note; save via gps-handoff only if requested. Don't claim a fresh session is always necessary or forbid all continuation as a ritual.
