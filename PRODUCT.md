# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Fleet managers and fleet operators who monitor vehicles and coordinate day-to-day fleet operations.

## Product Purpose

A web platform for managing fleet operations through vehicle maps, GPS and sensor readings, trip information, dashboards, vehicle groups, driver records, and advertising tools. The current phase is to establish and approve the product design before connecting production data.

## Positioning

The product's distinct market position has not yet been defined. Do not invent claims about customers, performance, or competitive advantages.

## Operating Context

Users work with vehicle locations and operational telemetry, organize vehicles into nested groups, and review vehicle, trip, and fleet information. The interface supports Arabic and English, including right-to-left layout for Arabic.

## Capabilities and Constraints

- Current vehicle and operational data are demo data; no production backend is connected yet.
- Authentication is a local demo flow, not production authentication.
- The immediate project phase is design exploration and approval. After the design is approved, the team plans to connect backend data and restructure the project around the production data model.
- The interface includes a map, vehicle details, trips, telemetry and sensor values, nested groups, driver records, fleet dashboards, and advertising pages.
- Keep device packet data distinct from interpreted telemetry and preserve independent update times for data sources where applicable.
- Do not present demo values as live production data.

## Brand Commitments

- The user requested dark mode and the Petroleum and Mint palette as the defaults; theme selection remains customizable.
- The product name has not been confirmed.

## Evidence on Hand

- Demo vehicle and telemetry records: `src/data/vehicles.ts`.
- Demo-only authentication implementation: `src/contexts/AuthContext.tsx`.
- No production backend integration or customer evidence is present in the current project.

## Product Principles

- Make vehicle location and operational status quick to understand.
- Keep telemetry values and their individual update times accurate and distinguishable.
- Let fleet teams organize vehicles with nested groups and customize the sensor values important to their work.
- Support Arabic and English, with correct right-to-left behavior.
- Clearly distinguish demo data from future production data.
