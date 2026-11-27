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
  AnimatedCounter,
  AnimatedPressable,
  Badge,
  BarChart,
  Button,
  Card,
  Screen,
  SectionHeader,
  SegmentedControl,
  SkillBentoTile,
} from '@/components/ui';
import { GeneratedAssets } from '@/constants/GeneratedAssets';
import { RegionPalette, useAppTheme } from '@/constants/Theme';
import { COLLECTIBLE_RELICS, EXPLORER_AVATARS } from '@/data/mockState';
import { WORLD_CITIES } from '@/data/worldData';
import { useGame } from '@/store/GameContext';
import type { CEFRLevel } from '@/types/game';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const CEFR_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];

const WEEKLY_XP_DATA = [
  { label: 'Mon', value: 110 },
  { label: 'Tue', value: 145 },
  { label: 'Wed', value: 95 },
  { label: 'Thu', value: 190 },
  { label: 'Fri', value: 165 },
  { label: 'Sat', value: 155 },
  { label: 'Sun', value: 90 },
];

const MONTHLY_XP_DATA = [
  { label: 'Wk 1', value: 420 },
  { label: 'Wk 2', value: 680 },
  { label: 'Wk 3', value: 540 },
  { label: 'Wk 4', value: 860 },
];

export default function ProfileScreen() {
  const { colors, typography, radii } = useAppTheme();
  const { player, backendMode, selectOrBuyAvatar, resetDemoProgress } = useGame();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'week' | 'month'>('week');

  const activeAvatar =
    EXPLORER_AVATARS.find((a) => a.id === player.activeAvatarId) ?? EXPLORER_AVATARS[0];

  const handleAvatarPress = (avatarId: string) => {
    const res = selectOrBuyAvatar(avatarId);
    setFeedback(res.message);
  };

  return (
    <Screen hasTabBar>
      {/* Joyful Explorer Hero Card */}
      <Card style={styles.heroCard}>
        <View style={styles.heroRow}>
          <View style={[styles.avatarFrame, { borderColor: colors.accent }]}>
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
              <Badge label={`Level ${player.currentLevel}`} tone="accent" dot />
              <Badge
                label={`${player.ownedRelicIds.length} ${player.ownedRelicIds.length === 1 ? 'Relic' : 'Relics'}`}
                tone="warning"
              />
            </View>
          </View>
        </View>

        <View style={styles.counterRow}>
          <View style={[styles.counterBox, { backgroundColor: colors.xpMuted, borderRadius: radii.md }]}>
            <Zap size={16} color={colors.xp} />
            <AnimatedCounter value={player.xp} style={[styles.counterVal, { color: colors.textPrimary }]} />
            <Text style={[typography.caption, { color: colors.textSecondary }]}>Total XP</Text>
          </View>
          <View style={[styles.counterBox, { backgroundColor: colors.streakMuted, borderRadius: radii.md }]}>
            <Flame size={16} color={colors.streak} fill={colors.streak} />
            <AnimatedCounter value={player.streakDays} suffix="d" style={[styles.counterVal, { color: colors.textPrimary }]} />
            <Text style={[typography.caption, { color: colors.textSecondary }]}>Day Streak</Text>
          </View>
          <View style={[styles.counterBox, { backgroundColor: colors.coinMuted, borderRadius: radii.md }]}>
            <Coins size={16} color={colors.coin} />
            <AnimatedCounter value={player.coins} style={[styles.counterVal, { color: colors.textPrimary }]} />
            <Text style={[typography.caption, { color: colors.textSecondary }]}>Coins</Text>
          </View>
        </View>
      </Card>

      {/* Weekly Expedition Flame */}
      <Card style={styles.streakCard}>
        <View style={styles.streakHeaderRow}>
          <Image
            source={GeneratedAssets.streakFlame}
            style={styles.streakFlameImg}
            resizeMode="contain"
          />
          <View style={{ flex: 1 }}>
            <SectionHeader
              title="Weekly Streak Flame"
              subtitle="Play daily to keep your streak alive!"
            />
          </View>
        </View>
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

      {/* Activity Bar Chart with SegmentedControl (inspired by LanguageLeaningApps/Dashboard.png) */}
      <Card style={styles.chartCard}>
        <SectionHeader
          title="Learning Activity"
          subtitle="Tap any bar to inspect XP earned"
        />
        <SegmentedControl
          value={timeframe}
          onChange={setTimeframe}
          options={[
            { label: 'This Week', value: 'week' },
            { label: 'Monthly', value: 'month' },
          ]}
        />
        <BarChart
          data={timeframe === 'week' ? WEEKLY_XP_DATA : MONTHLY_XP_DATA}
          unit="XP"
          barColor="#FDBA74"
          activeColor="#F97316"
        />
      </Card>

      {/* 2x2 English Skill Bento Grid (inspired by modern language app references) */}
      <SectionHeader
        title="English Skill Powers"
        subtitle="Level up every skill across city adventures"
      />
      <View style={styles.bentoRow}>
        <SkillBentoTile
          title="Vocabulary"
          percent={player.skillMastery.vocabulary}
          accentColor="#0EA5E9"
          icon={<BookOpen size={18} color="#0EA5E9" />}
        />
        <SkillBentoTile
          title="Grammar"
          percent={player.skillMastery.grammar}
          accentColor="#7C3AED"
          icon={<Sparkles size={18} color="#7C3AED" />}
        />
      </View>
      <View style={styles.bentoRow}>
        <SkillBentoTile
          title="Listening"
          percent={player.skillMastery.listening}
          accentColor="#EC4899"
          icon={<Headphones size={18} color="#EC4899" />}
        />
        <SkillBentoTile
          title="Speaking"
          percent={player.skillMastery.speaking}
          accentColor="#10B981"
          icon={<Mic size={18} color="#10B981" />}
        />
      </View>

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
                  borderWidth: isActive ? 2 : 1.25,
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

      {/* CEFR Level Progress */}
      <SectionHeader
        title="CEFR World Roadmap"
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
                  {done}/{total} stops
                </Text>
              </View>
              <ProgressBar progress={done / total} color={palette.primary} height={8} />
            </View>
          );
        })}
      </Card>

      {/* Cloud Sync Architecture Card */}
      <Card variant="outlined" style={styles.syncCard}>
        <View style={styles.syncTop}>
          <Database size={18} color={colors.accent} />
          <View style={styles.syncText}>
            <Text style={[typography.headline, { color: colors.textPrimary }]}>
              Cloud Sync Ready
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              {backendMode === 'supabase'
                ? 'Connected to live Supabase Postgres'
                : `Local demo mode · ${player.ownedRelicIds.length}/${COLLECTIBLE_RELICS.length} relics saved locally.`}
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
            setFeedback('Progress reset to starter adventure state.');
          }}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    gap: 16,
    paddingVertical: 18,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarFrame: {
    borderWidth: 3,
    borderRadius: 42,
    padding: 3,
  },
  heroAvatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  heroText: {
    flex: 1,
    gap: 3,
  },
  heroBadges: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  counterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  counterBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    gap: 3,
  },
  counterVal: {
    fontSize: 19,
    fontWeight: '800',
  },
  streakCard: {
    gap: 14,
  },
  streakHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streakFlameImg: {
    width: 44,
    height: 44,
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
  chartCard: {
    gap: 14,
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 10,
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
    width: 58,
    height: 58,
    borderRadius: 29,
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
