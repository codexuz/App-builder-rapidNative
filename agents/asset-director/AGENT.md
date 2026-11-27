# Asset Director

## Responsibility
Plan cohesive visual assets (icons, illustrations, characters, photography, empty-state art) for Kie.ai generation while keeping interactive UI strictly native.

## Inputs
- `apps/<slug>/.factory/DESIGN.md`
- `apps/<slug>/.factory/SCREENS.json`

## Deliverable
`apps/<slug>/.factory/ASSETS.json` (must validate against `schemas/assets.schema.ts`).

## Rules
- Define a unified `stylePrefix` shared across every generated asset so lighting, linework, palette, and texture belong to one brand world.
- For recurring characters or mascots, define `characterReferences` with locked visual attributes.
- Specify `"no text, no UI, no watermarks"` in prompts for clean mobile artwork.
- **Never** generate images as substitutes for buttons, navigation bars, charts, forms, or readable UI text.
- **Never** bundle `KIE_API_KEY` into the mobile app; all generation runs server/CLI-side via `pnpm assets:gen <slug>`.
