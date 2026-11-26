import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useAppTheme } from '@/constants/Theme';
import { AnimatedPressable, type HapticStyle } from './AnimatedPressable';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  haptic?: HapticStyle;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  rightIcon,
  loading = false,
  disabled = false,
  fullWidth = false,
  haptic = 'light',
  style,
}: ButtonProps) {
  const { colors, radii } = useAppTheme();
  const isDisabled = disabled || loading;

  const sizeStyles: Record<ButtonSize, { height: number; px: number; fontSize: number }> = {
    sm: { height: 36, px: 14, fontSize: 13 },
    md: { height: 48, px: 18, fontSize: 15 },
    lg: { height: 54, px: 22, fontSize: 16 },
  };

  const palette: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: colors.accent, fg: colors.accentForeground },
    secondary: { bg: colors.surfaceMuted, fg: colors.textPrimary },
    outline: { bg: 'transparent', fg: colors.textPrimary, border: colors.borderStrong },
    ghost: { bg: 'transparent', fg: colors.textSecondary },
    danger: { bg: colors.danger, fg: '#FFFFFF' },
  };

  const currentSize = sizeStyles[size];
  const currentPalette = palette[variant];

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={isDisabled}
      haptic={haptic}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[
        styles.base,
        {
          height: currentSize.height,
          paddingHorizontal: currentSize.px,
          borderRadius: radii.md,
          backgroundColor: currentPalette.bg,
          borderWidth: currentPalette.border ? 1 : 0,
          borderColor: currentPalette.border,
          opacity: isDisabled ? 0.5 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={currentPalette.fg} />
      ) : (
        <View style={styles.row}>
          {icon}
          <Text
            numberOfLines={1}
            style={[
              styles.label,
              { color: currentPalette.fg, fontSize: currentSize.fontSize },
            ]}
          >
            {label}
          </Text>
          {rightIcon}
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontWeight: '600',
    letterSpacing: -0.1,
  },
});
