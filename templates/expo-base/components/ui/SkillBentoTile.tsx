import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { ArrowUpRight } from 'lucide-react-native';
import { useAppTheme } from '@/constants/Theme';
import { Card } from './Card';

export interface SkillBentoTileProps {
  title: string;
  subtitle?: string;
  /** Value between 0 and 100 */
  percent: number;
  icon: React.ReactNode;
  accentColor?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * 2x2 Bento progress tile inspired by clean modern mobile dashboards:
 * icon + corner navigation cue + slim color-coded completion bar.
 */
export function SkillBentoTile({
  title,
  subtitle,
  percent,
  icon,
  accentColor,
  onPress,
  style,
}: SkillBentoTileProps) {
  const { colors, radii, typography } = useAppTheme();
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const tint = accentColor ?? colors.accent;

  return (
    <Card onPress={onPress} style={[styles.tile, style]}>
      <View style={styles.topRow}>
        <View style={[styles.iconWrap, { backgroundColor: colors.surfaceMuted, borderRadius: radii.sm }]}>
          {icon}
        </View>
        {onPress ? <ArrowUpRight size={16} color={colors.textTertiary} /> : null}
      </View>

      <View style={styles.body}>
        <Text style={[typography.headline, { color: colors.textPrimary }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary }]} numberOfLines={1}>
          {subtitle ?? `${clamped}% completed`}
        </Text>
      </View>

      <View style={[styles.track, { backgroundColor: colors.surfaceMuted }]}>
        <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: tint }]} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconWrap: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    gap: 2,
  },
  track: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    borderRadius: 999,
  },
});
