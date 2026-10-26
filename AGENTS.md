# figma-make-app

React + Vite + Tailwind CSS project running inside Figma Make.

## Development Server

A Vite development server is **already running** on `$PORT` (default 8443). You don't need to start it manually.

- Preview URL: The user can access the running app through the preview panel
- Hot reload: Changes to source files are reflected immediately

## Project Structure

This is the canonical project structure. Start with task-relevant files below. Only follow imports or inspect other files when required, when a documented path is missing, or when the repository contradicts this guide.

- `src/main.tsx` - React entrypoint; imports `src/index.css` and mounts `src/App.tsx` into the `#root` element
- `src/App.tsx` - Primary application component and the usual starting point for UI work
- `src/index.css` - Global CSS entrypoint and Tailwind CSS v4 import
- `index.html` - Vite HTML shell containing the `#root` element and loading `src/main.tsx`
- `package.json` - Project dependencies and the Vite build, development, preview, and formatting scripts
- `vite.config.ts` - Vite configuration with React, Tailwind CSS v4, and Figma Make plugins plus the `@` alias for `src`
- `.mise.toml` - Toolchain versions for Node.js and pnpm

## Dependencies

- Runtime: React 19 and React DOM 19
- Styling: Tailwind CSS v4 with the `@tailwindcss/vite` plugin
- Build tooling: Vite 8, TypeScript 5.7, and `@vitejs/plugin-react`
- Formatting: oxfmt

## Styling

This project uses **Tailwind CSS v4** through the `@tailwindcss/vite` plugin configured in `vite.config.ts`. `src/index.css` imports Tailwind with `@import 'tailwindcss';`. Use Tailwind utility classes directly in JSX and put global CSS or Tailwind v4 theme customization in `src/index.css`. This scaffold does not need a Tailwind config file or PostCSS config.

`src/main.tsx` imports `src/index.css`, so global font wiring belongs in `src/index.css`. Keep CSS `@import` statements first, then add any `@font-face` rules and font-family defaults there.



## GPS / IoT design routing

Classify each task before loading design material:
- Non-design: arithmetic, data-only algorithms, backend-only fixes, general explanations or text-only editing without visual/interaction intent. Use normal workflow; do NOT load design context or activate GPS design skills.
- Visual/interaction: components, pages, maps/markers/clusters, alarms, dashboard customization, mouse cursors, hover/motion/3D or external UI adaptation. Read `context/design/ENTRY.md` and only its task-selected references.
- Mixed: apply design rules only to the interface/interaction slice; preserve normal engineering rules for the rest.
- Read/propose/review only: no code, registry or handoff edits unless separately requested.

Choose one primary GPS skill when appropriate:
- `gps-design`: scoped execution/new or existing interface; micro path for precise small changes.
- `gps-explore`: vague creative direction/alternatives; no forced concept workshop for exact edits.
- `gps-adapt`: external component/source transformation.
- `gps-dimension`: relevant 2.5D/3D/rendering trade-off, not every task.
- `gps-review`: read/test/report only.
- `gps-imprint`: requested pattern capture/audit, no automatic baseline promotion.
- `gps-recover`: diagnose a failed design iteration before more patches.
- `gps-handoff`: explicit save/restore of design continuity.

Do not invoke all skills or require a full architect cycle for a tiny edit. Natural-language tasks can select relevant skills; explicit invocation uses the host's supported syntax. If skills are not discoverable, read the named SKILL.md from its installed location and follow it without claiming native activation.

Approved direction: precise operational identity, quiet depth, science-fiction-leaning futurism and connected IoT relationships between devices/location/movement/time/data/control, with clear usability. `context/design/BRAND.md` is the reference. This is an existing app, not a rewrite.

Preserve functional contracts, real data semantics, demo labels, Arabic/English, RTL and theme choice. Dependencies, destructive actions and external writes require their usual permissions. Skills don't override them.

Before applying an old generic architect/imprint/recover/remember/review skill to GPS design, use the scoped GPS procedure instead. Old skills may remain for unrelated engineering work, but must not impose JobPilot specs or exact-class/global-white-card rules on this design work.
