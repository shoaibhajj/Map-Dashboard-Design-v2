---
name: gps-handoff
description: "Save or restore the current GPS/IoT design session when explicitly requested, with redacted context and approval state. Not for generic memory, automatic saving every turn, unrelated tasks or implicit continuation of implementation."
---

# GPS Handoff — compact, truthful continuity

Applicability guard: if the current request has no visual/interaction/design-session intent, do not load the design context merely because GPS/IoT is mentioned. Return to the ordinary task workflow. Honor read/propose/review-only mode before any write.

## Modes

save: update context/design/HANDOFF.md for this design task.
restore: read handoff and referenced relevant context, summarize without implementation.
No mode: ask save or restore. Do not repurpose root memory.md or engineering trackers.

## Save

Read existing handoff before writing. Capture verified changed paths, current working/partial/broken state, concept, accepted decision links, user feedback/approval scope, actual checks vs NOT TESTED, asset/dependency status, next smallest action and unresolved consequential questions.

Not a transcript; don't duplicate BRAND/DECISIONS or infer completed work. No API keys/tokens/cookies/passwords, sensitive customer location trails or raw telemetry. Redact uncertain secret-like values. A secret-free link/reference can replace a private dump.

Explicit save authorizes the current design handoff update only if the request clearly covers replacing its contents. If an existing unrelated/uncertain handoff would be overwritten, show a short summary and ask first. Preserve open blockers not intentionally resolved. Follow host confirmation requirements for any external write.

After actual write, report the file and next start action. If no write happened, do not say saved. A proposal in chat is not a persisted memory.

## Restore

Read HANDOFF.md, ENTRY.md, BRAND.md and only relevant decision/registry/task references. Existing repo instructions apply. Unlike old fixed-list restore, referenced context/design files may be read when needed; don't scan the entire repository.

Summarize last state, accepted decisions, pending approvals, tests/limits and next action. Identify staleness or missing files. If needed inspect current target read-only to verify a material mismatch. Do not silently treat stale memory as current truth.

Stop after restoration unless the user explicitly asked to restore AND continue a specific task. In that case continue only that authorized scope with the appropriate skill. Never expose raw secrets found in restored context.

## Output

Saved/Restored or Not saved with reason; concise current state and next action. This skill preserves context, not an assertion that the agent has permanent memory across every host.
