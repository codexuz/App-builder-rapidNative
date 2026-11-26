import { Platform, type TextStyle, type ViewStyle } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';

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
  accentMuted: string;
  accentForeground: string;
  success: string;
  successMuted: string;
  warning: string;
  warningMuted: string;
  danger: string;
  dangerMuted: string;
  gradientStart: string;
  gradientEnd: string;
  tabBarBg: string;
  tabBarBorder: string;
  overlay: string;
}

export const ThemePresets = {
  editorialLight: {
    background: '#F6F5F1',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    surfaceMuted: '#ECEAE3',
    border: '#E4E1D8',
    borderStrong: '#CCC7BA',
    textPrimary: '#141413',
    textSecondary: '#57554F',
    textTertiary: '#8A867D',
    accent: '#18181B',
    accentMuted: '#E9E8E4',
    accentForeground: '#FFFFFF',
    success: '#15803D',
    successMuted: '#DCFCE7',
    warning: '#B45309',
    warningMuted: '#FEF3C7',
    danger: '#B91C1C',
    dangerMuted: '#FEE2E2',
    gradientStart: '#1F2937',
    gradientEnd: '#111827',
    tabBarBg: 'rgba(255, 255, 255, 0.94)',
    tabBarBorder: '#E4E1D8',
    overlay: 'rgba(15, 15, 14, 0.45)',
  },
  obsidianDark: {
    background: '#0B0C0E',
    surface: '#14161A',
    surfaceElevated: '#1C1F26',
    surfaceMuted: '#1E2128',
    border: '#262A33',
    borderStrong: '#383E4B',
    textPrimary: '#F5F7FA',
    textSecondary: '#A1A8B6',
    textTertiary: '#6B7280',
    accent: '#34D399',
    accentMuted: 'rgba(52, 211, 153, 0.14)',
    accentForeground: '#06281E',
    success: '#34D399',
    successMuted: 'rgba(52, 211, 153, 0.14)',
    warning: '#FBBF24',
    warningMuted: 'rgba(251, 191, 36, 0.14)',
    danger: '#F87171',
    dangerMuted: 'rgba(248, 113, 113, 0.15)',
    gradientStart: '#065F46',
    gradientEnd: '#0F172A',
    tabBarBg: 'rgba(20, 22, 26, 0.94)',
    tabBarBorder: '#262A33',
    overlay: 'rgba(0, 0, 0, 0.65)',
  },
  warmCraft: {
    background: '#FAF6F0',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFDF9',
    surfaceMuted: '#EFE8DC',
    border: '#E6DDD0',
    borderStrong: '#D0C3B0',
    textPrimary: '#1E1915',
    textSecondary: '#61564C',
    textTertiary: '#918376',
    accent: '#C2410C',
    accentMuted: '#FFEDD5',
    accentForeground: '#FFFFFF',
    success: '#15803D',
    successMuted: '#DCFCE7',
    warning: '#B45309',
    warningMuted: '#FEF3C7',
    danger: '#B91C1C',
    dangerMuted: '#FEE2E2',
    gradientStart: '#C2410C',
    gradientEnd: '#7C2D12',
    tabBarBg: 'rgba(255, 253, 249, 0.95)',
    tabBarBorder: '#E6DDD0',
    overlay: 'rgba(30, 25, 21, 0.45)',
  },
  emeraldPulse: {
    background: '#07110E',
    surface: '#0F1D18',
    surfaceElevated: '#162922',
    surfaceMuted: '#1A3028',
    border: '#1F3A31',
    borderStrong: '#2E5447',
    textPrimary: '#ECFDF5',
    textSecondary: '#9CAFA8',
    textTertiary: '#647C74',
    accent: '#22C55E',
    accentMuted: 'rgba(34, 197, 94, 0.16)',
    accentForeground: '#052E16',
    success: '#4ADE80',
    successMuted: 'rgba(74, 222, 128, 0.16)',
    warning: '#FACC15',
    warningMuted: 'rgba(250, 204, 21, 0.16)',
    danger: '#FB7185',
    dangerMuted: 'rgba(251, 113, 133, 0.16)',
    gradientStart: '#15803D',
    gradientEnd: '#064E3B',
    tabBarBg: 'rgba(15, 29, 24, 0.94)',
    tabBarBorder: '#1F3A31',
    overlay: 'rgba(3, 10, 8, 0.7)',
  },
} satisfies Record<string, ThemeColors>;

export type ThemePresetName = keyof typeof ThemePresets;

/**
 * Customize per app by changing the light/dark preset pair or locking both
 * to a single brand theme (e.g. `light: 'obsidianDark', dark: 'obsidianDark'`).
 */
export const ActiveThemeConfig: {
  light: ThemePresetName;
  dark: ThemePresetName;
} = {
  light: 'editorialLight',
  dark: 'obsidianDark',
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
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 9999,
} as const;

export const Typography: Record<string, TextStyle> = {
  display: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  title1: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  title2: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  headline: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
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
    fontWeight: '500',
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  overline: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  metric: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: -0.6,
    fontVariant: ['tabular-nums'],
  },
};

export const Motion = {
  pressScale: 0.97,
  spring: {
    damping: 18,
    stiffness: 280,
    mass: 0.8,
  },
} as const;

export function getShadows(isDark: boolean): Record<'sm' | 'md' | 'lg', ViewStyle> {
  if (Platform.OS === 'web') {
    return {
      sm: { boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.35)' : '0 2px 8px rgba(15,15,14,0.06)' } as ViewStyle,
      md: { boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.45)' : '0 8px 24px rgba(15,15,14,0.08)' } as ViewStyle,
      lg: { boxShadow: isDark ? '0 14px 36px rgba(0,0,0,0.55)' : '0 14px 36px rgba(15,15,14,0.12)' } as ViewStyle,
    };
  }
  return {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.35 : 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.45 : 0.08,
      shadowRadius: 14,
      elevation: 5,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: isDark ? 0.55 : 0.12,
      shadowRadius: 24,
      elevation: 10,
    },
  };
}

export function useAppTheme() {
  const scheme = useColorScheme();
  const presetName = scheme === 'dark' ? ActiveThemeConfig.dark : ActiveThemeConfig.light;
  const isDark = presetName === 'obsidianDark' || presetName === 'emeraldPulse';
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
