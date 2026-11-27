// Active 3D illustration cutouts for Impulse Kids (Leo lives in components/mascot/LeoMascot.tsx)
export const GeneratedAssets = {
  treasureChest: require('../assets/generated/treasure-chest.png'),
  trophyGold: require('../assets/generated/trophy-gold.png'),
  streakFlame: require('../assets/generated/streak-flame.png'),
} as const;

export type GeneratedAssetKey = keyof typeof GeneratedAssets;
