# RapidNative Personal Mobile App Factory (Antigravity + Impeccable + Kie.ai + Expo)

Build cross-platform **iOS, Android, and Web** mobile apps from plain-English prompts using:
- **Antigravity** as your planning, coding, and self-healing verification engine
- **Impeccable** (`pbakaus/impeccable`) for UI/UX taste, anti-AI-slop design discipline, `PRODUCT.md`/`DESIGN.md`, and iterative design steering (`critique`, `audit`, `polish`, `bolder`, `quieter`, `typeset`, `layout`, `clarify`, `harden`, `delight`)
- **Kie.ai API** for cohesive, art-directed app icons, splash screens, and in-app visual assets (`stylePrefix` support)
- **Expo SDK 58 + Expo Router** with a built-in tokenized design system and 12 reusable tactile mobile UI components

## Architecture

```text
Prompt to Antigravity
  ├─ 0. UI/UX Concepting (Impeccable)       -> Visual mockups, PRODUCT.md & DESIGN.md
  ├─ 1. Scaffold Expo App                   -> pnpm app:new <slug> (apps/<slug>/)
  ├─ 2. Generate Cohesive Assets (Kie.ai)   -> pnpm assets:gen <slug> (stylePrefix)
  ├─ 3. Compose Screens + Reusable UI Kit   -> components/ui/ + constants/Theme.ts
  ├─ 4. Verify TS + Metro + Design Audit    -> pnpm app:verify <slug> + Impeccable polish
  └─ 5. Preview (Web / Expo Go QR) or Ship  -> pnpm app:web / app:phone / app:build
```

## Built-in Reusable UI Kit (`templates/expo-base/components/ui/`)

Every newly scaffolded app starts with tokenized themes (`constants/Theme.ts`: `editorialLight`, `obsidianDark`, `warmCraft`, `emeraldPulse`) and 12 cross-platform primitives:

`Screen` · `AnimatedPressable` · `Button` · `Card` · `Badge` · `Chip` · `SectionHeader` · `StatTile` · `Input` · `EmptyState` · `BottomSheet` · `FloatingTabBar`

## Quick Setup

1. Install root factory CLI dependencies:
   ```bash
   pnpm install
   ```
2. Configure your Kie.ai API key (optional until you generate images):
   ```bash
   cp .env.example .env
   # Edit .env and set KIE_API_KEY=<your-key-from-kie.ai/api-key>
   ```

## Commands

| Command | Description |
| :--- | :--- |
| `pnpm app:new <slug> --name "App Name"` | Scaffold a new Expo app in `apps/<slug>` from `templates/expo-base` |
| `pnpm assets:gen <slug>` | Generate all assets in `apps/<slug>/assets.manifest.json` via Kie.ai (with shared `stylePrefix`) and write typed `constants/GeneratedAssets.ts` |
| `pnpm assets:gen <slug> --dry-run` | Preview Kie.ai tasks without spending credits |
| `pnpm assets:single --prompt "..." --out path.png` | Generate a single image asset via Kie.ai |
| `pnpm app:verify <slug>` | Run `tsc --noEmit` + `expo export --platform web` verification gate |
| `pnpm app:web <slug>` | Launch Expo Web preview |
| `pnpm app:phone <slug>` | Launch Expo Go tunnel (QR code for real iPhone/Android preview) |
| `pnpm app:build <slug> [ios\|android\|all]` | Run Expo EAS cloud build |

## Installed Skills

Both skills are registered in Antigravity and mirrored under `.antigravity/skills/`:
- **`impeccable`** (from [`pbakaus/impeccable`](https://github.com/pbakaus/impeccable)) — Design direction, UX review, typography, layout, anti-slop polish
- **`mobile-app-factory`** — End-to-end Expo + Kie.ai + Impeccable mobile build pipeline
