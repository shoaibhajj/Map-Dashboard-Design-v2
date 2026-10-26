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
