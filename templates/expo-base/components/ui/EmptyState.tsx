import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useAppTheme } from '@/constants/Theme';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onActionPress,
  style,
}: EmptyStateProps) {
  const { colors, typography, radii } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radii.xl,
        },
        style,
      ]}
    >
      {icon ? (
        <View style={[styles.iconWrap, { backgroundColor: colors.surfaceMuted }]}>{icon}</View>
      ) : null}
      <Text style={[typography.title2, styles.centered, { color: colors.textPrimary }]}>
        {title}
      </Text>
      <Text style={[typography.body, styles.centered, { color: colors.textSecondary }]}>
        {description}
      </Text>
      {actionLabel && onActionPress ? (
        <Button label={actionLabel} onPress={onActionPress} style={styles.cta} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  centered: {
    textAlign: 'center',
  },
  cta: {
    marginTop: 8,
    alignSelf: 'center',
  },
});
