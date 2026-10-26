# Map and IoT — semantics before styling

Read only relevant subsections for small tasks. These are design/behavior contracts, not claims that features exist.

## Operational vocabulary

- Asset/vehicle: tracked physical object; device may be separate from it.
- Packet: incoming source message; telemetry: interpreted reading. Do not conflate their timestamps.
- Movement: moving/stationary; connection: online/offline/stale/unknown. They are independent axes.
- Alarm: event requiring attention; severity: assigned urgency; acknowledgement: operator has seen/accepted responsibility, not necessarily resolved.
- Heading/course: direction with a source, coordinate convention and freshness. Unknown is not zero/north.
- Cluster: geographic grouping under a defined algorithm/zoom/filter, not a group/team membership unless specified.
- Device health/connectivity/data freshness: separate concepts; animated signal never substitutes for measured state.

Use existing API/state meanings. Confirm missing consequential definitions. Never create production emergency thresholds from a visual request.

## Critical issues / alarms on map

### Establish minimum contract

What counts as critical? Which existing severity source? What location/time/source confidence exists? Can the user inspect, acknowledge, resolve or mute, and which actions actually exist? Which roles may act? Are these demo events or real server data?

If no integration exists, build an explicitly labeled preview with fixtures and documented adapter boundary. Do not show a local "acknowledged" action as server-saved or resolved. This pack does not authorize dispatch, device control or incident escalation.

### Visual hierarchy

Critical event > selected entity > attention-worthy status > routine telemetry > decoration. Preserve road visibility. Use clear symbol + label/count/severity, not only red glow. Anchor the event to known location; do not snap it to a guessed asset position without disclosure.

Consider a calm persistent marker, ranked incident rail, concise selected callout and map focus link. These are concepts, not one required UI. A bounded entry emphasis may announce a new event; never perpetual strobes, all-screen tint or sound by default.

### Multiple incidents

Define grouping/count basis: events, affected vehicles, or sites. Those counts are not interchangeable. Show the most severe contained event without implying all members share that severity. Keep duplicates/noisy events identifiable and the detail path accessible. Unlocated/stale events remain available in a list with honest location status.

Opening an alarm should keep context; do not unexpectedly fly the map or steal focus on every new event. Offer explicit focus/navigation. Check overlapping markers, clustered critical issues, narrow viewports and screen-reader announcement strategy.

## Vehicle markers — circle to arrow or another compact glyph

Inspect renderer (map layer/sprite/DOM), size/hitbox, rotation alignment, map bearing, pitch, clustering and selected state.

Preserve identity, tap/click, tooltips, filters and selection. Separate geometry from semantic state. A heading arrow should rotate according to actual validated course and renderer coordinate conventions. Never manually subtract map bearing without checking renderer alignment (map-aligned vs viewport-aligned).

Unknown/stale heading needs neutral/symmetric/explicit treatment, not a confident north-facing arrow. Stationary does not necessarily mean heading is invalid; use data contract. RTL does not mirror real-world heading.

Use a larger transparent hit area if visible glyph is small. Ensure contrast on light/dark tiles, recognizability at dense zooms and screen orientation. If only shape changed, do not alter grouping algorithm or live update cadence.

## Clustering — invent a visual language without corrupting aggregation

### Separate three decisions

1. Group membership/algorithm: existing radius, zoom thresholds and active filters.
2. Representation: count hierarchy, state/severity mix, footprint, selected state.
3. Interaction: zoom expansion, inspect members, spiderfy only if implemented/justified, handling exact-overlap points at max zoom.

A request for a new shape usually changes 2, sometimes 3, not automatically 1. Inspect data sources and cluster properties; do not change radius/count logic for a nicer screenshot.

### Design brief

Explain what the operator can infer in one glance: total count; optionally real status breakdown, highest severity or selection. Use only data actually available. Unknown state has its own denominator. A count of visible filtered vehicles is not total fleet size.

Invent 2–3 compositions for open-ended requests: e.g. compact instrument capsule, segmented directional aggregate, layered count beacon. Do not reproduce a competitor's silhouette. None is prescribed. Avoid one animated DOM child per vehicle, giant fog rings and count labels under bloom.

### Behavior/edge cases

Single point vs cluster; 2/10/100/1000+ counts; one state vs mixed/unknown; selected member; critical alarm inside; filter change; zoom merge/split; exact overlaps; map bearing/pitch; dateline/wrap if supported.

Keep the cluster label upright/readable when appropriate and geography correct. Do not fabricate member routes/connections. Preserve chosen renderer/cluster pipeline unless scope includes changing it. Test representative point counts and explain baseline; do not claim scalability from a still image.

## Mouse cursor — authored precision

Clarify only when ambiguous: is the request a CSS cursor shape, map mode feedback, or decorative pointer follower? Inspect existing cursor CSS and mode handling first.

Default recommendation for a small polish task: small precise custom cursor asset where appropriate, with correct hotspot and native fallback; keep pointer/text/grab/grabbing/resize/not-allowed affordances where they convey function.

- Scope to relevant map modes or showcase region, not global `cursor:none` by default.
- Maintain exact click location; no delayed cursor, oversized reticle or persistent trail covering data.
- Custom assets need browser-supported format/size and fallback; test actual browser/OS scaling.
- Coarse pointer/touch: no fake mouse cursor. Reduced-motion: no follower trails/parallax.
- DOM overlays must not intercept events; keyboard users retain focus feedback.
- Editing inputs uses readable text cursor; drag/resize controls retain correct orientation in RTL.
- An active draw/measure mode may use a reticle only if that mode exists; never imply tool activation through aesthetics alone.

If the owner explicitly wants a pointer follower, isolate it and explain precision/performance/accessibility trade-offs. Use native pointer as a fallback, clean up listeners and avoid global per-mousemove React renders.

## IoT signature without invented capabilities

Use physical-to-digital relationships to author the scene. Packet arrival, sensor timestamp, connection quality, asset movement and event severity are different channels. Do not label decorative particles as actual packets or signal levels. Distinguish illustration from live monitoring in copy and accessibility labels.
