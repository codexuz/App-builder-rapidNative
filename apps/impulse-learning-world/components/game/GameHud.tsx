import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Flame } from 'lucide-react-native';
import { LEO_ART } from '@/components/mascot/LeoMascot';
import { AnimatedPressable } from '@/components/ui';
import { useAppTheme } from '@/constants/Theme';
import { api } from '@/lib/api';
import { useKidsApp } from '@/providers/KidsAppProvider';
import { Coin3D, XpBolt3D } from './GameIcons3D';

export interface GameHudProps {
  onAvatarPress?: () => void;
}

/**
 * Impulse Kids top HUD bar matching production erp-lms currencies:
 * Leo / student avatar greeting + Streak Flame + Coins (3D SVG) + XP (3D SVG).
 */
export function GameHud({ onAvatarPress }: GameHudProps) {
  const { colors, radii } = useAppTheme();
  const { me, gamification, today } = useKidsApp();

  const firstName = me?.firstName || 'Explorer';
  const levelNum = today?.level.level ?? 1;
  const streak = gamification?.streak?.currentStreak ?? 0;
  const coins = gamification?.wallet?.cachedCoinBalance ?? today?.coins ?? 0;
  const xp = gamification?.wallet?.cachedXp ?? today?.level.xp ?? 0;
  const avatarUri = api.assetUrl(me?.avatarUrl);

  return (
    <View style={styles.row}>
      <AnimatedPressable
        onPress={onAvatarPress}
        accessibilityLabel="Open Impulse Kids profile"
        style={[
          styles.avatarPill,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radii.pill,
          },
        ]}
      >
        <View style={[styles.avatarCircle, { backgroundColor: '#DBEAFE' }]}>
          <Image
            source={avatarUri ? { uri: avatarUri } : LEO_ART.wave}
            style={styles.avatar}
            resizeMode="cover"
          />
        </View>
        <View style={styles.nameBlock}>
          <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>
            Hi, {firstName}
          </Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>Level {levelNum}</Text>
          </View>
        </View>
      </AnimatedPressable>

      <View style={styles.pills}>
        <View style={[styles.statPill, { backgroundColor: colors.streakMuted }]}>
          <Flame size={15} color={colors.streak} fill={colors.streak} />
          <Text style={[styles.statText, { color: '#C2410C' }]}>{streak}</Text>
        </View>

        <View style={[styles.statPill, { backgroundColor: colors.coinMuted }]}>
          <Coin3D size={17} />
          <Text style={[styles.statText, { color: '#B45309' }]}>{coins}</Text>
        </View>

        <View style={[styles.statPill, { backgroundColor: colors.xpMuted }]}>
          <XpBolt3D size={16} />
          <Text style={[styles.statText, { color: '#15803D' }]}>{xp}</Text>
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
  },
  avatarPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingLeft: 4,
    paddingRight: 11,
    gap: 7,
    borderWidth: 1.5,
    flexShrink: 1,
    shadowColor: '#1055F8',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 34,
    height: 34,
  },
  nameBlock: {
    gap: 2,
    flexShrink: 1,
  },
  name: {
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#1055F8',
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: 999,
  },
  levelBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  pills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statText: {
    fontSize: 12.5,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
});
