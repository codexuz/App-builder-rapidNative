import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, Compass, Lock, MapPin, Play, Star } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { AnimatedPressable, Badge } from '@/components/ui';
import { GeneratedAssets } from '@/constants/GeneratedAssets';
import { RegionPalette, useAppTheme } from '@/constants/Theme';
import type { LessonNode, WorldCity } from '@/types/game';

interface WorldCityMapProps {
  city: WorldCity;
  cityUnlocked: boolean;
  completedLessonIds: string[];
  lessonScores: Record<string, number>;
  isLessonUnlocked: (lessonId: string) => boolean;
  onSelectLesson: (lesson: LessonNode) => void;
}

function PulsingHalo({ color }: { color: string }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(withTiming(1.28, { duration: 1100 }), withTiming(1, { duration: 1100 })),
      -1,
      false
    );
    opacity.value = withRepeat(
      withSequence(withTiming(0.08, { duration: 1100 }), withTiming(0.45, { duration: 1100 })),
      -1,
      false
    );
  }, [opacity, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.pulseRing,
        { borderColor: color, backgroundColor: color },
        animStyle,
      ]}
    />
  );
}

/**
 * Illustrated 2.5D city header paired with a winding SVG expedition trail
 * connecting interactive lesson nodes.
 */
export function WorldCitySection({
  city,
  cityUnlocked,
  completedLessonIds,
  lessonScores,
  isLessonUnlocked,
  onSelectLesson,
}: WorldCityMapProps) {
  const { colors, radii, typography, shadows } = useAppTheme();
  const palette = RegionPalette[city.level];

  const completedCount = city.lessons.filter((l) => completedLessonIds.includes(l.id)).length;
  const nodeOffsets = [-18, 18, -12];

  return (
    <View style={styles.section}>
      {/* Illustrated 2.5D Destination Card */}
      <View
        style={[
          styles.cityBanner,
          shadows.md,
          {
            borderRadius: radii.xl,
            borderColor: cityUnlocked ? palette.primary : colors.border,
            backgroundColor: colors.surface,
          },
        ]}
      >
        <View style={styles.imageWrap}>
          <Image
            source={GeneratedAssets[city.imageKey]}
            style={[styles.cityImage, !cityUnlocked && styles.lockedImage]}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(15,18,32,0.08)', 'rgba(15,18,32,0.84)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.bannerTopRow}>
            <View style={[styles.levelBadge, { backgroundColor: palette.primary }]}>
              <Text style={styles.levelBadgeText}>{city.level}</Text>
            </View>
            <View style={styles.progressPill}>
              <MapPin size={13} color="#FFFFFF" />
              <Text style={styles.progressPillText}>
                {completedCount}/{city.lessons.length} Stops
              </Text>
            </View>
          </View>

          <View style={styles.bannerBottom}>
            <Text style={[typography.title1, { color: '#FFFFFF' }]}>{city.name}</Text>
            <Text style={styles.bannerTagline} numberOfLines={2}>
              {cityUnlocked ? city.tagline : city.unlockRequirementText}
            </Text>
          </View>
        </View>
      </View>

      {/* Winding Expedition Trail + Interactive 3D-Styled Nodes */}
      <View style={styles.trailContainer}>
        <Svg
          width={240}
          height={290}
          viewBox="0 0 240 290"
          style={styles.svgTrail}
          pointerEvents="none"
        >
          <Path
            d="M 52 44 C 52 108, 108 102, 92 152 C 76 202, 58 202, 60 258"
            fill="none"
            stroke={cityUnlocked ? palette.primary : colors.mapTrail}
            strokeWidth={6}
            strokeDasharray={cityUnlocked ? '10 9' : '6 10'}
            strokeLinecap="round"
            opacity={cityUnlocked ? 0.55 : 0.7}
          />
        </Svg>

        {city.lessons.map((lesson, idx) => {
          const completed = completedLessonIds.includes(lesson.id);
          const unlocked = isLessonUnlocked(lesson.id);
          const isActive = unlocked && !completed;
          const score = lessonScores[lesson.id];
          const offsetX = nodeOffsets[idx % nodeOffsets.length];

          const nodeFace = completed
            ? '#F59E0B'
            : isActive
              ? palette.primary
              : colors.surfaceMuted;
          const nodeLip = completed
            ? '#B45309'
            : isActive
              ? palette.deep
              : colors.borderStrong;

          return (
            <View
              key={lesson.id}
              style={[styles.nodeRow, { transform: [{ translateX: offsetX }] }]}
            >
              <View style={styles.nodeWrapper}>
                {isActive ? <PulsingHalo color={palette.primary} /> : null}
                <AnimatedPressable
                  onPress={() => onSelectLesson(lesson)}
                  haptic={unlocked ? 'medium' : 'light'}
                  accessibilityRole="button"
                  accessibilityLabel={`${lesson.title}, ${completed ? 'completed' : unlocked ? 'ready to start' : 'locked'}`}
                  style={[styles.nodeOuter, { backgroundColor: nodeLip }]}
                >
                  <View style={[styles.nodeFace, { backgroundColor: nodeFace }]}>
                    {completed ? (
                      <Check size={26} color="#FFFFFF" strokeWidth={3} />
                    ) : isActive ? (
                      <Play size={24} color="#FFFFFF" fill="#FFFFFF" />
                    ) : (
                      <Lock size={22} color={colors.textTertiary} />
                    )}
                  </View>
                </AnimatedPressable>
              </View>

              <AnimatedPressable
                onPress={() => onSelectLesson(lesson)}
                scaleTo={0.98}
                style={[
                  styles.nodeLabelCard,
                  shadows.sm,
                  {
                    backgroundColor: colors.surface,
                    borderColor: isActive ? palette.primary : colors.border,
                    borderRadius: radii.md,
                  },
                ]}
              >
                <View style={styles.nodeLabelHeader}>
                  <Text
                    style={[
                      typography.callout,
                      { color: unlocked ? colors.textPrimary : colors.textTertiary, flex: 1 },
                    ]}
                    numberOfLines={2}
                  >
                    {lesson.title}
                  </Text>
                  {completed && score !== undefined ? (
                    <View style={styles.scoreBadge}>
                      <Star size={12} color="#D97706" fill="#F59E0B" />
                      <Text style={styles.scoreText}>{score}%</Text>
                    </View>
                  ) : isActive ? (
                    <Badge label="Play" tone="accent" />
                  ) : null}
                </View>
                <View style={styles.nodeMetaRow}>
                  <Compass size={12} color={colors.textTertiary} />
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    {lesson.durationMin} min · +{lesson.xpReward} XP
                  </Text>
                </View>
              </AnimatedPressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 14,
  },
  cityBanner: {
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  imageWrap: {
    height: 174,
    width: '100%',
    justifyContent: 'space-between',
    padding: 14,
  },
  cityImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  lockedImage: {
    opacity: 0.45,
  },
  bannerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  levelBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  progressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 18, 32, 0.58)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  progressPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  bannerBottom: {
    gap: 3,
  },
  bannerTagline: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  trailContainer: {
    position: 'relative',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 22,
  },
  svgTrail: {
    position: 'absolute',
    top: 4,
    alignSelf: 'center',
  },
  nodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    maxWidth: '94%',
  },
  nodeWrapper: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
  },
  nodeOuter: {
    width: 62,
    height: 62,
    borderRadius: 31,
    paddingBottom: 5,
  },
  nodeFace: {
    flex: 1,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeLabelCard: {
    width: 224,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderWidth: 1.25,
    gap: 4,
  },
  nodeLabelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nodeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  scoreText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
});
