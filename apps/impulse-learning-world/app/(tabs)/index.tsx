import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  BookOpen,
  Coins,
  Compass,
  Gem,
  Headphones,
  Lock,
  Mic,
  Play,
  Puzzle,
  Sparkles,
  Zap,
} from 'lucide-react-native';
import { GameButton, GameHud, ProgressBar, WorldCitySection } from '@/components/game';
import { Badge, BottomSheet, Card, Chip, Screen } from '@/components/ui';
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

      {/* Header & Overall World Progress */}
      <View style={styles.titleBlock}>
        <Text style={[typography.display, { color: colors.textPrimary }]}>
          Impulse World
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary }]}>
          Unlock cities from A1 to B2 through live English expeditions.
        </Text>
      </View>

      {/* Active Expedition Banner */}
      <Card variant="gradient" gradientColors={nextPalette.gradient} style={styles.nextCard}>
        <View style={styles.nextCardTop}>
          <View style={styles.nextLevelPill}>
            <Text style={styles.nextLevelText}>
              {nextLesson.level} · {nextCity?.name}
            </Text>
          </View>
          <View style={styles.xpChip}>
            <Zap size={13} color="#FEF08A" fill="#FEF08A" />
            <Text style={styles.xpChipText}>+{nextLesson.xpReward} XP</Text>
          </View>
        </View>

        <Text style={[typography.title1, { color: '#FFFFFF' }]}>
          {nextLesson.title}
        </Text>
        <Text style={styles.nextSub} numberOfLines={2}>
          {nextLesson.subtitle}
        </Text>

        <View style={styles.worldMeterRow}>
          <Text style={styles.worldMeterLabel}>
            World Atlas · {player.completedLessonIds.length}/{ALL_LESSONS.length} Stops Cleared
          </Text>
          <ProgressBar
            progress={totalProgress}
            color="#FFFFFF"
            trackColor="rgba(255,255,255,0.28)"
            height={7}
          />
        </View>

        <GameButton
          label="Continue Expedition"
          color="#FFFFFF"
          depthColor="rgba(15, 23, 42, 0.35)"
          textColor={nextPalette.deep}
          icon={<Play size={17} color={nextPalette.deep} fill={nextPalette.deep} />}
          onPress={() => launchLesson(nextLesson.id)}
        />
      </Card>

      {/* CEFR Region Filter Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {LEVEL_FILTERS.map((level) => (
          <Chip
            key={level}
            label={level === 'All' ? 'All Worlds' : `CEFR ${level}`}
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

            {/* 6 Expedition Stages Preview */}
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

            {/* Rewards Bar */}
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
                label={selectedCompleted ? 'Replay Expedition' : 'Launch Expedition'}
                color={RegionPalette[selectedLesson.level].primary}
                depthColor={RegionPalette[selectedLesson.level].deep}
                icon={<Play size={17} color="#FFFFFF" fill="#FFFFFF" />}
                onPress={() => launchLesson(selectedLesson.id)}
              />
            ) : (
              <View style={styles.lockedNotice}>
                <Badge label="Locked Stop" tone="warning" dot />
                <Text style={[typography.callout, { color: colors.textSecondary }]}>
                  Clear the previous stop along the trail to unlock this expedition.
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
  titleBlock: {
    gap: 4,
  },
  nextCard: {
    gap: 12,
  },
  nextCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  nextLevelPill: {
    backgroundColor: 'rgba(15, 23, 42, 0.28)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  nextLevelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  xpChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.34)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  xpChipText: {
    color: '#FEF08A',
    fontSize: 12,
    fontWeight: '800',
  },
  nextSub: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 14,
    lineHeight: 20,
  },
  worldMeterRow: {
    gap: 6,
    marginTop: 2,
  },
  worldMeterLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
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
