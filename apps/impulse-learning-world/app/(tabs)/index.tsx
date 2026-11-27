import React, { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  BookOpen,
  CheckCircle2,
  Coins,
  Compass,
  Flame,
  Gem,
  Headphones,
  Lock,
  Mic,
  Play,
  Puzzle,
  Sparkles,
  Zap,
} from 'lucide-react-native';
import { GameButton, GameHud, WorldCitySection } from '@/components/game';
import {
  Badge,
  BottomSheet,
  Card,
  Chip,
  ProgressRing,
  Screen,
  SectionHeader,
  StaggeredEntrance,
} from '@/components/ui';
import { GeneratedAssets } from '@/constants/GeneratedAssets';
import { RegionPalette, useAppTheme } from '@/constants/Theme';
import { ALL_LESSONS, WORLD_CITIES, getCityById } from '@/data/worldData';
import { useGame } from '@/store/GameContext';
import type { CEFRLevel, LessonNode } from '@/types/game';

const LEVEL_FILTERS: Array<'All' | CEFRLevel> = ['All', 'A1', 'A2', 'B1', 'B2'];

const STAGE_PILLS = [
  { label: 'Vocabulary', Icon: BookOpen },
  { label: 'Grammar', Icon: Sparkles },
  { label: 'Listening', Icon: Headphones },
  { label: 'Reading', Icon: Compass },
  { label: 'Speaking', Icon: Mic },
  { label: 'Builder', Icon: Puzzle },
] as const;

export default function WorldMapScreen() {
  const router = useRouter();
  const { colors, typography, radii } = useAppTheme();
  const {
    player,
    isCityUnlocked,
    isLessonUnlocked,
    getNextRecommendedLesson,
  } = useGame();

  const [levelFilter, setLevelFilter] = useState<'All' | CEFRLevel>('All');
  const [selectedLesson, setSelectedLesson] = useState<LessonNode | null>(null);

  const nextLesson = getNextRecommendedLesson();
  const nextCity = getCityById(nextLesson.cityId);
  const nextPalette = RegionPalette[nextLesson.level];

  const visibleCities = useMemo(() => {
    if (levelFilter === 'All') return WORLD_CITIES;
    return WORLD_CITIES.filter((c) => c.level === levelFilter);
  }, [levelFilter]);

  const totalProgress = player.completedLessonIds.length / ALL_LESSONS.length;
  const selectedUnlocked = selectedLesson ? isLessonUnlocked(selectedLesson.id) : false;
  const selectedCompleted = selectedLesson
    ? player.completedLessonIds.includes(selectedLesson.id)
    : false;
  const selectedCity = selectedLesson ? getCityById(selectedLesson.cityId) : undefined;

  const launchLesson = (lessonId: string) => {
    setSelectedLesson(null);
    router.push({ pathname: '/lesson/[id]', params: { id: lessonId } });
  };

  return (
    <Screen hasTabBar>
      <GameHud onAvatarPress={() => router.push('/(tabs)/profile')} />

      {/* Playful Pip Companion Hero Card */}
      <StaggeredEntrance index={0}>
        <Card variant="gradient" gradientColors={nextPalette.gradient} style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.mascotRow}>
              <View style={styles.mascotStage}>
                <Image
                  source={GeneratedAssets.mascotPip}
                  style={styles.mascotImg}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.heroTitleCol}>
                <View style={styles.nextLevelPill}>
                  <Text style={styles.nextLevelText}>
                    {nextLesson.level} · {nextCity?.name}
                  </Text>
                </View>
                <Text style={[typography.title1, { color: '#FFFFFF' }]} numberOfLines={2}>
                  {nextLesson.title}
                </Text>
              </View>
            </View>

            <ProgressRing
              progress={totalProgress}
              size={66}
              strokeWidth={7}
              color="#FDE047"
              trackColor="rgba(255,255,255,0.25)"
            >
              <Text style={styles.ringText}>
                {player.completedLessonIds.length}/{ALL_LESSONS.length}
              </Text>
            </ProgressRing>
          </View>

          <Text style={styles.heroSub} numberOfLines={2}>
            Pip says: "{nextLesson.subtitle}"
          </Text>

          <GameButton
            label={`Start Adventure (+${nextLesson.xpReward} XP)`}
            color="#FFFFFF"
            depthColor="rgba(15, 23, 42, 0.35)"
            textColor={nextPalette.deep}
            icon={<Play size={17} color={nextPalette.deep} fill={nextPalette.deep} />}
            onPress={() => launchLesson(nextLesson.id)}
          />
        </Card>
      </StaggeredEntrance>

      {/* Joyful 3-Column Pastel Stat Bubbles */}
      <StaggeredEntrance index={1}>
        <View style={styles.pastelStatsRow}>
          <View style={[styles.pastelBubble, { backgroundColor: colors.xpMuted, borderRadius: radii.lg }]}>
            <View style={[styles.bubbleIcon, { backgroundColor: colors.xp }]}>
              <CheckCircle2 size={16} color="#FFFFFF" />
            </View>
            <Text style={[styles.bubbleValue, { color: colors.textPrimary }]}>
              {player.completedLessonIds.length}
            </Text>
            <Text style={[styles.bubbleLabel, { color: colors.textSecondary }]}>Cleared</Text>
          </View>

          <View style={[styles.pastelBubble, { backgroundColor: colors.streakMuted, borderRadius: radii.lg }]}>
            <View style={[styles.bubbleIcon, { backgroundColor: colors.streak }]}>
              <Flame size={16} color="#FFFFFF" fill="#FFFFFF" />
            </View>
            <Text style={[styles.bubbleValue, { color: colors.textPrimary }]}>
              {player.streakDays}d
            </Text>
            <Text style={[styles.bubbleLabel, { color: colors.textSecondary }]}>Streak</Text>
          </View>

          <View style={[styles.pastelBubble, { backgroundColor: colors.accentMuted, borderRadius: radii.lg }]}>
            <View style={[styles.bubbleIcon, { backgroundColor: colors.accent }]}>
              <Zap size={16} color="#FFFFFF" fill="#FFFFFF" />
            </View>
            <Text style={[styles.bubbleValue, { color: colors.textPrimary }]}>
              {player.xp}
            </Text>
            <Text style={[styles.bubbleLabel, { color: colors.textSecondary }]}>Total XP</Text>
          </View>
        </View>
      </StaggeredEntrance>

      {/* World Map Section & CEFR Filter Chips */}
      <SectionHeader
        title="World Adventure Map"
        subtitle="Explore cities & unlock A1 to B2 badges"
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {LEVEL_FILTERS.map((level) => (
          <Chip
            key={level}
            label={level === 'All' ? 'All Worlds' : `Level ${level}`}
            selected={levelFilter === level}
            onPress={() => setLevelFilter(level)}
          />
        ))}
      </ScrollView>

      {/* Illustrated Journey Map Cities */}
      <View style={styles.citiesStack}>
        {visibleCities.map((city) => (
          <WorldCitySection
            key={city.id}
            city={city}
            cityUnlocked={isCityUnlocked(city.id)}
            completedLessonIds={player.completedLessonIds}
            lessonScores={player.lessonScores}
            isLessonUnlocked={isLessonUnlocked}
            onSelectLesson={(lesson) => setSelectedLesson(lesson)}
          />
        ))}
      </View>

      {/* Lesson Briefing Bottom Sheet */}
      <BottomSheet
        visible={selectedLesson !== null}
        onClose={() => setSelectedLesson(null)}
        title={selectedLesson?.title}
        subtitle={
          selectedLesson && selectedCity
            ? `${selectedLesson.level} · ${selectedCity.name} · ${selectedLesson.durationMin} min`
            : undefined
        }
      >
        {selectedLesson ? (
          <View style={styles.sheetBody}>
            <Text style={[typography.body, { color: colors.textSecondary }]}>
              {selectedLesson.subtitle}
            </Text>

            <View style={styles.stageGrid}>
              {STAGE_PILLS.map(({ label, Icon }) => (
                <View
                  key={label}
                  style={[
                    styles.stageTag,
                    {
                      backgroundColor: colors.surfaceMuted,
                      borderRadius: radii.sm,
                    },
                  ]}
                >
                  <Icon size={14} color={colors.accent} />
                  <Text style={[typography.caption, { color: colors.textPrimary }]}>
                    {label}
                  </Text>
                </View>
              ))}
            </View>

            <View
              style={[
                styles.rewardRow,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radii.md,
                },
              ]}
            >
              <View style={styles.rewardItem}>
                <Zap size={16} color={colors.xp} />
                <Text style={[typography.callout, { color: colors.textPrimary }]}>
                  +{selectedLesson.xpReward} XP
                </Text>
              </View>
              <View style={styles.rewardItem}>
                <Coins size={16} color={colors.coin} />
                <Text style={[typography.callout, { color: colors.textPrimary }]}>
                  +{selectedLesson.coinReward}
                </Text>
              </View>
              <View style={styles.rewardItem}>
                <Gem size={16} color={colors.gem} />
                <Text style={[typography.callout, { color: colors.textPrimary }]}>
                  +{selectedLesson.gemReward}
                </Text>
              </View>
            </View>

            {selectedUnlocked ? (
              <GameButton
                label={selectedCompleted ? 'Play Again!' : 'Start Adventure!'}
                color={RegionPalette[selectedLesson.level].primary}
                depthColor={RegionPalette[selectedLesson.level].deep}
                icon={<Play size={17} color="#FFFFFF" fill="#FFFFFF" />}
                onPress={() => launchLesson(selectedLesson.id)}
              />
            ) : (
              <View style={styles.lockedNotice}>
                <Badge label="Locked Stop" tone="warning" dot />
                <Text style={[typography.callout, { color: colors.textSecondary }]}>
                  Finish the stop before this one to unlock this adventure.
                </Text>
                <GameButton
                  label="Locked"
                  disabled
                  icon={<Lock size={16} color="#FFFFFF" />}
                />
              </View>
            )}
          </View>
        ) : null}
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    gap: 14,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  mascotRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mascotStage: {
    width: 82,
    height: 82,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -4,
  },
  mascotImg: {
    width: 84,
    height: 84,
  },
  heroTitleCol: {
    flex: 1,
    gap: 5,
  },
  nextLevelPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(15, 23, 42, 0.25)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  nextLevelText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  ringText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  heroSub: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 13.5,
    lineHeight: 19,
    fontWeight: '600',
  },
  pastelStatsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pastelBubble: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    gap: 5,
  },
  bubbleIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  bubbleValue: {
    fontSize: 19,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  bubbleLabel: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  citiesStack: {
    gap: 28,
  },
  sheetBody: {
    gap: 16,
  },
  stageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stageTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 6,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderWidth: 1,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lockedNotice: {
    gap: 10,
  },
});
