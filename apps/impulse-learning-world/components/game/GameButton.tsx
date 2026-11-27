import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { AnimatedPressable } from '@/components/ui';
import { useAppTheme } from '@/constants/Theme';

export interface GameButtonProps {
  label: string;
  onPress?: () => void;
  color?: string;
  depthColor?: string;
  textColor?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
}

/**
 * Tactile 3D-extruded adventure button with bottom lip shadow and spring press feedback.
 */
export function GameButton({
  label,
  onPress,
  color,
  depthColor,
  textColor = '#FFFFFF',
  icon,
  rightIcon,
  disabled = false,
  fullWidth = true,
  size = 'lg',
  style,
}: GameButtonProps) {
  const { colors, radii } = useAppTheme();
  const faceColor = color ?? colors.accent;
  const lipColor = depthColor ?? colors.accentDark;

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      haptic="medium"
      scaleTo={0.97}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={[
        styles.outer,
        {
          borderRadius: radii.md,
          backgroundColor: lipColor,
          opacity: disabled ? 0.48 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style,
      ]}
    >
      <View
        style={[
          styles.face,
          {
            borderRadius: radii.md,
            backgroundColor: faceColor,
            minHeight: size === 'lg' ? 52 : 44,
            paddingHorizontal: size === 'lg' ? 20 : 16,
          },
        ]}
      >
        {icon}
        <Text style={[styles.label, { color: textColor, fontSize: size === 'lg' ? 16 : 14 }]}>
          {label}
        </Text>
        {rightIcon}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    paddingBottom: 4,
  },
  face: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});
