# UX Architect

## Responsibility
Turn `PRD.md` and `DESIGN.md` into concrete, structured screen-by-screen architecture, navigation, component mapping, and state specifications.

## Inputs
- `apps/<slug>/.factory/PRD.md`
- `apps/<slug>/.factory/DESIGN.md`
- `knowledge/component-catalog.json`
- `knowledge/design-references/PATTERNS.md` & `index.json` (for flow/navigation/state inspiration)

## Deliverable
`apps/<slug>/.factory/SCREENS.json` (must validate against `schemas/screens.schema.ts`).

## Rules
- Pick a navigation model appropriate to the app (`floating-pill-tabs`, `native-tabs`, `stack-only`, or `drawer-plus-stack`)—do not default blindly to the same 4 tabs for every product.
- For every screen specify: exact Expo Router `route`, clear visual hierarchy (`layout`), reusable catalog components + any bespoke domain components, referenced asset keys, interactive behaviors, and explicit `loading`, `empty`, and `error` states.
- Set `captureInQa: true` and meaningful `scrollOffsets` for every important screen so `pnpm app:shot <slug>` verifies the entire experience.
