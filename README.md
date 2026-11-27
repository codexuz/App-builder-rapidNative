# RapidNative Mobile App Factory 2.0 (Antigravity + Impeccable + Kie.ai + Expo)

A domain-agnostic, design-first AI mobile app pipeline for building distinctive, animated, cross-platform **iOS, Android, and Web** apps in Expo + React Native + TypeScript.

## Pipeline Architecture

```text
User Prompt (Any Domain: Fintech, Education, Fitness, Wellness, Travel, Creator...)
  ├─ 1. Creative Intelligence  (agents/product, design-director, ux-architect, motion-designer, asset-director)
  │     └─ Structured specs in apps/<slug>/.factory/ (PRD.md, DESIGN.md, TOKENS.json, SCREENS.json, MOTION.json, ASSETS.json)
  ├─ 2. Design Compiler        (pnpm app:compile <slug> -> Zod validation + constants/CompiledTokens.ts + IMPLEMENTATION_BRIEF.md)
  ├─ 3. Visual Asset Pipeline  (pnpm assets:gen <slug> -> Kie.ai async tasks, retries, dimension validation, GeneratedAssets.ts)
  ├─ 4. Expo Engineering       (agents/expo-engineer + 17 reusable UI primitives in templates/expo-base/components/ui/)
  ├─ 5. Technical QA           (pnpm app:verify <slug> -> tsc --noEmit + Expo Web Metro bundle)
  └─ 6. Visual QA & Repair     (pnpm app:shot <slug> -> 390x844 Playwright screenshots + runtime/overflow checks -> agents/visual-critic -> pnpm app:qa-check <slug>)
```

## Repository Layout

```text
App-builder-rapidNative/
├── agents/                     # Narrow role contracts (product, design-director, ux-architect, motion-designer, asset-director, expo-engineer, visual-critic)
├── apps/                       # Generated standalone Expo apps (each isolated with its own .factory/ artifacts)
├── knowledge/
│   ├── component-catalog.json  # Metadata & anti-use rules for all 17 reusable UI primitives
│   ├── design-directions/      # 6 distinct aesthetic playbooks (editorial, playful, fintech-premium, neobrutalist, organic, spatial)
│   └── design-memory/          # Approved generations & rejected anti-pattern guardrails
├── schemas/                    # Versioned Zod schemas (design, screens, motion, assets, qa, pipeline-state)
├── scripts/                    # Factory CLIs (create-app, design-compiler, kie-assets, verify-app, render-screens, qa-check, run-app)
├── templates/expo-base/        # Verified Expo SDK 58 + Expo Router + 17 reusable UI/motion primitives
└── .antigravity/skills/        # Installed skills: impeccable (pbakaus/impeccable) + mobile-app-factory
```

## Built-in Reusable UI & Motion Kit (17 Components)

Every new app scaffolded via `pnpm app:new <slug>` includes:

`Screen` · `AnimatedPressable` · `Button` · `Card` · `Badge` · `Chip` · `SegmentedControl` · `SectionHeader` · `StatTile` · `ProgressRing` · `AnimatedCounter` · `Input` · `EmptyState` · `BottomSheet` · `FloatingTabBar` · `SkeletonShimmer` · `StaggeredEntrance`

## Commands

| Command | Description |
| :--- | :--- |
| `pnpm app:new <slug> --name "App Name"` | Scaffold a new Expo app in `apps/<slug>` and initialize `.factory/STATE.json` |
| `pnpm app:compile <slug>` | Validate `.factory/*.json` against Zod schemas, cross-check components/assets, and generate `constants/CompiledTokens.ts` + `IMPLEMENTATION_BRIEF.md` |
| `pnpm assets:gen <slug>` | Generate assets via Kie.ai (with `stylePrefix`, `characterReferences`, retries, image header/dimension checks, and `GeneratedAssets.ts`) |
| `pnpm assets:single --prompt "..." --out path.png` | Generate a single image asset via Kie.ai |
| `pnpm app:verify <slug>` | Technical QA gate: `tsc --noEmit` + `expo export --platform web` |
| `pnpm app:shot <slug> [--dark] [--routes ...]` | Capture `390×844` @2x screenshots via Playwright into `.factory/screenshots/iteration-XX/` with runtime error & horizontal overflow detection |
| `pnpm app:qa-check <slug>` | Validate `.factory/qa/iteration-XX.json` against hard gates (`score >= 85`, 0 critical issues, 0 console errors, 0 overflow) |
| `pnpm app:web <slug>` / `pnpm app:phone <slug>` / `pnpm app:build <slug>` | Launch Web preview, Expo Go phone tunnel, or EAS cloud build |

## Quick Setup

```bash
pnpm install
cp .env.example .env
# Add KIE_API_KEY=<your-key-from-kie.ai/api-key>
```
