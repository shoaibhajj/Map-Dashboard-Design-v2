# Design Decisions

| ID | Statement | Status / basis |
|---|---|---|
| A01 | Evolve the existing GPS platform, not a rebuild | owner requirement |
| A02 | Precise operations, quiet depth, science-fiction-leaning futurism, connected IoT identity, usability preserved | owner-approved direction, conversation 2026-10-26 |
| A03 | Handle new work, old redesign, external components and open-ended invention | owner requirement |
| A04 | Non-design/general/computational tasks bypass design context/skills | owner requirement, 2026-10-26 |
| B01 | Petroleum/Mint dark default with theme choice; Arabic/English/RTL; demo data; name unconfirmed | documented PRODUCT.md snapshot; verify before implementation |
| W01 | E0–E3 expression / D0–D3 dimensional tiers | working procedures, not individually owner-approved designs |
| W02 | Timing ranges and payload/performance envelopes | provisional review defaults, no device baseline |
| N01 | Alarm/customization/marker/cursor/cluster examples | request scenarios, not approved UI solutions or completed features |
| D02 | Vehicle Marker Shapes & Hierarchy v2 (merged car/pickup, clean arrow, unified bike, distinct 2.5D scales) | proposed based on owner guidance 2026-10-27 |


## Decision template

```md
### D-### — Title
Date / scope / task ID:
Status: proposed / accepted-by-owner / rejected / superseded
Problem:
Alternatives:
Chosen approach and rationale:
What remains invariant:
Creative freedom left:
Behavior/data/persistence decisions:
Performance/fallback and evidence:
Affected files / registry links:
Owner approval reference or awaiting approval:
Supersedes / revisit trigger:
```

## Rejection learning

Record why and where. "Cluster fog obscured roads at this zoom" is useful; "never use circles" overgeneralizes. An implementation rejection does not revoke the entire approved identity.

## Change control

Micro decisions can remain in the task report. Record decisions affecting future reuse, semantics, global theme or behavior. No automatic promotion from implemented to accepted. Don't invent quotes, dates, paths, measurements, or prior approval.

### D-002 — Vehicle Marker Shapes and Hierarchy v2 (2.5D Top-Down Concept)
Date / scope / task ID: 2026-10-27 / Map Vehicle Markers / vehicle-marker-options-v1.svg
Status: proposed (incorporating owner review feedback)
Problem: Markers in v1 were too visually similar in bounding box and silhouette; rear chevron triangle on far arrow created visual clutter; car and pickup were unnecessarily separated; bicycle and motorcycle were separated.
Alternatives:
1. Flat 2D generic glyphs (lacked operational depth and scale realism).
2. Heavy 3D WebGL models per marker (too heavy, violates DEPTH-PERFORMANCE.md).
3. 2.5D Layered SVG (Tier D1) with distinct real-world proportions and custom silhouettes.
Chosen approach and rationale: Tier D1 2.5D SVG with 5 clear operational classes (Car/Pickup, Van, Bus, Articulated Truck, Bike). Car is compact, Bus is elongated (12m scale), Truck is structurally articulated with cab, hitch gap and container trailer. Clean needle arrow without rear triangle for far zoom.
What remains invariant: Map bearing and heading orientation, selection HUD corner brackets, IoT telemetry node placement, Petroleum/Mint palette compatibility.
Creative freedom left: Fine-tuning gradient stops, custom company livery accents or status glow intensities.
Performance/fallback: Pure SVG vector paths, hardware-accelerated transforms, zero WebGL overhead.
Affected files: [vehicle-marker-options-v1.svg](file:///c:/Users/Administrator/Documents/Codex/2026-10-05/i/work/map-dashboard-app/context/design/concepts/vehicle-marker-options-v1.svg), [vehicle-marker-options-v2.svg](file:///c:/Users/Administrator/Documents/Codex/2026-10-05/i/work/map-dashboard-app/context/design/concepts/vehicle-marker-options-v2.svg)
Owner approval reference: Awaiting owner review of v2 concept.

