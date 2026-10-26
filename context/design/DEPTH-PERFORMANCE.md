# Depth, 3D and Performance

## Premium ≠ mandatory WebGL

Choose the least expensive technique that preserves the concept and approved futuristic IoT identity. A compact engineered object, spatial boundary or connected instrument can feel dimensional without a real-time renderer.

| Tier | Technique | Suitable use | Baseline fallback |
|---|---|---|---|
| D0 | DOM / flat SVG | dense utility, ordinary glyphs | itself |
| D1 | layered SVG / CSS perspective and light | shallow device/route/instrument depth | flat version |
| D2 | optimized pre-rendered raster, sometimes finite video | rich material/fixed camera | still + DOM explanation |
| D3 | real-time 3D/WebGL | meaningful object/camera interaction or justified focal hero | poster + accessible controls |

CSS compositing, SVG filters, large images and video also cost resources. Compare transfer/decode/rendering and meaning; no tier is automatically free.

## D2/D3 scene brief

Subject → user value → physical/digital relationship → camera/material → interaction → lighting/motion → static explanation → asset/license → loading boundary → estimated cost → how to measure.

Do not use a floating truck/globe on every page. Realism is optional; precision and coherence are not. Never present an illustrative device as officially supported hardware without evidence.

## Operational constraints

No per-vehicle or per-widget decorative WebGL canvas. The map already consumes rendering resources; no decorative full-screen shader over it by default. Animate selected/changed entities, not thousands of idle markers.

An alert must remain understandable when animation/3D fails. A cursor, marker shape or toolbar task normally does not justify D3.

## If D3 is justified

Verify dependencies first; the inspected package snapshot did not contain Three.js/R3F. This pack does not authorize installation. Lazy-load scene and renderer; ensure marketing-only code is absent from unrelated operational initial chunks.

Render meaningful static content/poster with reserved dimensions first. Don't delay CTA/navigation/data until assets load. Avoid downloading the whole scene merely to show its poster.

Start with simple geometry, small textures, shared materials, and baked/fixed lighting where suitable. No dynamic reflections, postprocessing/bloom, huge environment maps or dynamic shadows by default. Reuse resources or instancing when genuinely needed. Cap/adapt DPR; 1–1.5 is a proposed starting cap, not universal truth.

Use on-demand rendering for a resting scene with explicit invalidation for imperative changes. A perpetual invalidation loop defeats the purpose. Use frame/delta mechanisms instead of per-frame React setState. Stop nonessential hidden/offscreen work; dispose owned resources/listeners and test repeated navigation and context loss.

Keep controls/information accessible in DOM. Don't trap scroll or map gestures. Respect reduced motion, coarse pointers and data-saving preferences when detectable; don't rely on device detection alone for quality.

## Starting review budgets (proposals, not current results)

- E0/E1 routine feedback: aim for zero new animation runtime/decorative asset requests.
- D2 focal raster: aim <=250 KB transferred at actual display size when quality permits.
- D3 first activation: aim <=1 MB additional compressed model/texture/environment assets; report JS bytes separately and total bytes together.
- Marketing-only 3D: zero intentional renderer bytes in unrelated operational initial route chunks.
- At rest/hidden/offscreen: no intentional continuous decorative frame loop.

If exceeded, simplify/change tier or propose a measured exception. Don't silently relax budgets or degrade image quality beyond useful legibility.

## Measurement contract

Compare before/after same route, browser, device, cache state, viewport, network and CPU settings. Report initial JS, deferred JS, assets, layout shifts, responsiveness, long tasks and rendering behavior. A smooth desktop demo is not evidence for low-end phones.

Good Web Vitals targets: LCP <=2.5s, INP <=200ms, CLS <=0.1 using appropriate methodology; field evaluation uses the 75th percentile. A local test is not field compliance. Report failing baseline honestly, not "passes" because unchanged.

## Degradation matrix

- Reduced motion: fixed angle/static relationship, no parallax/tilt/cinematic loops.
- Touch: tap/static interaction, no hover dependency or fake mouse.
- Renderer failure/context loss: meaningful poster/diagram and working DOM actions.
- Asset timeout: bounded failure path; no infinite spinner.
- Hidden/offscreen: pause nonessential work.
- Theme changes: readable intentional object labels/materials across supported modes.

Never promise "no performance impact", fixed FPS everywhere, or "lightweight" from intuition alone. Mark unavailable checks NOT TESTED.
