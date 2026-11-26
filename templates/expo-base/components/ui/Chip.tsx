import React from 'react';
import { StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { useAppTheme } from '@/constants/Theme';
import { AnimatedPressable } from './AnimatedPressable';

export interface ChipProps {
  label: string;
  selected?: boolean;
  icon?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function Chip({ label, selected = false, icon, onPress, style }: ChipProps) {
  const { colors, radii } = useAppTheme();

  return (
    <AnimatedPressable
      onPress={onPress}
      haptic="selection"
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[
        styles.chip,
        {
          borderRadius: radii.pill,
          backgroundColor: selected ? colors.accent : colors.surface,
          borderColor: selected ? colors.accent : colors.border,
        },
        style,
      ]}
    >
      {icon}
      <Text
        numberOfLines={1}
        style={[
          styles.label,
          { color: selected ? colors.accentForeground : colors.textSecondary },
        ]}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
