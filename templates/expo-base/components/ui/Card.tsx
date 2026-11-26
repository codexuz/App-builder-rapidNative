import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '@/constants/Theme';
import { AnimatedPressable } from './AnimatedPressable';

export type CardVariant = 'elevated' | 'outlined' | 'muted' | 'gradient';

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padded?: boolean;
  onPress?: () => void;
  gradientColors?: readonly [string, string, ...string[]];
  style?: StyleProp<ViewStyle>;
}

export function Card({
  children,
  variant = 'elevated',
  padded = true,
  onPress,
  gradientColors,
  style,
}: CardProps) {
  const { colors, radii, spacing, shadows } = useAppTheme();

  const baseStyle: ViewStyle = {
    borderRadius: radii.lg,
    padding: padded ? spacing.lg : 0,
    overflow: 'hidden',
  };

  let content: React.ReactNode;

  if (variant === 'gradient') {
    const stops = gradientColors ?? ([colors.gradientStart, colors.gradientEnd] as const);
    content = (
      <LinearGradient
        colors={stops}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[baseStyle, shadows.md, style]}
      >
        {children}
      </LinearGradient>
    );
  } else {
    const variantStyle: ViewStyle =
      variant === 'elevated'
        ? {
            backgroundColor: colors.surface,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border,
            ...shadows.sm,
          }
        : variant === 'outlined'
          ? {
              backgroundColor: 'transparent',
              borderWidth: 1,
              borderColor: colors.border,
            }
          : {
              backgroundColor: colors.surfaceMuted,
            };

    content = <View style={[baseStyle, variantStyle, style]}>{children}</View>;
  }

  if (onPress) {
    return (
      <AnimatedPressable onPress={onPress} scaleTo={0.985} accessibilityRole="button">
        {content}
      </AnimatedPressable>
    );
  }

  return content;
}
