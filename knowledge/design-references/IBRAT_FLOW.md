# IbratApp UX Flow & Motion Reference (`app uis/IbratApp/`)

Extracted from two sequential mobile screen recordings (`flow-01`: 990 frames; `flow-02`: 1,163 frames at `590×1280` `.webp`).
Machine-readable keyframe index: `app uis/IbratApp/flow-manifest.json` and `flows[]` in `knowledge/design-references/index.json`.

## Visual System & Primitives
- **Canvas & Surfaces:** Light cool neutral `#F4F5F8` canvas with `#FFFFFF` rounded cards (`borderRadius: 20–24`), subtle hairline borders, and high-contrast dark surfaces reserved for focal paywalls (`Ibrat PRO`) and milestone banners (`Missiya bajarildi`).
- **Palette & Semantic Accents:** Brand violet (`#6B52E5` primary CTAs & active Mission tab), sky blue (`#2089F5` XP pills, audio waveform, PvP rematch), warm orange/gold (`#FF9500` PRO badge, streak flames, discount tag), emerald (`#22C55E` correct states, completed nodes), and coral red (`#EF4444` error feedback sheet).
- **Tactile 3D-Lip Buttons:** Full-width pill/rounded CTAs (`MUKOFOTNI OLISH`, `DARSNI BOSHLASH`, `TOPSHIRIQI DAVOM ETTIRISH`, `DAVOM ETISH`, `TUSHUNARLI`, `OBUNA BO'LISH`) with darker bottom lip depth.
- **Navigation Shell:** 5-tab bottom bar (`Asosiy`, `O'rganish`, `Missiya`, `O'yinlar`, `Profil`) with color-coded active icon + label per tab.

## Flow 1 (`app uis/IbratApp/flow-01/`): Home → Daily Reward → Streak Freeze → Mission → Lesson → Victory
1. **Home Dashboard (`frame-0009.webp`):**
   - Header: language flag dropdown, golden `PRO` pill, `XP 250` badge.
   - **Streak & Milestone Hero Card:** Expressive avatar with level checkmark (`3`), 7-day circle strip (`Du..Ya`) supporting fire/freeze/ring/empty states, and `Keyingi milestone'gacha 4 kun` progress banner.
   - **2-Column Quick Courses:** `Bepul kurslar` and `Pro kurslar` cards with right-aligned circular chevron buttons.
   - **`Missiyalar` Story Carousel:** Full-width illustrated banner (`JAMOAVIY LIGA`) with nested lesson pill (`2 He's, she's, it's >`) and pill-dot pagination.
   - **Tool Bento Grid:** 3-up circular icon tiles (`Speaking`, `Kutubxona`, `Lug'at`) scrolling to `Sinov imtihoni` and `2+6 dasturi sertifikati`.
2. **Daily Reward Sheet & XP Burst (`frame-0018.webp` → `frame-0036.webp`):**
   - Modal bottom sheet (`Kunlik mukofot`) with `2x rewards with Ibrat PRO` upsell banner, 7-day escalating XP grid (`35` → `210 XP`), transitioning on claim into flying `XP` confetti ribbons converging on a dark floating `XP 1820` counter pill.
3. **Streak Freeze Protection (`frame-0054.webp`):**
   - Full-screen illustrated save state (hero shielding streak mascot from storm lightning with an ice crystal), bold `3 kun saqlandi` (`2 ta friz qoldi`), 7-day status strip, and `DARSNI BOSHLASH` CTA.
4. **Isometric 3D Mission Path (`frame-0070.webp`):**
   - Top `Ligalar [Yangi]` pill + course/module selectors; zig-zagging 3D floating cube stepping stones (mint completed, glowing violet active with `BOSHLASH` bubble, white locked cubes); anchored bottom level label (`Lv.1`) + `TOPSHIRIQI DAVOM ETTIRISH`.
5. **Multi-Modal Lesson Engine (`frame-0103.webp` → `frame-0806.webp`):**
   - Persistent top bar: back arrow, glowing `N KETMA-KET` streak progress bar, live `XP` counter.
   - **Grammar Intro & Mnemonic Cards (`frame-0103.webp`, `frame-0318.webp`):** Clean white typographic cards with bolded English/Uzbek pairs and `Esda tuting` callouts.
   - **Scene Observation + True/False (`frame-0188.webp`, `frame-0253.webp`):** Character speech bubble paired with a rounded 16:9 scene card and `To'g'ri` / `Noto'g'ri` pill choices.
   - **Listening Comprehension (`frame-0444.webp`):** Headphone-wearing tutor avatar + interactive waveform audio player (`00:00 / 00:15`) + 4 single-select pills.
   - **Audio Dictation + Inline Diff (`frame-0596.webp`):** Audio player + free-text box + word-level strikethrough diff tokens + slide-up red `Noto'g'ri / Javob` bottom drawer.
6. **Mission Completion & Streak Celebration (`frame-0871.webp` → `frame-0939.webp`):**
   - Dark contrast header (`Missiya bajarildi`), contextual summary + next-lesson teaser, `1/10` horizontal dot tracker (`frame-0871.webp`), followed by jumping mascot `4 Kun` streak celebration where the 7th day dot animates to checked (`frame-0901.webp` → `frame-0939.webp`).
7. **Games Hub (`frame-0967.webp`):**
   - `O'yinlar` tab with daily energy counter (`100`), `Yuzma-yuz` 1v1 PvP translation duel carousel (`O'ynash 0/1 bugun`), and `Eng ko'p o'ynalganlar` word-search card.

## Flow 2 (`app uis/IbratApp/flow-02/`): Mission Switcher → Profile & SRS → PRO Paywall → Live 1v1 PvP Duel
1. **Mission Track Switcher & Path Scroll (`frame-0015.webp` → `frame-0075.webp`, `frame-0120.webp`):**
   - Bottom sheet (`Missiyalar`) radio-selecting between `General English jamoaviy ligasi`, `IELTS Academic`, `Nemis tili`, `Rus tili ligasi`, and `General English`, plus module selector (`Modul 1` → `Modul 10`).
2. **Profile Skeleton, Stats & Notification Sheet (`flow-01`/`v2` & `flow-02`/`frame-0104.webp`–`0272.webp`):**
   - Clean layout-matched shimmer skeleton (`frame-0104.webp`) resolving into profile stats (`O'quv vaqti`, `Darslar`, `Joriy seriya`, `Eng uzun seriya`, `Haftalik faollik` XP line chart) and `Xabarnomalar` list with tap-to-open detail sheet (`frame-0137.webp`).
3. **Dictionary & Spaced-Repetition Memory Garden (`frame-0343.webp` → `frame-0525.webp`):**
   - **Xotira bog'i (Memory Garden):** 5-stage botanical SRS pipeline (`1 kun Urug'` → `3 kun` → `1 hafta` → `1 oy` → `Meva`) with `Takrorlash` badge.
   - **SRS Flashcard Quiz (`frame-0380.webp`):** Target word + audio button + live stage indicator + 2×2 tactile answer grid.
   - **Puzzle-Reveal Topic Cards (`frame-0485.webp`, `frame-0502.webp`):** 3-piece interlocking jigsaw photo reveal (`1 / 3 bo'lak`) + progress bar (`0 / 5`).
4. **Dark Gold PRO Paywall (`frame-0576.webp`):**
   - Radial gold-to-black top glow, 3D orange brand mark, 3-column social proof (`4.9 Rating`, `1.5+ Avg. band gain`, `12k+ Learners`), benefit rows, and 2-column plan picker with tilted yellow price sticker (`318 000 uzs`).
5. **Courses, Certificates & Settings (`frame-0596.webp` → `frame-0738.webp`):**
   - `Kurslarim` flag-badged course rows with remove icon; `Sertifikatlarim` segmented filter (`Modullar` / `Ligalar`) with download button; `Sozlamalar` grouped list with `Ilova mavzusi` 3-way pill selector (`AVTO` / Sun / Moon).
6. **Live 1v1 PvP Duel & Victory (`frame-0845.webp` → `frame-1091.webp`):**
   - **Tug-of-War Arena (`frame-0900.webp`, `frame-0980.webp`):** Opposing player avatars (`Siz` vs `Raqib`) around a circular `60s` ring timer, dual-color **tug-of-war progress bar** with two characters pushing against the center divider, large prompt card (`scarf`), and 2 full-width 3D-lip translation pills (`buvi` / `sharf`).
   - **Victory Summary (`frame-1091.webp`):** `G'alaba!` score (`21 : 11`), accuracy (`100%`), XP gained (`+23`), and stacked `REVANSH` / `YANGI RAQIB` / `LOBBIGA QAYTISH` actions.
7. **IELTS 4-Skill Stack (`O'rganish` tab):**
   - 4 full-width pastel-accented skill cards (`Listening`, `Reading`, `Writing`, `Speaking` · `12 Units` · slim progress bar + `%`) featuring oversized cropped corner illustrations.
