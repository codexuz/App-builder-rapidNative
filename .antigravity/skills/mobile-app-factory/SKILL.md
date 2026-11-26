---
name: mobile-app-factory
description: Build, style, generate Kie.ai visual assets for, and verify cross-platform React Native + Expo (iOS, Android, Web) mobile apps inside the App-builder-rapidNative factory. Use whenever the user asks to build, scaffold, iterate on, or generate assets for a mobile app in this repository.
---

# Mobile App Factory (Antigravity + Impeccable + Kie.ai + Expo)

Follow this RapidNative-style pipeline whenever building or iterating on a cross-platform mobile app in `/home/antigravity/codexuz/App-builder-rapidNative`. Pair this skill with the installed **`impeccable`** skill for UI/UX craft, anti-AI-slop discipline, and post-build refinement (`critique`, `audit`, `polish`, `typeset`, `layout`, `clarify`, `harden`, `bolder`, `quieter`, `delight`).

## 0. UI/UX Imagination & Creative Direction (Before Writing Code)
For any **new app or major redesign**:
1. Invoke the **`impeccable`** skill mindset: establish `PRODUCT.md` (audience, core jobs-to-be-done, constraints) and `DESIGN.md` (palette, type hierarchy, elevation, surface rhythm) inside `apps/<slug>/` once scaffolded.
2. **Offer/Generate Visual Concepts First** when the user hasn't locked a visual style:
   - Use `generate_image` (or Kie.ai) to explore 2–3 distinct mobile screen directions (e.g., *Editorial Light*, *Obsidian Dark*, *Warm Craft*, or a bespoke domain aesthetic) without surrounding device frames.
   - Or offer a quick interactive mobile prototype in chat (`generative_ui`) to validate navigation & UX flows before writing Expo code.
3. Plan **real UX states upfront**: onboarding/empty states, loading states, bottom sheets, realistic domain copy (never "Lorem ipsum" or "Tab One"), and clear visual hierarchy.

## 1. Scaffold the App
Run from the repository root:
```bash
pnpm app:new <slug> --name "<Display Name>"
```
This clones `templates/expo-base` into `apps/<slug>` with:
- Expo SDK 58 + Expo Router + TypeScript + `lucide-react-native` + `expo-linear-gradient` + `expo-haptics` + `react-native-reanimated`
- Tokenized theme system in `constants/Theme.ts` (`editorialLight`, `obsidianDark`, `warmCraft`, `emeraldPulse` + custom brand override)
- Reusable mobile UI kit in `components/ui/`: `Screen`, `AnimatedPressable`, `Button`, `Card`, `Badge`, `Chip`, `SectionHeader`, `StatTile`, `Input`, `EmptyState`, `BottomSheet`, `FloatingTabBar`.

## 2. Generate Cohesive Visual Assets via Kie.ai
1. Edit `apps/<slug>/assets.manifest.json`:
   - Set a shared **`stylePrefix`** so every generated icon, splash screen, onboarding art, and hero banner shares identical lighting, palette, and art direction.
   - Keep `"no text or watermarks"` in prompts for clean mobile icons and artwork.
2. Check `.env` for `KIE_API_KEY`:
   - **If configured:** run `pnpm assets:gen <slug>` to generate assets in parallel via Kie.ai, download into `apps/<slug>/assets/generated/`, sync `icon.png`/`splash-icon.png`, and auto-generate `apps/<slug>/constants/GeneratedAssets.ts`.
   - **If not configured yet:** run `pnpm assets:gen <slug> --dry-run` to validate the manifest, craft clean native/gradient UI visuals, and let the user know they can set `KIE_API_KEY` and run `pnpm assets:gen <slug>` anytime.
3. Always reference generated artwork via static `require(...)` from `constants/GeneratedAssets.ts` for offline iOS/Android/Web bundling.

## 3. Build With Reusable Components & Design Discipline
- Start from `constants/Theme.ts` and customize `ActiveThemeConfig` or add a bespoke app palette—never scatter random hardcoded hex colors across screens.
- Reuse and extend primitives in `components/ui/` (`Screen`, `Card`, `Button`, `Chip`, `StatTile`, `BottomSheet`, `EmptyState`, `FloatingTabBar`) and extract recurring app-specific patterns into `components/` (`impeccable` **extract** principle).
- Ensure **iOS, Android, and Web parity**: guard native-only APIs (like haptics/biometrics) with `Platform.OS !== 'web'` or `.web.tsx` fallbacks.
- Keep local/mock data and state cleanly isolated under `store/` or `data/` for easy Supabase/API integration.

## 4. Mandatory Technical & Design Verification Gate
Before presenting the finished app:
1. Run the deterministic build verifier:
   ```bash
   pnpm app:verify <slug>
   ```
   Fix any TypeScript (`tsc --noEmit`) or Expo Metro web bundling errors and re-run until exit code `0`.
2. Run a quick **Impeccable** design quality check (`audit` / `polish` / `clarify` / `harden`): verify contrast, touch targets (>= 44pt), safe-area clearance above `FloatingTabBar`, empty/error states, and domain-authentic UX copy.

## 5. Preview, Iterate & Ship
Give the user clear next actions:
- **Design iteration (Impeccable vocabulary):** ask to `critique`, `polish`, `bolder`, `quieter`, `typeset`, `layout`, `colorize`, `delight`, `clarify`, or `harden` any screen.
- **Web preview:** `pnpm app:web <slug>`
- **Real phone preview (Expo Go QR):** `pnpm app:phone <slug>`
- **iOS / Android cloud build (EAS):** `pnpm app:build <slug> [ios|android|all]`
