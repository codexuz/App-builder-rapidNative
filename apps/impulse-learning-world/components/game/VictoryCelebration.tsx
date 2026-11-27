import React, { useEffect } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';
import { LeoMascot } from '@/components/mascot/LeoMascot';
import { AnimatedCounter, Card, StaggeredEntrance } from '@/components/ui';
import { GeneratedAssets } from '@/constants/GeneratedAssets';
import { useAppTheme } from '@/constants/Theme';
import { ConfettiBurst } from './ConfettiBurst';
import { GameButton } from './GameButton';
import { Coin3D, Star3D, Target3D, XpBolt3D } from './GameIcons3D';
import { ProgressBar } from './ProgressBar';

export interface VictorySummaryData {
  accuracyPercent: number;
  xpEarned: number;
  coinsEarned: number;
  streakDays: number;
  unlockedNextLessonTitle?: string | null;
}

export interface VictoryCelebrationProps {
  lessonTitle: string;
  courseName: string;
  completedCount: number;
  totalCount: number;
  summary: VictorySummaryData;
  accentColor: string;
  deepColor: string;
  confettiKey: number;
  onClaimAndExit: () => void;
  onPracticeAgain: () => void;
}

function SunburstBackdrop() {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 22000, easing: Easing.linear }),
      -1,
      false
    );
  }, [rotation]);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const rays = Array.from({ length: 12 }, (_, idx) => {
    const startDeg = idx * 30;
    const endDeg = startDeg + 14;
    const r = 118;
    const cx = 120;
    const cy = 120;
    const a1 = (startDeg * Math.PI) / 180;
    const a2 = (endDeg * Math.PI) / 180;
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2);
    const y2 = cy + r * Math.sin(a2);
    return `M ${cx} ${cy} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`;
  });

  return (
    <View pointerEvents="none" style={styles.sunburstWrap}>
      <Animated.View style={[styles.sunburstSpinner, spinStyle]}>
        <Svg width={240} height={240} viewBox="0 0 240 240">
          <Defs>
            <RadialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FDE047" stopOpacity="0.65" />
              <Stop offset="55%" stopColor="#FACC15" stopOpacity="0.24" />
              <Stop offset="100%" stopColor="#FACC15" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx="120" cy="120" r="115" fill="url(#sunGlow)" />
          {rays.map((d, i) => (
            <Path key={i} d={d} fill="#FDE047" opacity={0.22} />
          ))}
        </Svg>
      </Animated.View>
    </View>
  );
}

function PoppingStar({
  filled,
  size,
  delayMs,
  tiltDeg,
  liftY = 0,
}: {
  filled: boolean;
  size: number;
  delayMs: number;
  tiltDeg: number;
  liftY?: number;
}) {
  const scale = useSharedValue(0.2);

  useEffect(() => {
    scale.value = withDelay(
      delayMs,
      withSpring(1, { damping: 9, stiffness: 190, mass: 0.7 })
    );
  }, [delayMs, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: liftY }, { rotate: `${tiltDeg}deg` }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <Star3D size={size} filled={filled} />
    </Animated.View>
  );
}

/**
 * Duolingo-style Impulse Kids Victory Celebration featuring Leo cheering beside
 * the Golden Treasure Chest, 3-Star mastery arc, sunburst, and 3D SVG reward cards
 * matching real erp-lms rewards (XP, Coins, Streak).
 */
export function VictoryCelebration({
  lessonTitle,
  courseName,
  completedCount,
  totalCount,
  summary,
  accentColor,
  deepColor,
  confettiKey,
  onClaimAndExit,
  onPracticeAgain,
}: VictoryCelebrationProps) {
  const { colors, typography, radii } = useAppTheme();

  const starsEarned =
    summary.accuracyPercent >= 90 ? 3 : summary.accuracyPercent >= 75 ? 2 : 1;

  const accuracyLabel =
    summary.accuracyPercent >= 95
      ? 'PERFECT'
      : summary.accuracyPercent >= 80
        ? 'AMAZING'
        : 'GREAT JOB';

  const progressRatio = Math.min(1, completedCount / Math.max(1, totalCount));

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ConfettiBurst triggerKey={confettiKey} intensity="grand" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stageContainer}>
          <SunburstBackdrop />

          <View style={styles.starsArc}>
            <PoppingStar filled={starsEarned >= 1} size={44} delayMs={80} tiltDeg={-14} liftY={8} />
            <PoppingStar filled={starsEarned >= 2} size={58} delayMs={180} tiltDeg={0} liftY={-4} />
            <PoppingStar filled={starsEarned >= 3} size={44} delayMs={280} tiltDeg={14} liftY={8} />
          </View>

          <View style={styles.heroPair}>
            <LeoMascot pose="cheer" size={116} style={styles.heroLeo} />
            <Image
              source={GeneratedAssets.treasureChest}
              style={styles.heroChest}
              resizeMode="contain"
            />
          </View>
        </View>

        <StaggeredEntrance index={0}>
          <View style={styles.headlineBlock}>
            <View style={[styles.accuracyPill, { backgroundColor: '#D7FFB8', borderColor: '#58CC02' }]}>
              <Target3D size={20} />
              <Text style={styles.accuracyPillText}>
                {accuracyLabel} · {summary.accuracyPercent}% ACCURACY
              </Text>
            </View>

            <Text style={[typography.display, styles.headlineText, { color: colors.textPrimary }]}>
              Lesson Complete!
            </Text>
            <Text style={[typography.body, styles.subText, { color: colors.textSecondary }]}>
              Leo is so proud! You cleared "{lessonTitle}"!
            </Text>
          </View>
        </StaggeredEntrance>

        {/* Duolingo-Style Tactile Colored Reward Cards (XP, Coins, Accuracy) */}
        <StaggeredEntrance index={1}>
          <View style={styles.rewardRow}>
            <View style={[styles.duoCard, { backgroundColor: '#58CC02', borderColor: '#46A302', borderRadius: radii.lg }]}>
              <Text style={styles.duoCardHeader}>TOTAL XP</Text>
              <View style={[styles.duoCardInner, { borderRadius: radii.md }]}>
                <XpBolt3D size={32} />
                <AnimatedCounter
                  value={summary.xpEarned}
                  prefix="+"
                  style={[styles.duoCardValue, { color: '#3B8700' }]}
                />
              </View>
            </View>

            <View style={[styles.duoCard, { backgroundColor: '#F59E0B', borderColor: '#D97706', borderRadius: radii.lg }]}>
              <Text style={styles.duoCardHeader}>COINS</Text>
              <View style={[styles.duoCardInner, { borderRadius: radii.md }]}>
                <Coin3D size={32} />
                <AnimatedCounter
                  value={summary.coinsEarned}
                  prefix="+"
                  style={[styles.duoCardValue, { color: '#B45309' }]}
                />
              </View>
            </View>

            <View style={[styles.duoCard, { backgroundColor: '#1055F8', borderColor: '#0A3BB3', borderRadius: radii.lg }]}>
              <Text style={styles.duoCardHeader}>SCORE</Text>
              <View style={[styles.duoCardInner, { borderRadius: radii.md }]}>
                <Target3D size={32} />
                <AnimatedCounter
                  value={summary.accuracyPercent}
                  suffix="%"
                  style={[styles.duoCardValue, { color: '#1055F8' }]}
                />
              </View>
            </View>
          </View>
        </StaggeredEntrance>

        {/* Course Progress + Next Stop Unlock Card */}
        <StaggeredEntrance index={2}>
          <Card style={styles.progressCard}>
            <View style={styles.cityHeaderRow}>
              <Text style={[typography.headline, { color: colors.textPrimary, flex: 1 }]} numberOfLines={1}>
                {courseName}
              </Text>
              <Text style={[typography.callout, { color: accentColor }]}>
                {completedCount}/{totalCount} Done
              </Text>
            </View>
            <ProgressBar progress={progressRatio} color={accentColor} height={13} />

            {summary.unlockedNextLessonTitle ? (
              <View style={[styles.unlockBanner, { backgroundColor: colors.accentMuted, borderRadius: radii.md }]}>
                <Star3D size={24} filled />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.unlockKicker, { color: accentColor }]}>
                    NEXT LESSON UNLOCKED
                  </Text>
                  <Text style={[typography.callout, { color: colors.textPrimary }]} numberOfLines={1}>
                    {summary.unlockedNextLessonTitle}
                  </Text>
                </View>
              </View>
            ) : null}
          </Card>
        </StaggeredEntrance>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <GameButton
          label="CLAIM REWARDS"
          color="#58CC02"
          depthColor="#46A302"
          onPress={onClaimAndExit}
        />
        <Pressable onPress={onPracticeAgain} style={styles.replayBtn} hitSlop={8}>
          <Text style={[typography.callout, { color: deepColor }]}>
            Practice This Lesson Again
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 18,
  },
  stageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    paddingBottom: 4,
    position: 'relative',
  },
  sunburstWrap: {
    position: 'absolute',
    top: -12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunburstSpinner: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starsArc: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
    marginBottom: -4,
    zIndex: 2,
  },
  heroPair: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginTop: 4,
    zIndex: 2,
  },
  heroLeo: {
    marginRight: -16,
  },
  heroChest: {
    width: 112,
    height: 112,
    marginLeft: -4,
  },
  headlineBlock: {
    alignItems: 'center',
    gap: 6,
  },
  accuracyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  accuracyPillText: {
    color: '#3B8700',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  headlineText: {
    textAlign: 'center',
    fontSize: 30,
    fontWeight: '900',
  },
  subText: {
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  rewardRow: {
    flexDirection: 'row',
    gap: 10,
  },
  duoCard: {
    flex: 1,
    padding: 3,
    paddingTop: 6,
    borderWidth: 2,
    borderBottomWidth: 5,
    gap: 5,
  },
  duoCardHeader: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  duoCardInner: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 11,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  duoCardValue: {
    fontSize: 20,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  progressCard: {
    gap: 12,
  },
  cityHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  unlockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
  },
  unlockKicker: {
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  footer: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  replayBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
});
