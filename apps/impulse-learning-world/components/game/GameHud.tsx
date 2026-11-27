import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Coins, Flame, Zap } from 'lucide-react-native';
import { LEO_ART } from '@/components/mascot/LeoMascot';
import { DS } from '@/constants/DesignSystem';
import { api } from '@/lib/api';
import { useKidsApp } from '@/providers/KidsAppProvider';

export interface GameHudProps {
  onAvatarPress?: () => void;
}

/**
 * Clean, balanced top app header matching Impulse production discipline:
 * - Left: 40x40 circular avatar + Name & Level subtitle (zero pill-inside-pill clutter)
 * - Right: Unified equal-height Streak, Coins & XP counters with consistent Lucide iconography
 */
export function GameHud({ onAvatarPress }: GameHudProps) {
  const { me, gamification, today } = useKidsApp();

  const firstName = me?.firstName || 'Student';
  const levelNum = today?.level.level ?? 1;
  const streak = gamification?.streak?.currentStreak ?? 0;
  const coins = gamification?.wallet?.cachedCoinBalance ?? today?.coins ?? 0;
  const xp = gamification?.wallet?.cachedXp ?? today?.level.xp ?? 0;
  const avatarUri = api.assetUrl(me?.avatarUrl);

  return (
    <View style={styles.bar}>
      <Pressable
        onPress={onAvatarPress}
        accessibilityRole="button"
        accessibilityLabel="Open profile"
        style={styles.identity}
      >
        <View style={styles.avatarRing}>
          <Image
            source={avatarUri ? { uri: avatarUri } : LEO_ART.wave}
            style={styles.avatar}
            resizeMode="cover"
          />
        </View>
        <View style={styles.nameCol}>
          <Text style={styles.name} numberOfLines={1}>
            {firstName}
          </Text>
          <Text style={styles.sub} numberOfLines={1}>
            Level {levelNum}
          </Text>
        </View>
      </Pressable>

      <View style={styles.metrics}>
        <View style={styles.metricChip}>
          <Flame size={15} color={DS.colors.orange} fill={DS.colors.orange} />
          <Text style={[styles.metricText, { color: DS.colors.orangeInk }]}>{streak}</Text>
        </View>

        <View style={styles.metricChip}>
          <Coins size={15} color={DS.colors.amberDeep} />
          <Text style={[styles.metricText, { color: DS.colors.amberInk }]}>{coins}</Text>
        </View>

        <View style={styles.metricChip}>
          <Zap size={15} color={DS.colors.brand} fill={DS.colors.brand} />
          <Text style={[styles.metricText, { color: DS.colors.brand }]}>{xp}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 4,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
    minWidth: 0,
  },
  avatarRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DS.colors.brandSoft,
    borderWidth: 1.5,
    borderColor: DS.colors.brandBorder,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 38,
    height: 38,
  },
  nameCol: {
    flexShrink: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    color: DS.colors.ink,
    letterSpacing: -0.3,
  },
  sub: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '600',
    color: DS.colors.inkMuted,
  },
  metrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 32,
    paddingHorizontal: 9,
    borderRadius: 999,
    backgroundColor: DS.colors.surface,
    borderWidth: 1,
    borderColor: DS.colors.border,
  },
  metricText: {
    fontSize: 12.5,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
});
