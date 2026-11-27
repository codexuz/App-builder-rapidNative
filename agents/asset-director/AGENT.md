# Asset Director

## Responsibility
Plan and generate cohesive visual assets (app icons, full-bleed hero artwork, floating transparent 3D/2D mascots, badges, empty-state illustrations, and avatars) using **Gemini (`generate_image`)** or **Kie.ai (`pnpm assets:gen`)** while keeping all interactive UI strictly native.

## Inputs
- `apps/<slug>/.factory/DESIGN.md`
- `apps/<slug>/.factory/SCREENS.json`

## Deliverable
`apps/<slug>/.factory/ASSETS.json` (must validate against `schemas/assets.schema.ts`) plus verified assets in `apps/<slug>/assets/generated/`.

## Image Generation Providers
1. **Gemini (`generate_image` tool — Default Zero-Key Path):** Fast, high-craft generation directly inside Antigravity. Record `"provider": "gemini"` in `ASSETS.json`.
2. **Kie.ai API (`pnpm assets:gen <slug>` — Batch Automation Path):** Optional CLI batch generator when `KIE_API_KEY` is configured in `.env` or environment. Never bundle `KIE_API_KEY` into the mobile app.

## Clean Background & Cutout Rules (Critical for Polish)
Classify every visual asset into one of three background modes so artwork never looks like a pasted rectangle on top of colored cards:

1. **Floating Cutouts (`background: "transparent"`, `transparent: true`, `.png`):**
   - Use for **mascots, characters, badges, trophies, chests, floating hero props, stickers, and 3D icons**.
   - **Prompt recipe:** Always prompt with:
     - `"centered with generous empty margin all around, isolated on a completely flat uniform solid bright chroma key green (#00FF00) background, neutral white studio lighting with zero green reflection, no floor, no ground plane, no cast shadow, no detached floating sparkles or dust, no text, crisp clean silhouette edges"`
     - *(If the subject itself is bright green, substitute solid chroma magenta `#FF00FF` or pure solid white `#FFFFFF` with `cutoutMode: "chroma-magenta"` or `"white"`.)*
   - **Extract clean RGBA PNG:** Run `pnpm assets:cutout <raw_image> apps/<slug>/assets/generated/<name>.png --preview <qa_sheet.png>` (or `pnpm assets:cutout --app <slug>`). This runs border-connected flood fill + enclosed chroma hole removal + chroma-spill decontamination + soft anti-aliased alpha + tight square auto-crop.
   - Visually inspect the 2×2 preview sheet (blue, orange, dark midnight, cloud white) to guarantee **zero halo, zero fringe, and zero clipped pixels**.

2. **Full-Bleed Scenes (`background: "opaque"`, `.jpg` / `.png`):**
   - Use for **city cards, onboarding banners, editorial photography, and splash backgrounds** that fill a rounded container edge-to-edge (`resizeMode="cover"`).
   - Never ask for borders, device frames, or UI overlays.

3. **Clean Studio Portraits (`background: "opaque"`, `.jpg` / `.png`):**
   - Use for **circular avatars and profile badges** (`borderRadius: 999`) with a clean soft pastel or radial gradient backdrop matching the app's palette.

## Guardrails
- Define a unified `stylePrefix` shared across every generated asset so lighting, linework, palette, and texture belong to one brand world.
- For recurring characters or mascots, define `characterReferences` with locked visual attributes.
- Specify `"no text, no UI, no watermarks"` in prompts for clean mobile artwork.
- **Never** generate images as substitutes for buttons, navigation bars, charts, forms, or readable UI text.
