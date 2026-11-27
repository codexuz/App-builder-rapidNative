import { Platform, type TextStyle, type ViewStyle } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { CompiledTokens } from '@/constants/CompiledTokens';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2';

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
  violet: string;
  violetMuted: string;
  gradientStart: string;
  gradientEnd: string;
  tabBarBg: string;
  tabBarBorder: string;
  tabBarInactive: string;
  overlay: string;
  mapTrail: string;
  mapTrailActive: string;
}

export const RegionPalette: Record<
  CEFRLevel,
  { primary: string; deep: string; soft: string; gradient: readonly [string, string] }
> = {
  A1: {
    primary: '#1055F8',
    deep: '#0A3BB3',
    soft: '#DBEAFE',
    gradient: ['#1055F8', '#0EA5E9'],
  },
  A2: {
    primary: '#7C3AED',
    deep: '#5B21B6',
    soft: '#EDE9FE',
    gradient: ['#7C3AED', '#2563EB'],
  },
  B1: {
    primary: '#EC4899',
    deep: '#BE185D',
    soft: '#FCE7F3',
    gradient: ['#EC4899', '#F97316'],
  },
  B2: {
    primary: '#10B981',
    deep: '#047857',
    soft: '#D1FAE5',
    gradient: ['#4F46E5', '#10B981'],
  },
};

export const ThemePresets = {
  skyPlayLight: {
    ...CompiledTokens.colors.light,
    accent: '#1055F8',
    accentDark: '#0A3BB3',
    accentMuted: '#EFF6FF',
    coin: '#D97706',
    coinMuted: '#FEF3C7',
    gem: '#0284C7',
    gemMuted: '#E0F2FE',
    streak: '#EA580C',
    streakMuted: '#FFEDD5',
    xp: '#059669',
    xpMuted: '#DCFCE7',
    violet: '#7C3AED',
    violetMuted: '#EDE9FE',
    tabBarBg: '#111827',
    tabBarBorder: '#1F2937',
    tabBarInactive: '#9CA3AF',
    overlay: 'rgba(17, 24, 39, 0.55)',
    mapTrail: '#CBD5E1',
    mapTrailActive: '#1055F8',
  },
  skyPlayDark: {
    ...CompiledTokens.colors.dark,
    accentDark: '#0284C7',
    coin: '#FBBF24',
    coinMuted: 'rgba(251, 191, 36, 0.18)',
    gem: '#38BDF8',
    gemMuted: 'rgba(56, 189, 248, 0.18)',
    streak: '#FB923C',
    streakMuted: 'rgba(251, 146, 60, 0.18)',
    xp: '#34D399',
    xpMuted: 'rgba(52, 211, 153, 0.18)',
    violet: '#A78BFA',
    violetMuted: 'rgba(167, 139, 250, 0.18)',
    tabBarBg: '#151D34',
    tabBarBorder: '#2B3A63',
    tabBarInactive: '#94A3B8',
    overlay: 'rgba(4, 6, 16, 0.72)',
    mapTrail: '#2B3A63',
    mapTrailActive: '#38BDF8',
  },
} satisfies Record<string, ThemeColors>;

export const Spacing = CompiledTokens.spacing;
export const Radii = CompiledTokens.radius;

export const Typography: Record<string, TextStyle> = {
  display: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  title1: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  title2: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    letterSpacing: -0.25,
  },
  headline: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
    letterSpacing: -0.15,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  callout: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
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
  spring: CompiledTokens.motion.springs.snappy,
} as const;

export function getShadows(isDark: boolean): Record<'sm' | 'md' | 'lg', ViewStyle> {
  if (Platform.OS === 'web') {
    return {
      sm: { boxShadow: isDark ? '0 3px 10px rgba(0,0,0,0.4)' : '0 4px 12px rgba(37,99,235,0.07)' } as ViewStyle,
      md: { boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(37,99,235,0.11)' } as ViewStyle,
      lg: { boxShadow: isDark ? '0 14px 36px rgba(0,0,0,0.6)' : '0 14px 32px rgba(17,24,39,0.22)' } as ViewStyle,
    };
  }
  return {
    sm: {
      shadowColor: '#1E3A8A',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: isDark ? 0.4 : 0.07,
      shadowRadius: 8,
      elevation: 3,
    },
    md: {
      shadowColor: '#1E3A8A',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.5 : 0.11,
      shadowRadius: 14,
      elevation: 6,
    },
    lg: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: isDark ? 0.6 : 0.2,
      shadowRadius: 24,
      elevation: 10,
    },
  };
}

export function useAppTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? ThemePresets.skyPlayDark : ThemePresets.skyPlayLight;

  return {
    scheme,
    isDark,
    colors,
    spacing: Spacing,
    radii: Radii,
    typography: Typography,
    shadows: getShadows(isDark),
  };
}
