import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useAppTheme } from '@/constants/Theme';
import { Badge, type BadgeTone } from './Badge';
import { Card } from './Card';

export interface StatTileProps {
  label: string;
  value: string;
  trend?: string;
  trendTone?: BadgeTone;
  icon?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function StatTile({
  label,
  value,
  trend,
  trendTone = 'success',
  icon,
  onPress,
  style,
}: StatTileProps) {
  const { colors, typography } = useAppTheme();

  return (
    <Card onPress={onPress} style={[styles.tile, style]}>
      <View style={styles.topRow}>
        <Text style={[typography.caption, { color: colors.textSecondary }]} numberOfLines={1}>
          {label}
        </Text>
        {icon}
      </View>
      <Text style={[typography.metric, { color: colors.textPrimary }]} numberOfLines={1}>
        {value}
      </Text>
      {trend ? <Badge label={trend} tone={trendTone} /> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
});
