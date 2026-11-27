# PRODUCT.md — Impulse Learning World

## Audience & Purpose
- **Learners:** Students aged 13+ (teens and young adults) progressing through CEFR English levels **A1, A2, B1, and B2**.
- **Core Job:** Turn daily English practice into an expedition adventure across illustrated global cities—never a dry textbook.
- **Core Loop:** Explore the World Journey Map → pick a city & lesson node → complete a 6-stage interactive English expedition (**Vocabulary, Grammar, Listening, Reading, Speaking, Interactive Challenge**) → earn **XP, Coins, Gems, Streaks, Achievements, and Collectible Relics** → claim **Daily Quests**, climb **League Leaderboards**, customize **Explorer Avatars**, and track CEFR mastery on the **Personal Progress Dashboard**.

## Technical & Architecture Constraints
- Cross-platform **Expo SDK 58 + Expo Router + TypeScript** (iOS, Android, Web parity).
- Clean repository/service abstraction (`services/repository.ts` + `services/supabase.ts` + `supabase/schema.sql`) so switching from local mock persistence to live Supabase Postgres + Auth + RLS requires only setting `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- Accessible touch targets (>= 44pt), strong contrast, smooth Reanimated spring transitions, and web-safe fallbacks for speech synthesis & haptics.
