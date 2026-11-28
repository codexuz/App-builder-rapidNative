# Compiled Implementation Brief

_Generated automatically by `scripts/design-compiler.ts` at 2026-11-28T06:56:51.335Z_

## 1. Visual Direction & Tokens
- **App:** Impulse Learning World (`impulse-learning-world`) — gamified-kids-education
- **Audience:** Students & young explorers learning A1-B2 English
- **Direction:** `playful` + `editorial` (mode: `experience`)
- **Rationale:** Joyful sky-lit adventure playground pairing crisp cloud-white tactile cards, vivid electric-sky/tangerine/violet game highlights, Pip companion fox charm, and a high-contrast dark floating capsule nav bar.
- **Default Theme:** `light` · Accent `#2563EB` · Ground `#F2F6FD`
- **Compiled Tokens:** `constants/CompiledTokens.ts`

**Anti-Patterns to Avoid:**
- dry textbook lists
- low-contrast pastel text
- emoji icons replacing vector icons
- horizontal overflow on 390px screens

## 2. Navigation & Screen Specifications
- **Navigation Pattern:** `capsule-tabs`

### Impulse World (`/`)
- **Purpose:** Playful companion-led learning journey map with Pip mascot, progress ring, pastel KPI bubbles, and illustrated A1-B2 city trails.
- **Layout:** `mascot-hero-plus-journey-map`
- **Components:** `Screen`, `CapsuleTabBar`, `ProgressRing`, `Chip`, `BottomSheet`, `StaggeredEntrance`, `GameHud`, `GameButton`, `WorldCitySection`
- **Assets:** `mascotPip`, `cityA1Brighthaven`, `cityA2LondonSkyrail`, `cityB1KyotoNeon`, `cityB2SummitObservatory`
- **States:** loading=SkeletonShimmer | empty=All cities visible by default | error=Fallback local mock curriculum

### Quests & Stickers (`/quests`)
- **Purpose:** Daily treasure chest milestone, claimable missions, and colorful 2-column stickerbook relic vault.
- **Layout:** `treasure-hero-plus-sticker-grid`
- **Components:** `Screen`, `Card`, `Badge`, `SectionHeader`, `StaggeredEntrance`, `GameHud`, `GameButton`, `ProgressBar`
- **Assets:** `treasureChest`
- **States:** loading=SkeletonShimmer | empty=Encouraging mission refresh state | error=Inline wallet hint banner

### Explorer League (`/leaderboard`)
- **Purpose:** High-contrast dark stepped 3D podium leaderboard, weekly standings, and trophy achievements.
- **Layout:** `stepped-podium-plus-standings`
- **Components:** `Screen`, `Card`, `Badge`, `SectionHeader`, `AnimatedCounter`, `GameHud`, `ProgressBar`
- **Assets:** `avatarKai`, `avatarMaya`, `avatarNova`
- **States:** loading=SkeletonShimmer | empty=Seeded division explorers | error=Cached division standings

### Explorer Profile (`/profile`)
- **Purpose:** Animated XP counter, weekly streak flame, activity bar chart with segmented switcher, 2x2 skill bento grid, and avatar wardrobe.
- **Layout:** `explorer-dashboard-plus-bento`
- **Components:** `Screen`, `Card`, `AnimatedCounter`, `SegmentedControl`, `BarChart`, `SkillBentoTile`, `SectionHeader`, `Button`
- **Assets:** `avatarKai`, `avatarMaya`, `avatarNova`
- **States:** loading=SkeletonShimmer | empty=Starter explorer metrics | error=Local persistence fallback

### Lesson Expedition (`/lesson/a1-lighthouse-directions`)
- **Purpose:** Interactive 6-stage adventure with Pip mascot encouragement bubble, audio playback, speaking meter, word tiles, and treasure chest victory.
- **Layout:** `focused-expedition-runner`
- **Components:** `Card`, `Badge`, `GameButton`, `ProgressBar`, `SoundWaveVisualizer`
- **Assets:** `mascotPip`, `treasureChest`
- **States:** loading=Instant local lesson data | empty=Lesson not found fallback | error=Encouraging hint feedback

## 3. Motion Specification
- **Engine:** `reanimated` · Haptics: `true` · Reduced Motion: `true`

- **ProgressRing** (mount): Smooth radial fill on the Pip mascot hero card
- **GameButton** (press): Tactile 3D scale spring with medium native haptic
- **BarChart** (mount): Staggered rounded bars rising smoothly on dashboard mount

## 4. Asset Manifest
- **Model:** `gpt-image-2-6/flare-text-to-image`
- **Total Assets:** 13

- `appIcon` (icon, 1:1) -> `assets/generated/app-icon.jpg` [approved]
- `mascotPip` (character, 1:1) -> `assets/generated/mascot-pip.png` [approved]
- `treasureChest` (illustration, 1:1) -> `assets/generated/treasure-chest.png` [approved]
- `trophyGold` (badge, 1:1) -> `assets/generated/trophy-gold.png` [approved]
- `streakFlame` (badge, 1:1) -> `assets/generated/streak-flame.png` [approved]
- `cityA1Brighthaven` (hero, 16:9) -> `assets/generated/city-a1-brighthaven.jpg` [approved]
- `cityA2LondonSkyrail` (hero, 16:9) -> `assets/generated/city-a2-london-skyrail.jpg` [approved]
- `cityB1KyotoNeon` (hero, 16:9) -> `assets/generated/city-b1-kyoto-neon.jpg` [approved]
- `cityB2SummitObservatory` (hero, 16:9) -> `assets/generated/city-b2-summit-observatory.jpg` [approved]
- `avatarKai` (character, 1:1) -> `assets/generated/avatar-kai.jpg` [approved]
- `avatarMaya` (character, 1:1) -> `assets/generated/avatar-maya.jpg` [approved]
- `avatarNova` (character, 1:1) -> `assets/generated/avatar-nova.jpg` [approved]
- `gem` (badge, 1:1) -> `assets/generated/gem-3d.png` [approved]

## Validation Notes
- App-specific custom components to implement: GameHud, GameButton, WorldCitySection, ProgressBar, SoundWaveVisualizer
