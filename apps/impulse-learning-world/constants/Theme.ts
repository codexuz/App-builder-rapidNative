import { Platform, type TextStyle, type ViewStyle } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import type { CEFRLevel } from '@/types/game';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceMuted: string;
  border: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  accent: string;
  accentDark: string;
  accentMuted: string;
  accentForeground: string;
  success: string;
  successMuted: string;
  warning: string;
  warningMuted: string;
  danger: string;
  dangerMuted: string;
  coin: string;
  coinMuted: string;
  gem: string;
  gemMuted: string;
  streak: string;
  streakMuted: string;
  xp: string;
  xpMuted: string;
  gradientStart: string;
  gradientEnd: string;
  tabBarBg: string;
  tabBarBorder: string;
  overlay: string;
  mapTrail: string;
  mapTrailActive: string;
}

export const RegionPalette: Record<
  CEFRLevel,
  { primary: string; deep: string; soft: string; gradient: readonly [string, string] }
> = {
  A1: {
    primary: '#0D9488',
    deep: '#0F766E',
    soft: 'rgba(13, 148, 136, 0.14)',
    gradient: ['#0D9488', '#0284C7'],
  },
  A2: {
    primary: '#2563EB',
    deep: '#1D4ED8',
    soft: 'rgba(37, 99, 235, 0.14)',
    gradient: ['#2563EB', '#7C3AED'],
  },
  B1: {
    primary: '#DB2777',
    deep: '#BE185D',
    soft: 'rgba(219, 39, 119, 0.14)',
    gradient: ['#DB2777', '#D97706'],
  },
  B2: {
    primary: '#4F46E5',
    deep: '#3730A3',
    soft: 'rgba(79, 70, 229, 0.16)',
    gradient: ['#4F46E5', '#059669'],
  },
};

export const ThemePresets = {
  atlasLight: {
    background: '#F5EFE4',
    surface: '#FFFDF9',
    surfaceElevated: '#FFFFFF',
    surfaceMuted: '#EBE2D2',
    border: '#E3D7C3',
    borderStrong: '#CBBBA0',
    textPrimary: '#181C2E',
    textSecondary: '#545A72',
    textTertiary: '#858BA3',
    accent: '#0D9488',
    accentDark: '#0F766E',
    accentMuted: 'rgba(13, 148, 136, 0.13)',
    accentForeground: '#FFFFFF',
    success: '#15803D',
    successMuted: '#DCFCE7',
    warning: '#B45309',
    warningMuted: '#FEF3C7',
    danger: '#DC2626',
    dangerMuted: '#FEE2E2',
    coin: '#D97706',
    coinMuted: '#FEF3C7',
    gem: '#0891B2',
    gemMuted: '#CFFAFE',
    streak: '#EA580C',
    streakMuted: '#FFEDD5',
    xp: '#059669',
    xpMuted: '#D1FAE5',
    gradientStart: '#0D9488',
    gradientEnd: '#1D4ED8',
    tabBarBg: 'rgba(255, 253, 249, 0.96)',
    tabBarBorder: '#E3D7C3',
    overlay: 'rgba(24, 28, 46, 0.55)',
    mapTrail: '#D4C7B0',
    mapTrailActive: '#0D9488',
  },
  atlasDark: {
    background: '#0E1220',
    surface: '#171C30',
    surfaceElevated: '#1F2640',
    surfaceMuted: '#242B47',
    border: '#2D3554',
    borderStrong: '#434E78',
    textPrimary: '#F7F8FC',
    textSecondary: '#A8B0CC',
    textTertiary: '#6F7899',
    accent: '#2DD4BF',
    accentDark: '#0D9488',
    accentMuted: 'rgba(45, 212, 191, 0.15)',
    accentForeground: '#062624',
    success: '#34D399',
    successMuted: 'rgba(52, 211, 153, 0.16)',
    warning: '#FBBF24',
    warningMuted: 'rgba(251, 191, 36, 0.16)',
    danger: '#F87171',
    dangerMuted: 'rgba(248, 113, 113, 0.18)',
    coin: '#FBBF24',
    coinMuted: 'rgba(251, 191, 36, 0.16)',
    gem: '#22D3EE',
    gemMuted: 'rgba(34, 211, 238, 0.16)',
    streak: '#FB923C',
    streakMuted: 'rgba(251, 146, 60, 0.16)',
    xp: '#34D399',
    xpMuted: 'rgba(52, 211, 153, 0.16)',
    gradientStart: '#0F766E',
    gradientEnd: '#3730A3',
    tabBarBg: 'rgba(23, 28, 48, 0.96)',
    tabBarBorder: '#2D3554',
    overlay: 'rgba(4, 6, 14, 0.72)',
    mapTrail: '#2D3554',
    mapTrailActive: '#2DD4BF',
  },
} satisfies Record<string, ThemeColors>;

export type ThemePresetName = keyof typeof ThemePresets;

export const ActiveThemeConfig: {
  light: ThemePresetName;
  dark: ThemePresetName;
} = {
  light: 'atlasLight',
  dark: 'atlasDark',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radii = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 26,
  pill: 9999,
} as const;

export const Typography: Record<string, TextStyle> = {
  display: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: -0.7,
  },
  title1: {
    fontSize: 23,
    lineHeight: 29,
    fontWeight: '800',
    letterSpacing: -0.45,
  },
  title2: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: -0.25,
  },
  headline: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    letterSpacing: -0.15,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  callout: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  metric: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
};

export const Motion = {
  pressScale: 0.96,
  spring: {
    damping: 17,
    stiffness: 300,
    mass: 0.75,
  },
} as const;

export function getShadows(isDark: boolean): Record<'sm' | 'md' | 'lg', ViewStyle> {
  if (Platform.OS === 'web') {
    return {
      sm: { boxShadow: isDark ? '0 3px 10px rgba(0,0,0,0.4)' : '0 3px 10px rgba(24,28,46,0.07)' } as ViewStyle,
      md: { boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(24,28,46,0.10)' } as ViewStyle,
      lg: { boxShadow: isDark ? '0 14px 36px rgba(0,0,0,0.6)' : '0 14px 36px rgba(24,28,46,0.14)' } as ViewStyle,
    };
  }
  return {
    sm: {
      shadowColor: '#181C2E',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: isDark ? 0.4 : 0.07,
      shadowRadius: 8,
      elevation: 3,
    },
    md: {
      shadowColor: '#181C2E',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.5 : 0.1,
      shadowRadius: 14,
      elevation: 6,
    },
    lg: {
      shadowColor: '#181C2E',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: isDark ? 0.6 : 0.15,
      shadowRadius: 24,
      elevation: 10,
    },
  };
}

export function useAppTheme() {
  const scheme = useColorScheme();
  const presetName = scheme === 'dark' ? ActiveThemeConfig.dark : ActiveThemeConfig.light;
  const isDark = presetName === 'atlasDark';
  const colors = ThemePresets[presetName];

  return {
    scheme,
    presetName,
    isDark,
    colors,
    spacing: Spacing,
    radii: Radii,
    typography: Typography,
    shadows: getShadows(isDark),
  };
}
