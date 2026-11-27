import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Coins, Flame, Gem } from 'lucide-react-native';
import { AnimatedPressable } from '@/components/ui';
import { GeneratedAssets } from '@/constants/GeneratedAssets';
import { RegionPalette, useAppTheme } from '@/constants/Theme';
import { EXPLORER_AVATARS } from '@/data/mockState';
import { useGame } from '@/store/GameContext';

export interface GameHudProps {
  onAvatarPress?: () => void;
}

export function GameHud({ onAvatarPress }: GameHudProps) {
  const { player } = useGame();
  const { colors, radii, shadows } = useAppTheme();

  const activeAvatar =
    EXPLORER_AVATARS.find((a) => a.id === player.activeAvatarId) ?? EXPLORER_AVATARS[0];
  const levelColors = RegionPalette[player.currentLevel];
  const firstName = player.displayName.split(' ')[0];

  return (
    <View style={styles.row}>
      <AnimatedPressable
        onPress={onAvatarPress}
        haptic="light"
        accessibilityRole="button"
        accessibilityLabel={`Open explorer profile for ${player.displayName}`}
        style={[
          styles.avatarPill,
          shadows.sm,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radii.pill,
          },
        ]}
      >
        <Image source={GeneratedAssets[activeAvatar.imageKey]} style={styles.avatarImg} />
        <View style={styles.nameWrap}>
          <Text style={[styles.greeting, { color: colors.textPrimary }]} numberOfLines={1}>
            Hi, {firstName}
          </Text>
          <View style={[styles.cefrChip, { backgroundColor: levelColors.primary }]}>
            <Text style={styles.cefrText}>Level {player.currentLevel}</Text>
          </View>
        </View>
      </AnimatedPressable>

      <View style={styles.statsGroup}>
        <View
          style={[
            styles.statPill,
            { backgroundColor: colors.streakMuted, borderRadius: radii.pill },
          ]}
        >
          <Flame size={15} color={colors.streak} fill={colors.streak} />
          <Text style={[styles.statVal, { color: colors.streak }]}>{player.streakDays}</Text>
        </View>

        <View
          style={[
            styles.statPill,
            { backgroundColor: colors.coinMuted, borderRadius: radii.pill },
          ]}
        >
          <Coins size={15} color={colors.coin} />
          <Text style={[styles.statVal, { color: colors.coin }]}>{player.coins}</Text>
        </View>

        <View
          style={[
            styles.statPill,
            { backgroundColor: colors.gemMuted, borderRadius: radii.pill },
          ]}
        >
          <Gem size={15} color={colors.gem} />
          <Text style={[styles.statVal, { color: colors.gem }]}>{player.gems}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingTop: 4,
  },
  avatarPill: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    paddingRight: 12,
    borderWidth: 1.5,
    gap: 8,
  },
  avatarImg: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  nameWrap: {
    gap: 2,
  },
  greeting: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  cefrChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: 999,
  },
  cefrText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  statsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 7,
    gap: 4,
  },
  statVal: {
    fontSize: 12.5,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
});
