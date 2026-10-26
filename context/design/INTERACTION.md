# Interaction and Motion — meaningful futuristic response

## Purpose

Explain change, origin, consequence and control. Do not manufacture telemetry activity. The more urgent the task, the less competing decoration.

## Starting timings, not measured requirements

- local hover/press: 100–180ms;
- selection/disclosure: 160–240ms;
- panel/sheet transitions: 180–320ms;
- narrative reveals: 350–650ms;
- finite showcase narrative: typically 2–6s with static initial meaning and pause review where appropriate.

Reuse established tokens/easing. These are tunable defaults, not a unique spring for every component. Keep important feedback immediate; never delay acknowledgement or navigation for an animation.

## States and controls

Hover: quiet edge/surface response for dense items; no lifting every table row. Optional shallow tilt for a showcase on fine pointers only. No essential tooltip-only action.
Focus: clear keyboard indicator independent of glow/hover. Press: small local feedback, no target jumping. Selection: persistent identity across map/list/detail, not an unrelated pulse.

Panels/sheets: preserve user size, selection and filter state unless the task explicitly changes them. Close/collapse and return focus should be predictable. Use existing interaction contracts before introducing new choreography.

## Drag and resize

Use dedicated handles, not the entire widget body if charts/links need pointer input. Avoid pointer conflicts with map gestures. Supply keyboard controls AND click/tap alternatives for essential drag operations (keyboard alone is not the same as a single-pointer alternative). Preset size and move-up/down/position controls are possible equivalents. See DASHBOARD.md for the full flow.

## Data changes

Briefly highlight changed values, not entire panels repeatedly. Do not animate all live numbers through intermediate fake values. Historical replay is labeled and controllable. Freshness comes from actual timestamps; a blinking dot does not establish connectivity.

Critical alarm and selection outrank decorative loops. Batch/coalesce noisy visual updates where appropriate without hiding real events. Do not use aria-live assertive for every streaming sample.

## Implementation cost

Prefer transform and opacity where suitable. SVG paths/filters/large blur/shadow/layout animations need isolated profiling. Local resize may need layout; preserve the feature and measure rather than ban it.

Use installed motion APIs for meaningful coordination and CSS for simple state transitions. Verify exact installed imports. Do not add another animation library casually. Avoid React setState on each pointer/frame for decoration. Clean up observers, timers, listeners and frames. Apply will-change selectively, not to every element forever.

## Reduced motion and user control

Respect prefers-reduced-motion in CSS/runtime: remove parallax, continuous spatial loops, tilt and cinematic camera movement. Keep understandable static state and immediate feedback. Functional replay is not globally disabled: provide a suitable controllable alternative.

Review pause/stop/hide requirements for nonessential auto-motion lasting more than five seconds. Avoid flashes/rapid strobes. Decorative loops should stop offscreen/hidden. Do not lock scroll for an unrequested story.

## Cursor grammar

For pointer requests read MAP-IOT.md. Distinguish custom CSS cursor from a pointer-following DOM effect. Native text/resize/grab semantics are valuable and may remain. Do not hide the pointer globally or replace precision with a lagging halo.

## Check

Keyboard, no-hover touch, reduced motion, rapid repeat actions, state continuity, RTL transitions, offscreen behavior, and a real motion capture when available. Screenshot review alone does not prove motion correctness.
