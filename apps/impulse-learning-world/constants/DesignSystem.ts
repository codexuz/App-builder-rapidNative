import { Platform, type TextStyle, type ViewStyle } from 'react-native';

/**
 * Impulse Kids Unified Design System
 * Calm #F4F7FC canvas, crisp #FFFFFF surfaces, hairline #E4ECF7 borders,
 * Impulse Cobalt #1055F8 brand accent, and tactile 3D reserved strictly for interactive controls.
 */
export const DS = {
  colors: {
    canvas: '#F4F7FC',
    surface: '#FFFFFF',
    surfaceSubtle: '#F1F5FB',
    border: '#E4ECF7',
    borderStrong: '#CBD5E1',

    ink: '#0F172A',
    inkSecondary: '#475569',
    inkMuted: '#64748B',
    inkSubtle: '#94A3B8',

    brand: '#1055F8',
    brandDeep: '#0A3EC2',
    brandSoft: '#EBF2FF',
    brandBorder: '#BFDBFE',

    green: '#58CC02',
    greenDeep: '#46A302',
    greenSoft: '#ECFDF3',
    greenInk: '#15803D',

    amber: '#F59E0B',
    amberDeep: '#D97706',
    amberSoft: '#FEF3C7',
    amberInk: '#B45309',

    orange: '#F97316',
    orangeSoft: '#FFF1E6',
    orangeInk: '#C2410C',

    red: '#EF4444',
    redDeep: '#DC2626',
    redSoft: '#FEE2E2',
    redInk: '#B91C1C',

    navy: '#0F172A',
    navyCard: '#17223B',
  },

  space: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },

  radius: {
    sm: 10,
    md: 14,
    lg: 18,
    xl: 22,
    pill: 999,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E4ECF7',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOpacity: 0.04,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 1,
      },
      default: {
        boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
      } as ViewStyle,
    }),
  } as ViewStyle,

  type: {
    pageTitle: {
      fontSize: 26,
      lineHeight: 32,
      fontWeight: '800',
      letterSpacing: -0.6,
      color: '#0F172A',
    } as TextStyle,
    sectionTitle: {
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '800',
      letterSpacing: -0.3,
      color: '#0F172A',
    } as TextStyle,
    cardTitle: {
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '700',
      letterSpacing: -0.2,
      color: '#0F172A',
    } as TextStyle,
    body: {
      fontSize: 14.5,
      lineHeight: 21,
      fontWeight: '500',
      color: '#334155',
    } as TextStyle,
    caption: {
      fontSize: 12.5,
      lineHeight: 17,
      fontWeight: '600',
      color: '#64748B',
    } as TextStyle,
    metric: {
      fontSize: 18,
      lineHeight: 22,
      fontWeight: '800',
      fontVariant: ['tabular-nums'],
      color: '#0F172A',
    } as TextStyle,
  },
} as const;
