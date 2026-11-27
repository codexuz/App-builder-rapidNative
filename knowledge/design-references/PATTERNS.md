# Design Reference Pattern Library (Extracted from `app uis/`)

Run `pnpm refs:index` whenever new images or UI kit `.zip` files are added to `app uis/`.
Use `knowledge/design-references/index.json` to locate matching screens by `category` or `tags` (`navigation-tabbar`, `onboarding`, `auth`, `home-dashboard`, `learning-exercise`, `voice-ai`, `gamification`, `monetization`, `commerce-pos`, `social-chat`, `weather-telemetry`, `empty-error-state`).

## Standout Reusable Mobile Patterns Observed

### 1. Navigation Bar Variations (`app uis/bottom-tab navigation/`, `SocialMedia/Threads/`, `designs/`)
- **Active-Pill Capsule Bar** (`Home screen.png`): Dark floating capsule where only the active tab expands to an accent pill showing `icon + label`, while inactive tabs stay compact icon-only. Ideal for 4–5 destinations with zero horizontal crowding.
- **Notched Center-Action Bar** (`BNB-01.png`, `designs/385e4b29...webp`): Standard 4-slot bottom bar with a prominent circular center FAB for the primary creation/AI/scan action.
- **Ultra-Minimal Monochrome Bar** (`SocialMedia/Threads/Threads.png`): Crisp icon-only bar with subtle notification dot—best for content/social feeds where chrome should recede.

### 2. Gamified & Interactive Hero Patterns (`LanguageLeaningApps/`, `widgets/`, `designs/`)
- **Character Goal Hero + Milestone Chest Bar** (`LanguageLeaningApps/Dashboard.png`): Expressive character paired with a clear numeric countdown, milestone reward marker on the progress bar, and segmented `Daily / Monthly / Yearly` rounded bar chart below.
- **Emotional Streak Widgets** (`widgets/Fito App...`): Compact status cards whose illustration mood & copy shift dynamically with streak state (`0 week`, `3 week`, `2 month streak` chained dots).
- **2×2 Skill-Progress Bento** (`designs/1c450791...webp`, `designs/385e4b29...webp`): Four clean skill tiles with corner navigation arrows and slim color-coded mastery bars.
- **Stepped Podium Leaderboard** (`designs/2c11a62b...webp`): Dark contrast leaderboard panel pairing 2 summary KPI tiles (`Time` + `Completed`) above colored stepped 2nd / 1st / 3rd podium blocks.
- **Live Voice / AI Coach Screen** (`designs/385e4b29...webp`, `LMS/app3_learna/`): Full-bleed video/avatar stage with floating timer pill, PiP self-preview, and clean bottom call controls.

### 3. Atmospheric & Telemetry Patterns (`weather app/`)
- **Full-Bleed Illustrated Scene + Frosted Bottom Sheet**: Edge-to-edge illustrated hero transitioning into a pull-up forecast sheet (`Hourly / Weekly`) and 2-column telemetry cards (compass dial, gradient scale, sunrise curve).

### 4. Ready-to-Use Empty & Error Illustrations (`LMS/empty_illustrations/`)
- 25 clean vector empty-state PNGs across **Connectivity**, **E-Commerce**, **Messages**, and **Social** ready for rapid prototyping or style reference.

### 5. Full Product Flows Available Inside Archives
- **Education / Language Learning:** `Speak Up`, `Learna`, `BahasaKu`, `Duolingo` (auth/OTP, goal pickers, listening/quiz/voice states, paywalls, settings).
- **Commerce / POS:** `POS` (`Scan Products`, `Products`, `Dashboard`).
- **Social & Messaging:** `Telegram` (300+ screens: chats, search, forwarding, replies, profiles) and `Threads` (design tokens, thread cards, icons).
