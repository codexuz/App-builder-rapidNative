import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useAppTheme } from '@/constants/Theme';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onActionPress,
  style,
}: SectionHeaderProps) {
  const { colors, typography } = useAppTheme();

  return (
    <View style={[styles.row, style]}>
      <View style={styles.textCol}>
        <Text style={[typography.title2, { color: colors.textPrimary }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[typography.caption, { color: colors.textSecondary }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {actionLabel && onActionPress ? (
        <Pressable onPress={onActionPress} hitSlop={8} accessibilityRole="button">
          <Text style={[typography.callout, { color: colors.accent, fontWeight: '600' }]}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
});
