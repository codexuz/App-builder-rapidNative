import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useAppTheme } from '@/constants/Theme';

export type BadgeTone = 'accent' | 'success' | 'warning' | 'danger' | 'neutral';

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  dot?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Badge({ label, tone = 'neutral', dot = false, style }: BadgeProps) {
  const { colors, radii } = useAppTheme();

  const tones: Record<BadgeTone, { bg: string; fg: string }> = {
    accent: { bg: colors.accentMuted, fg: colors.accent },
    success: { bg: colors.successMuted, fg: colors.success },
    warning: { bg: colors.warningMuted, fg: colors.warning },
    danger: { bg: colors.dangerMuted, fg: colors.danger },
    neutral: { bg: colors.surfaceMuted, fg: colors.textSecondary },
  };

  const current = tones[tone];

  return (
    <View style={[styles.badge, { backgroundColor: current.bg, borderRadius: radii.pill }, style]}>
      {dot ? <View style={[styles.dot, { backgroundColor: current.fg }]} /> : null}
      <Text style={[styles.label, { color: current.fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});
