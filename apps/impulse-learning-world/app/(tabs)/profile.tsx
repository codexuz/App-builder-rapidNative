import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import {
  BookOpen,
  Check,
  Coins,
  Database,
  Flame,
  Gem,
  Headphones,
  Mic,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react-native';
import { ProgressBar } from '@/components/game';
import {
  AnimatedPressable,
  Badge,
  Button,
  Card,
  Screen,
  SectionHeader,
  StatTile,
} from '@/components/ui';
import { GeneratedAssets } from '@/constants/GeneratedAssets';
import { RegionPalette, useAppTheme } from '@/constants/Theme';
import { COLLECTIBLE_RELICS, EXPLORER_AVATARS } from '@/data/mockState';
import { WORLD_CITIES } from '@/data/worldData';
import { useGame } from '@/store/GameContext';
import type { CEFRLevel } from '@/types/game';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const CEFR_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];

export default function ProfileScreen() {
  const { colors, typography, radii } = useAppTheme();
  const { player, backendMode, selectOrBuyAvatar, resetDemoProgress } = useGame();
  const [feedback, setFeedback] = useState<string | null>(null);

  const activeAvatar =
    EXPLORER_AVATARS.find((a) => a.id === player.activeAvatarId) ?? EXPLORER_AVATARS[0];

  const skillRows = [
    { key: 'vocabulary', label: 'Vocabulary', value: player.skillMastery.vocabulary, Icon: BookOpen, color: '#0D9488' },
    { key: 'grammar', label: 'Grammar', value: player.skillMastery.grammar, Icon: Sparkles, color: '#2563EB' },
    { key: 'listening', label: 'Listening', value: player.skillMastery.listening, Icon: Headphones, color: '#DB2777' },
    { key: 'reading', label: 'Reading', value: player.skillMastery.reading, Icon: BookOpen, color: '#D97706' },
    { key: 'speaking', label: 'Speaking', value: player.skillMastery.speaking, Icon: Mic, color: '#4F46E5' },
  ];

  const handleAvatarPress = (avatarId: string) => {
    const res = selectOrBuyAvatar(avatarId);
    setFeedback(res.message);
  };

  return (
    <Screen hasTabBar>
      {/* Explorer Hero Card */}
      <Card style={styles.heroCard}>
        <View style={styles.heroRow}>
          <View style={[styles.avatarFrame, { borderColor: activeAvatar.accentColor }]}>
            <Image
              source={GeneratedAssets[activeAvatar.imageKey]}
              style={styles.heroAvatar}
            />
          </View>
          <View style={styles.heroText}>
            <Text style={[typography.title1, { color: colors.textPrimary }]}>
              {player.displayName}
            </Text>
            <Text style={[typography.callout, { color: colors.textSecondary }]}>
              {player.explorerTitle}
            </Text>
            <View style={styles.heroBadges}>
              <Badge label={`CEFR ${player.currentLevel}`} tone="accent" dot />
              <Badge
                label={`${player.ownedRelicIds.length} ${player.ownedRelicIds.length === 1 ? 'Relic' : 'Relics'}`}
                tone="warning"
              />
            </View>
          </View>
        </View>
      </Card>

      {/* Key Progression Metrics */}
      <View style={styles.statsRow}>
        <StatTile
          label="Total XP"
          value={player.xp.toLocaleString()}
          trend={`+${player.weeklyXp} wk`}
          trendTone="success"
          icon={<Zap size={16} color={colors.xp} />}
        />
        <StatTile
          label="Day Streak"
          value={`${player.streakDays}d`}
          trend="Active"
          trendTone="warning"
          icon={<Flame size={16} color={colors.streak} />}
        />
      </View>

      {/* Weekly Streak Tracker */}
      <Card style={styles.streakCard}>
        <SectionHeader
          title="Weekly Expedition Flame"
          subtitle="Complete 1 stop daily to keep your streak burning"
        />
        <View style={styles.weekRow}>
          {WEEKDAYS.map((day, idx) => {
            const done = player.weekActivity[idx];
            return (
              <View key={`${day}-${idx}`} style={styles.dayCol}>
                <View
                  style={[
                    styles.dayBubble,
                    {
                      backgroundColor: done ? colors.streak : colors.surfaceMuted,
                    },
                  ]}
                >
                  {done ? (
                    <Flame size={16} color="#FFFFFF" fill="#FFFFFF" />
                  ) : (
                    <View style={[styles.emptyDot, { backgroundColor: colors.borderStrong }]} />
                  )}
                </View>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>{day}</Text>
              </View>
            );
          })}
        </View>
      </Card>

      {/* Explorer Avatar Wardrobe */}
      <SectionHeader
        title="Explorer Avatars"
        subtitle={`Wallet: ${player.coins} Coins · ${player.gems} Gems`}
      />

      {feedback ? (
        <Card variant="muted" style={styles.feedbackCard}>
          <Text style={[typography.callout, { color: colors.textPrimary }]}>{feedback}</Text>
        </Card>
      ) : null}

      <View style={styles.avatarGrid}>
        {EXPLORER_AVATARS.map((avatar) => {
          const unlocked = player.unlockedAvatarIds.includes(avatar.id);
          const isActive = player.activeAvatarId === avatar.id;

          return (
            <AnimatedPressable
              key={avatar.id}
              onPress={() => handleAvatarPress(avatar.id)}
              haptic="selection"
              containerStyle={{ flex: 1, minWidth: 0 }}
              style={[
                styles.avatarOption,
                {
                  backgroundColor: colors.surface,
                  borderColor: isActive ? avatar.accentColor : colors.border,
                  borderWidth: isActive ? 2 : 1,
                  borderRadius: radii.lg,
                },
              ]}
            >
              <Image
                source={GeneratedAssets[avatar.imageKey]}
                style={styles.optionImage}
              />
              <Text
                style={[typography.callout, { color: colors.textPrimary }]}
                numberOfLines={1}
              >
                {avatar.name.split(' ')[0]}
              </Text>
              <Text
                style={[typography.caption, { color: colors.textSecondary, textAlign: 'center' }]}
                numberOfLines={1}
              >
                {avatar.title}
              </Text>
              {isActive ? (
                <View style={[styles.equippedTag, { backgroundColor: avatar.accentColor }]}>
                  <Check size={12} color="#FFFFFF" strokeWidth={3} />
                  <Text style={styles.equippedText}>Active</Text>
                </View>
              ) : unlocked ? (
                <Badge label="Equip" tone="neutral" />
              ) : avatar.costCoins > 0 ? (
                <View style={[styles.costChip, { backgroundColor: colors.coinMuted }]}>
                  <Coins size={12} color={colors.coin} />
                  <Text style={[styles.costText, { color: colors.coin }]}>
                    {avatar.costCoins}
                  </Text>
                </View>
              ) : (
                <View style={[styles.costChip, { backgroundColor: colors.gemMuted }]}>
                  <Gem size={12} color={colors.gem} />
                  <Text style={[styles.costText, { color: colors.gem }]}>
                    {avatar.costGems}
                  </Text>
                </View>
              )}
            </AnimatedPressable>
          );
        })}
      </View>

      {/* CEFR Level Journey Ladder */}
      <SectionHeader
        title="CEFR Level Progress"
        subtitle="Master each destination from A1 through B2"
      />
      <Card style={styles.cefrCard}>
        {CEFR_LEVELS.map((level) => {
          const city = WORLD_CITIES.find((c) => c.level === level)!;
          const done = city.lessons.filter((l) =>
            player.completedLessonIds.includes(l.id)
          ).length;
          const total = city.lessons.length;
          const palette = RegionPalette[level];

          return (
            <View key={level} style={styles.cefrRow}>
              <View style={styles.cefrTop}>
                <View style={styles.cefrLeft}>
                  <View style={[styles.cefrTag, { backgroundColor: palette.primary }]}>
                    <Text style={styles.cefrTagText}>{level}</Text>
                  </View>
                  <Text style={[typography.callout, { color: colors.textPrimary }]}>
                    {city.name}
                  </Text>
                </View>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  {done}/{total} lessons
                </Text>
              </View>
              <ProgressBar progress={done / total} color={palette.primary} height={8} />
            </View>
          );
        })}
      </Card>

      {/* 5-Skill Mastery Breakdown */}
      <SectionHeader title="English Skill Mastery" subtitle="Updated after every expedition" />
      <Card style={styles.skillsCard}>
        {skillRows.map(({ key, label, value, Icon, color }) => (
          <View key={key} style={styles.skillRow}>
            <View style={styles.skillHeader}>
              <View style={styles.skillNameRow}>
                <Icon size={15} color={color} />
                <Text style={[typography.callout, { color: colors.textPrimary }]}>{label}</Text>
              </View>
              <Text style={[typography.callout, { color: colors.textSecondary }]}>{value}%</Text>
            </View>
            <ProgressBar progress={value / 100} color={color} height={8} />
          </View>
        ))}
      </Card>

      {/* Relic Vault Summary & Supabase Sync Card */}
      <Card variant="outlined" style={styles.syncCard}>
        <View style={styles.syncTop}>
          <Database size={18} color={colors.accent} />
          <View style={styles.syncText}>
            <Text style={[typography.headline, { color: colors.textPrimary }]}>
              Cloud Sync Architecture
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              {backendMode === 'supabase'
                ? 'Connected to live Supabase Postgres'
                : `Local demo mode · ${player.ownedRelicIds.length}/${COLLECTIBLE_RELICS.length} relics saved locally. Add EXPO_PUBLIC_SUPABASE_URL to enable cloud sync.`}
            </Text>
          </View>
        </View>
        <Button
          label="Reset Demo Progress"
          variant="outline"
          size="sm"
          icon={<RotateCcw size={14} color={colors.textPrimary} />}
          onPress={() => {
            resetDemoProgress();
            setFeedback('Progress reset to starter expedition state.');
          }}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    paddingVertical: 18,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarFrame: {
    borderWidth: 3,
    borderRadius: 42,
    padding: 3,
  },
  heroAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  heroText: {
    flex: 1,
    gap: 4,
  },
  heroBadges: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  streakCard: {
    gap: 14,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  dayCol: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  dayBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  feedbackCard: {
    paddingVertical: 10,
  },
  avatarGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  avatarOption: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    gap: 5,
  },
  optionImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 2,
  },
  equippedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  equippedText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  costChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  costText: {
    fontSize: 11,
    fontWeight: '800',
  },
  cefrCard: {
    gap: 14,
  },
  cefrRow: {
    gap: 6,
  },
  cefrTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cefrLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cefrTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cefrTagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  skillsCard: {
    gap: 14,
  },
  skillRow: {
    gap: 6,
  },
  skillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skillNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  syncCard: {
    gap: 12,
  },
  syncTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  syncText: {
    flex: 1,
    gap: 3,
  },
});
