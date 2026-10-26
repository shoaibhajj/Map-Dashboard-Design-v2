# Visual System — coherent craft, flexible compositions

## Integrate with current tokens

Use existing semantic variables; do not paste a second global theme. Inspect existing aliases and consumers before changing a shared token. Keep .dark and palette choice independent.

Observed dark Petroleum/Mint inventory, not a new CSS block:
background #041319; card #08181e; secondary #0d2229; foreground #e6f0f3; muted foreground #86a3ad; border #153139; primary #00e8b4; primary foreground #021216; warning #fab64e; danger #fe4c4b; info #369afe.

Check actual source and contrast. Preserve alternate modes. Improve a failing contrast combination rather than blindly preserving a screenshot.

| Role | Existing anchor | Intent |
|---|---|---|
| ground | --background | stable receding plane |
| main surface | --card | readable operational content |
| elevated | --popover / panel material | selected details and overlays |
| primary/secondary copy | --foreground / --muted-foreground | hierarchy without disappearing labels |
| action | --primary + --primary-foreground | deliberate interactive emphasis |
| focus/boundary | --ring / --border | focus visibly stronger than subtle separation |
| status | --success / --warning / --danger / --info | semantic meaning plus text/icon |

One new token needs a reusable role, mode values and affected-consumer check. Do not create a synonym for every component. Semantic status colors are not decoration.

## Materials

1. Matte operational planes: low noise, strong data readability.
2. Elevated instruments: fine edge, selective highlight, restrained shadow, clear selection.
3. Futuristic focal objects: purposeful depth, light and material cues in a limited region.

Transparency/blur must not be the only contrast over a map. Keep opaque fallbacks. Do not put the same animated border on every card. Futurism can come from geometry, instrumentation and cause/effect, not only neon.

## Typography

Roles: display / UI body / telemetry numerals / supporting labels.
- Inspect font loading; do not replace it globally for a local task.
- Barlow Condensed may suit short English showcase headings, not every label or Arabic.
- Use a verified Arabic-capable family with intentional line heights/wrapping; propose added loading cost when needed.
- Tabular numerals where appropriate; monospace for identifiers/coordinates when helpful, not all prose.
- Body starting range 13–16px; supporting usually 12–14px. These are defaults, not a mandate to erase existing density.
- No English uppercase/tracking assumptions on Arabic. Display text wraps according to actual language/content.

## Layout and component anatomy

Group by operational meaning before enclosing everything in cards. Surfaces may be borderless. Density may differ between marketing, maps and reports while materials and states remain related.

A signature component should normally communicate:
identity → state/freshness → key metric/event → available action → optional detail.
Do not force this exact order when the task needs another hierarchy.

Use the existing spacing scale first. Contextual radii, compact rows, large narrative compositions and asymmetry are allowed. No requirement that every card share exact dimensions/classes.

Marketing: vary silhouette and storytelling by capability. Operations: preserve stable scan paths and comparable readings. Charts must fit metric semantics, not novelty.

## Icons, markers and images

Preserve a coherent stroke/weight/optical-size language. Custom vehicle/device imagery should share camera angle, baseline, crop and lighting. An illustrative model does not prove hardware support.

Visible symbol size and hit area differ: a small map arrow can have a larger reliable hit target. Direction, state, selection and alarm are separate visual channels; see MAP-IOT.md.

## Modes and states

Default, hover, focus-visible, pressed, selected, disabled, loading, empty, error, stale/unavailable as relevant. Selection is not a stronger hover. Text/icons supplement hue. Disabled must not look enabled.

Light mode is deliberately designed, not dark colors inverted. Check alternate palette and high/low-detail map backgrounds if affected.

## RTL and mixed direction

Use logical spacing/positioning and deliberate navigation order. Isolate plates, IDs, coordinates, times and code when bidi mixing needs it. Mirror directional UI when meaningful; do not mirror geography, physical heading, logos, all charts or vehicle models automatically.

## Use approved patterns without freezing invention

REGISTRY.md records purpose, constraints and variants in addition to values. Reuse the grammar of a sibling, not its silhouette in every context. A new pattern may be proposed when the task genuinely benefits; owner approval is not inferred from implementation.
