// Active 3D illustration cutouts for Impulse Kids (Leo lives in components/mascot/LeoMascot.tsx)
// All assets are Gemini-generated 3D glossy toy renders extracted to transparent RGBA PNGs
// via `pnpm assets:cutout`. Render them frameless with gluestack <Image resizeMode="contain">.
export const GeneratedAssets = {
  treasureChest: require('../assets/generated/treasure-chest.png'),
  trophyGold: require('../assets/generated/trophy-gold.png'),
  streakFlame: require('../assets/generated/streak-flame.png'),
  wordCards: require('../assets/generated/word-cards-3d.png'),
  coinPouch: require('../assets/generated/coin-shop-3d.png'),
  courseBook: require('../assets/generated/course-book-3d.png'),
  streakFreeze: require('../assets/generated/streak-freeze-3d.png'),
  badgeMedal: require('../assets/generated/badge-medal-3d.png'),
  giftPrize: require('../assets/generated/gift-prize-3d.png'),
  lockPadlock: require('../assets/generated/lock-padlock-3d.png'),
  xpBolt: require('../assets/generated/xp-bolt-3d.png'),
  gem: require('../assets/generated/gem-3d.png'),
} as const;

export type GeneratedAssetKey = keyof typeof GeneratedAssets;
