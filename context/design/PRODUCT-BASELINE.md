# Existing Product Baseline — verified snapshot and preservation contract

## Snapshot, not a fresh audit

Repository supplied by owner: https://github.com/shoaibhajj/Map-Dashboard-Design-v2
Deployment supplied by owner: https://abc123-map-dashboard-design-v3.vercel.app/

Earlier targeted repository reads in this conversation on 2026-10-26 inspected PRODUCT.md, package.json and part of src/index.css, plus root instructions and src directory listing. This v2 documentation rebuild did not re-audit the live repository. Verify current files before implementation; never claim current behavior from this snapshot alone.

Observed stack: React 19, Vite 8, TypeScript, Tailwind v4, React Router; package.json included motion and mapbox-gl. No Three.js/R3F was listed in the inspected package.json. Do not migrate to Next.js or import JobPilot's backend conventions.

Observed style entry: src/index.css, semantic variables and @theme inline aliases, .dark separate from data-palette="tripmonitor". Observed font imports: Inter, Barlow Condensed, JetBrains Mono. Arabic typography still requires actual verification. CSS output was truncated: omitted rules are not evidence of absence.

## Documented product facts

From PRODUCT.md in the inspected snapshot:
- Fleet managers/operators; location, trips, sensors, groups, drivers, dashboard and advertising tools.
- Design exploration/approval precedes production integration.
- Operational data are demo data; auth is a local demo flow, not production auth.
- Dark and Petroleum & Mint are default commitments; theme remains customizable.
- Arabic/English and correct RTL.
- Device packet data and interpreted telemetry remain distinct; independent update times preserved.
- Positioning/customer/performance claims not established. Final product name unconfirmed.

The screenshots show both FLEETVIEW and TRIPMONITOR. Do not rename automatically. A nav item does not prove its feature is implemented.

## New requested scenarios are not verified existing features

Critical alarms, dashboard customization, new marker styles, refined cursor, and original cluster rendering are request examples. Inspect whether they exist, then separate visual changes from new interactions/state/API work. Do not mark them completed by creating this pack.

## Preserve, inspect, verify

Before editing a target, inventory relevant:
- props, handlers, states, routes, shared consumers, permissions and pending local changes;
- vehicle selection ↔ list ↔ map ↔ detail synchronization;
- pan/zoom/bearing/pitch, clustering, filtering, map attribution and source data;
- panels, sheets, dragging/resizing/collapse, scroll position, focus behavior;
- dashboard view state, widget identity, layout and data semantics;
- language/theme/palette state and local preferences;
- timestamps, units, thresholds, unavailable/stale values and demo labels.

Do not remove behavior to make a cleaner screenshot. Do not silently change thresholds, alert severity, aggregation, source protocol, permissions, server APIs or data precision during styling.

## Scope and external effects

No framework migration, map-provider swap, auth rewrite, production backend, paid asset, dependency, deployment or external record change is implied by design work. Follow existing permission rules.

Do not undo unrelated work. For diagnosis, use read-only diff/status inspection before proposing a rollback. Never translate "reset design direction" into destructive Git commands.
