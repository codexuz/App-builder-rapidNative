---
name: mobile-app-factory
description: Build, design, compile structured specs for, generate Gemini/Kie.ai visual assets with clean transparent cutouts for, visually audit, and verify any cross-platform React Native + Expo (iOS, Android, Web) mobile app inside the App-builder-rapidNative factory using gluestack-ui v5 + MCP by default.
---
# Mobile App Factory 2.0 (Antigravity + gluestack-ui v5 MCP + Impeccable + Gemini/Kie.ai + Expo)

This is a **domain-agnostic mobile app factory** for building distinctive, production-quality Expo apps across any category (fintech, education, fitness, travel, creator tools, wellness, social, utilities). Pair with the installed **`impeccable`** skill for craft discipline, anti-AI-slop judgment, and post-build refinement.

## Core Separation of Concerns
Never jump straight from a prompt into unguided React Native coding. Separate three brains using structured, Zod-validated files inside `apps/<slug>/.factory/`:
1. **Creative Intelligence** (`agents/product`, `design-director`, `ux-architect`, `motion-designer`, `asset-director`) → writes `PRD.md`, `DESIGN.md`, `TOKENS.json`, `SCREENS.json`, `MOTION.json`, `ASSETS.json`.
2. **Engineering Intelligence** (`scripts/design-compiler.ts` + `agents/expo-engineer` + **`gluestack-ui v5` + MCP**) → validates specs, compiles `constants/CompiledTokens.ts` + `IMPLEMENTATION_BRIEF.md`, generates assets via Gemini (`generate_image`) + `pnpm assets:cutout` (or Kie.ai), and builds the Expo app using **`@/components/gluestack/*`** by default.
3. **Visual Intelligence** (`scripts/render-screens.ts` + `agents/visual-critic` + `scripts/qa-check.ts`) → captures real `390×844` mobile screenshots, evaluates against the rubric (`>= 85/100` + zero critical/overflow/runtime defects), and executes targeted repairs (up to 3 iterations).

## Default Component System (`gluestack-ui v5` + UniWind + MCP)
- **Preinstalled by default** in `templates/expo-base/components/gluestack/` (copied into every new app created with `pnpm app:new <slug>`):
  - `GluestackUIProvider` (wrapped in `app/_layout.tsx` with `Uniwind` + Tailwind CSS v4 `global.css`).
  - **All 57 ready components**: `accordion`, `actionsheet`, `alert`, `alert-dialog`, `avatar`, `badge`, `bottomsheet`, `box`, `button`, `calendar`, `card`, `center`, `checkbox`, `date-time-picker`, `divider`, `drawer`, `fab`, `flat-list`, `form-control`, `grid`, `heading`, `hstack`, `icon`, `image`, `image-background`, `image-viewer`, `input`, `input-accessory-view`, `keyboard-avoiding-view`, `link`, `liquid-glass`, `menu`, `modal`, `popover`, `portal`, `pressable`, `progress`, `radio`, `refresh-control`, `safe-area-view`, `scroll-view`, `section-list`, `select`, `skeleton`, `slider`, `spinner`, `status-bar`, `switch`, `table`, `tabs`, `text`, `textarea`, `toast`, `tooltip`, `view`, `virtualized-list`, `vstack`.
- **gluestack-ui MCP Server** (`.mcp.json`, `.vscode/mcp.json`, `.cursor/mcp.json` → `pnpm --silent mcp:gluestack`):
  - Always query `list_components`, `get_component`, `get_component_docs`, and `get_component_examples` for exact props & imports before building UI screens.
  - Refresh or add any component via `add_component_to_app` MCP tool or `pnpm ui:add <slug> <component...>`.
- Combine `components/gluestack/*` (standard UI controls, forms, overlays, feedback) with `components/ui/*` (motion/chart/navigation widgets like `CapsuleTabBar`, `ProgressRing`, `BarChart`, `StaggeredEntrance`, `Screen`).

## Pipeline Workflow (For Any App)

### Stage 1 — Scaffold & Discovery
1. Run `pnpm app:new <slug> --name "<Display Name>"` to create `apps/<slug>` pre-equipped with **gluestack-ui v5** (all 57 components + UniWind), factory motion/chart primitives, and `.factory/STATE.json`.
2. Check `knowledge/design-directions/*.md`, `knowledge/design-references/PATTERNS.md`, and `knowledge/design-memory/{approved,rejected}.json` so each new app earns a **distinct** visual identity and avoids past defects.
3. Author `apps/<slug>/.factory/PRD.md`, `DESIGN.md`, `TOKENS.json`, `SCREENS.json`, `MOTION.json`, and `ASSETS.json` following the contracts in `agents/*/AGENT.md`.

### Stage 2 — Design Compilation (Hard Gate)
Run `pnpm app:compile <slug>` to validate every JSON artifact against `schemas/`, check component & asset references, and emit `constants/CompiledTokens.ts` + `.factory/IMPLEMENTATION_BRIEF.md`.

### Stage 3 — Visual Asset Generation (Gemini + Clean Cutouts / Kie.ai)
- **Default Zero-Key Path (Gemini `generate_image` + Clean Cutout Extraction):**
  - For **floating assets** (mascots, badges, trophies, chests, stickers, 3D icons): prompt on a **flat uniform solid `#00FF00` chroma-key green background** (or `#FF00FF` magenta / `#FFFFFF` white if the subject is green) with neutral white studio lighting, no floor, no cast shadow, and no detached floating sparkles.
  - Extract a clean, spill-decontaminated, tightly auto-cropped RGBA `.png` via:
    `pnpm assets:cutout <raw_image> apps/<slug>/assets/generated/<name>.png --preview <qa_sheet.png>`
  - Visually inspect the 2×2 QA sheet (blue, orange, midnight dark, cloud white) to guarantee zero halo or fringe, and render floating assets frameless with `resizeMode="contain"`.
  - For **full-bleed scenes** (city banners, onboarding heroes): generate edge-to-edge (`background: "opaque"`) with `resizeMode="cover"`.
- **Optional Batch CLI Path (Kie.ai):**
  - If `KIE_API_KEY` is configured in `.env`, run `pnpm assets:gen <slug>` (and optionally `pnpm assets:cutout --app <slug>`).

### Stage 4 — Expo Implementation & Technical QA
- Build screens following `IMPLEMENTATION_BRIEF.md` and `CompiledTokens.ts`, using **`@/components/gluestack/*`** by default (plus `pnpm ui:add <slug> ...` or MCP `add_component_to_app` for extra components) and `components/ui/` motion/chart/nav primitives.
- Run `pnpm app:verify <slug>` and fix all TypeScript (`tsc --noEmit`) and Expo Web Metro bundler errors before moving to visual QA.

### Stage 5 — Automated Screenshot Capture, Visual Critic & Targeted Repair
1. Capture real mobile screenshots: `pnpm app:shot <slug>` (add `--dark` for dark mode).
2. Visually inspect every PNG in `apps/<slug>/.factory/screenshots/iteration-XX/` and write `apps/<slug>/.factory/qa/iteration-XX.json`.
3. Validate against hard gates: `pnpm app:qa-check <slug>` (`score >= 85`, 0 critical issues, 0 console errors, 0 horizontal overflow).
4. If failed, apply targeted repairs and re-verify (max 3 iterations).

### Stage 6 — Record Design Memory & Deliver
- Append notable successes or anti-patterns learned to `knowledge/design-memory/approved.json` or `rejected.json`.
- Deliver preview (`pnpm app:web <slug>` / live preview card), Expo Go phone preview (`pnpm app:phone <slug>`), or EAS Build (`pnpm app:build <slug>`).
