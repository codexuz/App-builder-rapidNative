# Design Reference Pattern Library (Extracted from `app uis/`)

Run `pnpm refs:index` whenever new images or flows are added to `app uis/`.
All UI reference kits are unzipped and compressed as `.webp` under `app uis/`, indexed in `knowledge/design-references/index.json` by `category`, `tags`, and `flows[]`.
For full screen-by-screen UX flows and state transitions, also consult `knowledge/design-references/IBRAT_FLOW.md` and `knowledge/design-references/ENGLIFY_FLOW.md`.

## Standout Reusable Mobile Patterns Observed

### 1. Navigation Bar Variations (`bottom-tab navigation/`, `IbratApp/`, `Englify/`, `SocialMedia/Threads/`, `LanguageLearningKit/`)
- **Active-Pill Capsule Bar** (`bottom-tab navigation/Home screen.webp`, `LanguageLearningKit/Home Page.webp`): Floating capsule or light dock where only the active tab expands to an accent pill showing `icon + label`, while inactive tabs stay icon-only.
- **Circular Active-Badge Capsule** (`Englify/flow-01/frame-0001.webp`, `0841.webp`): Light floating capsule where the active destination highlights inside a solid circular accent badge.
- **Notched Center-Action Bar** (`bottom-tab navigation/BNB-01.webp`, `designs/385e4b29...webp`): Standard 4-slot bottom bar with a prominent circular center FAB for the primary creation/AI/scan action.
- **Color-Coded 5-Tab Bar** (`IbratApp/flow-01/frame-0009.webp`): Compact 5-destination bar (`Asosiy`, `O'rganish`, `Missiya`, `O'yinlar`, `Profil`) where each active tab adopts its domain accent hue.
- **Ultra-Minimal Monochrome Bar** (`SocialMedia/Threads/Threads.webp`): Crisp icon-only bar with subtle notification dot—best for content/social feeds where chrome should recede.

### 2. Gamified, Flow & Interactive Patterns (`IbratApp/`, `LanguageLeaningApps/`, `LMS/app2/`, `LMS/app3_learna/`, `streaks/`, `widgets/`, `designs/`)
- **End-to-End Flow Blueprint (`IbratApp/flow-01/` & `flow-02/`, see `IBRAT_FLOW.md`):**
  - **7-Day Streak & Milestone Hero** (`flow-01/frame-0009.webp`): Avatar badge + 7-day flame/snowflake/ring strip + `N days to next milestone` progress pill.
  - **Daily Reward Sheet + Confetti Burst** (`flow-01/frame-0018.webp`, `0036.webp`): 7-day escalating XP grid sheet transitioning into flying XP ribbons + dark counter toast.
  - **Isometric 3D Cube Mission Path** (`flow-01/frame-0070.webp`, `flow-02/frame-0015.webp`): Floating 3D stepping-stone cubes (completed, glowing active with `BOSHLASH` tooltip, locked) + sticky bottom mission CTA.
  - **Memory Garden 5-Stage SRS & Jigsaw Topic Cards** (`flow-02/frame-0380.webp`, `0485.webp`): Botanical spaced-repetition pipeline (`Seed -> Sprout -> Sapling -> Tree -> Fruit`) paired with 3-piece puzzle-reveal topic cards.
  - **Live 1v1 Tug-of-War PvP Arena** (`flow-02/frame-0980.webp`, `1091.webp`): Dual avatars flanking circular countdown ring + animated tug-of-war bar + 2-choice speed translation + `21:11` rematch summary.
- **IELTS 4-Skill Oversized-Corner Cards & 2×3 Progress Bento** (`IbratApp`, `LMS/app3_learna/Progress.webp`, `designs/1c450791...webp`): Full-width skill cards with cropped corner icons or 2×2/2×3 mastery tiles paired with a multi-segment stacked horizontal level bar.
- **Englify End-to-End Flow & Expressive AI Tutor (`Englify/flow-01/`, see `ENGLIFY_FLOW.md`):**
  - **5-Column Vertical Skill Header + 4×2 3D Launcher Grid** (`flow-01/frame-0001.webp`): Blue hero housing 5 vertical skill bars above a curved white sheet with 3D toy/clay icons and a `Jang` battle stats card.
  - **Personality-Slidable AI Voice Face (`Mr Vaysaqi`, `frame-1338.webp`, `1397.webp`)**: Full-bleed sky-blue expressive face with `ANGRY / CLASSIC / FRIENDLY` slider, free-talk vs push-to-talk toggle, `01:00` timer, and `CC` captions.
  - **Dotted Winding Unit Path & Hexagonal Badges** (`frame-0841.webp`, `0115.webp`): Rounded square unit nodes connected by dashed paths with pointer tooltip + 3×2 hexagonal medal grid.
- **Jolingo Chapter-Rail Path, Picture Word Cards & Calendar Insights (`LanguageLeaningApps/Jolingo/`, 111 screens):**
  - **Color-Coded Chapter Rail** (`33_Light_home - learning language progress.webp`): Full-width chapter banners (`%` ring / lock) connected by a vertical rail of circular illustrated lesson nodes.
  - **Lesson Completion Ring Matrix & Monthly Heatmap** (`57_Light_learn language - lessons completed.webp`, `77_Light_insights.webp`): 6 circular skill rings (`Listening`, `Pronunciation`, `Fluency`, `Intonation`, `Word Stress`, `Grammar`), monthly circular dot calendar, and capsule bar chart with floating duration pin.
  - **2-Col Illustrated Word Cards & Phrasebook** (`65_Light_phrasebook.webp`, `71_Light_word cards.webp`): Category cards with crisp vector artwork and crown PRO badges.
- **Dolingo Portrait Tutor Path, Roleplay Chat & Slow-Mode Speaking (`LanguageLeaningApps/Dolingo/`, 122 images):**
  - **Serpentine Portrait Path** (`28_Light_home - learning language progress fit page.webp`): Orange chapter banner (`30%` ring) above a smooth S-curve rail connecting circular photo tutor avatars (green completed, violet-ringed active, gray locked).
  - **Full-Bleed Portrait Speaking Tutor** (`30_Light_learn a language - learn with tutor...webp`, `33_...perfect.webp`): Full-bleed tutor photo with dark translucent phrase overlay, glowing mic arc, and `Perfect! (100%)` confetti celebration.
  - **AI Roleplay Chat + Hints + Task Checklist** (`48_Light_chats...webp`, `53_...hint.webp`, `55_...tasks & goal.webp`): 2-column scenario cards with dual FABs, bilingual chat bubbles (`audio / translate / copy`), pull-up spoken `Hint` card, and `Tasks (1/4)` goal progress sheet.
  - **Slow-Mode Speaking Card** (`72_Light_speaking practice.webp`): Waveform + snail slow-playback icon + circular accuracy ring (`0%`) + `Tap to speak` button.
- **Full-Canvas Timed Quiz & AI Voice Tutor** (`LMS/app3_learna/Quiz - Default.webp`, `Quick Talk [Recording Voice].webp`): Saturated emerald quiz canvas with stacked card depth and timer bar; minimal AI voice chat with mode chips (`Guided / Auto / Manual`) and live waveform mic button.
- **Illustrated Hero + Bottom-Sheet Surface** (`LanguageLeaningApps/Bahasaku/Home Page.webp`): Sky-colored greeting banner tucked behind a rounded white sheet housing 2-up green resume cards and landmark-illustrated progress rows.
- **Weekly Study Ring & Ticket Coupon Banner** (`LMS/app2/Home page.webp`): Weekly study hours ring (`2h 15m`) + dashed-divider promo ticket + 4-up photo category grid.
- **Streak State Matrix & Emotional Widgets** (`streaks/StreakDay.webp`, `widgets/Fito App...`): Complete state matrix (`Current`, `Broken`, `Saved` × `Fire` / `Flash`) and mood-reactive mascot widgets.
- **Stepped Podium Leaderboard** (`designs/2c11a62b...webp`): Dark contrast leaderboard panel pairing 2 KPI tiles (`Time` + `Completed`) above colored stepped 2nd / 1st / 3rd podium blocks.

### 3. Commerce, Social, Telemetry & Empty States (`POS/`, `SocialMedia/`, `weather app/`, `LMS/empty_illustrations/`)
- **POS KPI + Tooltip Area Chart & Scanner** (`POS/Dashboard.webp`, `Scan Products.webp`): Dual blue KPI cards, timeframe pills (`1D..1A`), delta pill, smooth dual-line area chart with dark tooltip popover, and clean corner-bracket scanner frame.
- **Stories + Categorized Chat Feed & Profile Grid** (`SocialMedia/Telegram/android-new/Chats.webp`, `android-new-part1/Profile.webp`): Top story rings, count-badged horizontal filter tabs (`Groups 120`, `Channels 3`), floating `+` FAB, and 6-tab media profile grid.
- **Full-Bleed Atmospheric Scene + Frosted Bottom Sheet** (`weather app/WEATHER APP (Community).webp`): Edge-to-edge illustrated hero transitioning into a pull-up forecast sheet and 2-column telemetry cards.
- **Ready-to-Use Empty & Error Illustrations** (`LMS/empty_illustrations/`): 25 compressed `.webp` empty-state illustrations across **Connectivity**, **E-Commerce**, **Messages**, and **Social**.
