---
name: mobile-app-factory
description: Build, design, compile structured specs for, generate Kie.ai visual assets for, visually audit, and verify any cross-platform React Native + Expo (iOS, Android, Web) mobile app inside the App-builder-rapidNative factory.
---

# Mobile App Factory 2.0 (Antigravity + Impeccable + Kie.ai + Expo)

This is a **domain-agnostic mobile app factory** for building distinctive, production-quality Expo apps across any category (fintech, education, fitness, travel, creator tools, wellness, social, utilities). Pair with the installed **`impeccable`** skill for craft discipline, anti-AI-slop judgment, and post-build refinement.

## Core Separation of Concerns
Never jump straight from a prompt into unguided React Native coding. Separate three brains using structured, Zod-validated files inside `apps/<slug>/.factory/`:
1. **Creative Intelligence** (`agents/product`, `design-director`, `ux-architect`, `motion-designer`, `asset-director`) → writes `PRD.md`, `DESIGN.md`, `TOKENS.json`, `SCREENS.json`, `MOTION.json`, `ASSETS.json`.
2. **Engineering Intelligence** (`scripts/design-compiler.ts` + `agents/expo-engineer`) → validates specs, compiles `constants/CompiledTokens.ts` + `IMPLEMENTATION_BRIEF.md`, generates assets via Kie.ai, and builds the Expo app.
3. **Visual Intelligence** (`scripts/render-screens.ts` + `agents/visual-critic` + `scripts/qa-check.ts`) → captures real `390×844` mobile screenshots, evaluates against the rubric (`>= 85/100` + zero critical/overflow/runtime defects), and executes targeted repairs (up to 3 iterations).

## Pipeline Workflow (For Any App)

### Stage 1 — Scaffold & Discovery
1. Run `pnpm app:new <slug> --name "<Display Name>"` to create `apps/<slug>` with the 17-component UI kit and `.factory/STATE.json`.
2. Check `knowledge/design-directions/*.md` and `knowledge/design-memory/{approved,rejected}.json` so each new app earns a **distinct** visual identity and avoids past defects.
3. Author `apps/<slug>/.factory/PRD.md`, `DESIGN.md`, `TOKENS.json`, `SCREENS.json`, `MOTION.json`, and `ASSETS.json` following the contracts in `agents/*/AGENT.md`.

### Stage 2 — Design Compilation (Hard Gate)
Run:
```bash
pnpm app:compile <slug>
```
This validates every JSON artifact against `schemas/`, checks component references against `knowledge/component-catalog.json`, checks screen asset references against `ASSETS.json`, and emits `apps/<slug>/constants/CompiledTokens.ts` + `.factory/IMPLEMENTATION_BRIEF.md`.

### Stage 3 — Visual Asset Generation (Kie.ai)
- If `KIE_API_KEY` is configured in `.env`, run `pnpm assets:gen <slug>` (supports `stylePrefix`, `characterReferences`, retries, image header/dimension verification, and typed `constants/GeneratedAssets.ts`).
- If `KIE_API_KEY` is not yet set, run `pnpm assets:gen <slug> --dry-run` to validate the manifest (or use built-in image generation during design prototyping and keep `ASSETS.json` ready for Kie.ai regeneration).

### Stage 4 — Expo Implementation & Technical QA
- Build screens following `IMPLEMENTATION_BRIEF.md` and `CompiledTokens.ts`.
- Reuse primitives from `components/ui/` (`Screen`, `AnimatedPressable`, `Button`, `Card`, `Badge`, `Chip`, `SegmentedControl`, `SectionHeader`, `StatTile`, `ProgressRing`, `AnimatedCounter`, `Input`, `EmptyState`, `BottomSheet`, `FloatingTabBar`, `SkeletonShimmer`, `StaggeredEntrance`) and build bespoke domain components in `components/`.
- Run:
  ```bash
  pnpm app:verify <slug>
  ```
  Fix all TypeScript (`tsc --noEmit`) and Expo Web Metro bundler errors before moving to visual QA.

### Stage 5 — Automated Screenshot Capture, Visual Critic & Targeted Repair
1. Capture real mobile screenshots across routes (add `--dark` to check dark mode too):
   ```bash
   pnpm app:shot <slug>
   ```
2. Visually inspect every generated PNG in `apps/<slug>/.factory/screenshots/iteration-XX/` (or invoke a Visual Critic subagent using `agents/visual-critic/AGENT.md`) and write `apps/<slug>/.factory/qa/iteration-XX.json`.
3. Validate against hard gates (`score >= 85`, 0 critical issues, 0 console errors, 0 horizontal overflow):
   ```bash
   pnpm app:qa-check <slug>
   ```
4. If failed, apply **targeted repairs** only to the defective components/screens, re-run `pnpm app:verify <slug>` → `pnpm app:shot <slug>` → `pnpm app:qa-check <slug>` (max 3 iterations).

### Stage 6 — Record Design Memory & Deliver
- Append notable successes or anti-patterns learned to `knowledge/design-memory/approved.json` or `rejected.json`.
- Deliver preview (`pnpm app:web <slug>` / live preview card), Expo Go phone preview (`pnpm app:phone <slug>`), or EAS Build (`pnpm app:build <slug>`).
