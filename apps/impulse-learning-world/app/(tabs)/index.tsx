import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  BookOpen,
  ChevronRight,
  Flame,
  Gift,
  Play,
  Sparkles,
  Store,
} from 'lucide-react-native';
import { Coin3D, GameButton, GameHud, ProgressBar, XpBolt3D } from '@/components/game';
import { LeoMascot, type LeoPose } from '@/components/mascot/LeoMascot';
import {
  AnimatedPressable,
  Badge,
  Card,
  ProgressRing,
  Screen,
  SectionHeader,
  StaggeredEntrance,
} from '@/components/ui';
import { useAppTheme } from '@/constants/Theme';
import type { Course, CourseLesson } from '@/lib/api/types';
import { useKidsApp } from '@/providers/KidsAppProvider';

const COURSE_GRADIENTS: Array<[string, string]> = [
  ['#1055F8', '#0EA5E9'],
  ['#7C3AED', '#EC4899'],
  ['#059669', '#10B981'],
  ['#F59E0B', '#EA580C'],
];

function computeCourseStats(course: Course) {
  const allLessons: CourseLesson[] = course.units.flatMap((u) => u.lessons);
  const completed = allLessons.filter((l) => l.progress?.status === 'COMPLETED').length;
  const total = allLessons.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const nextLesson =
    allLessons.find((l) => l.progress?.status !== 'COMPLETED' && l.open !== false) ??
    allLessons[0] ??
    null;
  return { completed, total, pct, nextLesson };
}

function pickCourseGradient(course: Course, index: number): [string, string] {
  const tag = `${course.level?.code ?? ''} ${course.level?.name ?? ''} ${course.title}`.toLowerCase();
  if (/starter|kids 1|a1/.test(tag)) return ['#1055F8', '#0EA5E9'];
  if (/mover|kids 2|a2/.test(tag)) return ['#7C3AED', '#A855F7'];
  if (/flyer|kids 3|b1/.test(tag)) return ['#059669', '#10B981'];
  return COURSE_GRADIENTS[index % COURSE_GRADIENTS.length];
}

export default function KidsHomeScreen() {
  const router = useRouter();
  const { colors, typography, radii } = useAppTheme();
  const { courses, gamification, today, dueWords, me, loading, error, refreshAll } = useKidsApp();

  // Mirrors production apps/student: active enrolled courses vs earlier-level practice
  const activeCourses = useMemo(
    () => courses.filter((c) => !c.practice),
    [courses]
  );
  const practiceCourses = useMemo(
    () => courses.filter((c) => Boolean(c.practice)),
    [courses]
  );

  // Pick current course just like apps/student/lib/lms.ts currentCourse()
  const currentCourse = useMemo(() => {
    const withStats = activeCourses.map((c) => ({ course: c, stats: computeCourseStats(c) }));
    return (
      withStats.find((x) => x.stats.pct < 100 && x.stats.completed > 0) ??
      withStats.find((x) => x.stats.pct < 100) ??
      withStats[0] ??
      null
    );
  }, [activeCourses]);

  // Dynamic Leo greeting pose matching production apps/student/components/home/leo-greeting.tsx
  const leoGreeting = useMemo<{ pose: LeoPose; line: string }>(() => {
    const quests = today?.quests ?? [];
    const allDone = quests.length > 0 && quests.every((q) => q.done);
    const streak = gamification?.streak?.currentStreak ?? 0;
    const activeToday = gamification?.streak?.activeToday ?? false;
    const hour = new Date().getHours();

    if (allDone) {
      return { pose: 'cheer', line: 'All daily quests done! You are a superstar!' };
    }
    if (streak > 0 && !activeToday) {
      return { pose: 'oops', line: `Play 1 quick lesson to protect your ${streak}-day streak!` };
    }
    if (hour >= 22 || hour < 6) {
      return { pose: 'sleep', line: 'Cozy night learning! Ready for a tiny warm-up?' };
    }
    if (streak > 0 && activeToday) {
      return { pose: 'idle', line: 'Your streak is glowing! Let’s unlock the next lesson.' };
    }
    return {
      pose: 'wave',
      line: `Hi ${me?.firstName ?? 'friend'}! Tap a lesson to play with Leo!`,
    };
  }, [gamification, me, today]);

  const streakDays = gamification?.streak?.currentStreak ?? 0;
  const coins = gamification?.wallet?.cachedCoinBalance ?? today?.coins ?? 0;
  const xpToday = today?.xpToday ?? 0;
  const dueCount = dueWords?.counts.due ?? 0;

  return (
    <Screen hasTabBar>
      <GameHud onAvatarPress={() => router.push('/(tabs)/profile')} />

      {error ? (
        <Card variant="muted" style={styles.emptyCard}>
          <LeoMascot pose="oops" size={84} />
          <Text style={[typography.headline, { color: colors.textPrimary, textAlign: 'center' }]}>
            Could Not Load Courses
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary, textAlign: 'center' }]}>
            {error}
          </Text>
          <View style={{ width: '100%', maxWidth: 220 }}>
            <GameButton
              label="Retry"
              size="md"
              color="#1055F8"
              depthColor="#0A3BB3"
              onPress={() => void refreshAll()}
            />
          </View>
        </Card>
      ) : null}

      {/* Hero Active Course + Dynamic Leo Greeting Card */}
      {currentCourse ? (
        <StaggeredEntrance index={0}>
          <Card
            variant="gradient"
            gradientColors={pickCourseGradient(currentCourse.course, 0)}
            style={styles.heroCard}
          >
            <View style={styles.heroTopRow}>
              <View style={styles.mascotRow}>
                <LeoMascot pose={leoGreeting.pose} size={86} style={styles.leoHero} />
                <View style={styles.heroTitleCol}>
                  <View style={styles.levelPill}>
                    <Text style={styles.levelPillText}>
                      {currentCourse.course.level?.name ?? 'Enrolled Course'}
                    </Text>
                  </View>
                  <Text style={[typography.title1, { color: '#FFFFFF' }]} numberOfLines={2}>
                    {currentCourse.stats.nextLesson?.title ?? currentCourse.course.title}
                  </Text>
                </View>
              </View>

              <ProgressRing
                progress={currentCourse.stats.pct / 100}
                size={64}
                strokeWidth={7}
                color="#FDE047"
                trackColor="rgba(255,255,255,0.26)"
              >
                <Text style={styles.ringText}>
                  {currentCourse.stats.completed}/{currentCourse.stats.total}
                </Text>
              </ProgressRing>
            </View>

            <Text style={styles.heroSub} numberOfLines={2}>
              Leo says: "{leoGreeting.line}"
            </Text>

            <GameButton
              label={
                currentCourse.stats.nextLesson
                  ? currentCourse.course.lessonRewardCoins > 0
                    ? `Play Next Lesson (+${currentCourse.course.lessonRewardCoins} Coins)`
                    : 'Play Next Lesson'
                  : 'Open Course Roadmap'
              }
              color="#FFFFFF"
              depthColor="rgba(15, 23, 42, 0.35)"
              textColor="#0A3BB3"
              icon={<Play size={17} color="#0A3BB3" fill="#0A3BB3" />}
              onPress={() => {
                if (currentCourse.stats.nextLesson) {
                  router.push(`/lesson/${currentCourse.stats.nextLesson.id}` as never);
                } else {
                  router.push(`/course/${currentCourse.course.id}` as never);
                }
              }}
            />
          </Card>
        </StaggeredEntrance>
      ) : loading ? (
        <Card style={styles.emptyCard}>
          <LeoMascot pose="think" size={92} />
          <Text style={[typography.headline, { color: colors.textPrimary, textAlign: 'center' }]}>
            Loading Your Impulse Courses...
          </Text>
        </Card>
      ) : (
        <Card style={styles.emptyCard}>
          <LeoMascot pose="wave" size={96} />
          <Text style={[typography.title2, { color: colors.textPrimary, textAlign: 'center' }]}>
            No Enrolled Courses Yet
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>
            Once your teacher enrolls you in an Impulse Kids group, your courses will appear right here!
          </Text>
        </Card>
      )}

      {/* 3-Column Glossy Pastel Stat Bubbles */}
      <StaggeredEntrance index={1}>
        <View style={styles.pastelStatsRow}>
          <View style={[styles.pastelBubble, { backgroundColor: colors.xpMuted, borderRadius: radii.lg }]}>
            <XpBolt3D size={28} />
            <Text style={[styles.bubbleValue, { color: colors.textPrimary }]}>+{xpToday}</Text>
            <Text style={[styles.bubbleLabel, { color: colors.textSecondary }]}>XP Today</Text>
          </View>

          <View style={[styles.pastelBubble, { backgroundColor: colors.streakMuted, borderRadius: radii.lg }]}>
            <View style={[styles.bubbleIcon, { backgroundColor: colors.streak }]}>
              <Flame size={16} color="#FFFFFF" fill="#FFFFFF" />
            </View>
            <Text style={[styles.bubbleValue, { color: colors.textPrimary }]}>{streakDays}d</Text>
            <Text style={[styles.bubbleLabel, { color: colors.textSecondary }]}>Streak</Text>
          </View>

          <View style={[styles.pastelBubble, { backgroundColor: colors.coinMuted, borderRadius: radii.lg }]}>
            <Coin3D size={28} />
            <Text style={[styles.bubbleValue, { color: colors.textPrimary }]}>{coins}</Text>
            <Text style={[styles.bubbleLabel, { color: colors.textSecondary }]}>Coins</Text>
          </View>
        </View>
      </StaggeredEntrance>

      {/* Quick Kids Practice Shortcuts (Words & Coin Shop — no extra speaking course) */}
      <StaggeredEntrance index={2}>
        <View style={styles.shortcutsRow}>
          <AnimatedPressable
            onPress={() => router.push('/words' as never)}
            containerStyle={{ flex: 1, minWidth: 0 }}
            style={[
              styles.shortcutCard,
              {
                backgroundColor: colors.surface,
                borderColor: '#BFDBFE',
                borderBottomColor: '#60A5FA',
              },
            ]}
          >
            <View style={[styles.shortcutIcon, { backgroundColor: '#DBEAFE' }]}>
              <BookOpen size={20} color="#1055F8" />
            </View>
            <View style={styles.shortcutText}>
              <Text style={[typography.headline, { color: colors.textPrimary }]}>Word Cards</Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                {dueCount > 0 ? `${dueCount} words to review` : 'All caught up!'}
              </Text>
            </View>
          </AnimatedPressable>

          <AnimatedPressable
            onPress={() => router.push('/shop' as never)}
            containerStyle={{ flex: 1, minWidth: 0 }}
            style={[
              styles.shortcutCard,
              {
                backgroundColor: colors.surface,
                borderColor: '#FDE68A',
                borderBottomColor: '#F59E0B',
              },
            ]}
          >
            <View style={[styles.shortcutIcon, { backgroundColor: '#FEF3C7' }]}>
              <Store size={20} color="#D97706" />
            </View>
            <View style={styles.shortcutText}>
              <Text style={[typography.headline, { color: colors.textPrimary }]}>Coin Shop</Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                Spend {coins} Coins
              </Text>
            </View>
          </AnimatedPressable>
        </View>
      </StaggeredEntrance>

      {/* Enrolled Courses List (fetched from student's enrollments via /lms/courses) */}
      <SectionHeader
        title="My Courses"
        subtitle="Tap a course to explore units & lessons"
      />

      <View style={styles.courseList}>
        {activeCourses.map((course, idx) => {
          const stats = computeCourseStats(course);
          const grad = pickCourseGradient(course, idx);
          return (
            <StaggeredEntrance key={course.id} index={idx + 3}>
              <AnimatedPressable
                onPress={() => router.push(`/course/${course.id}` as never)}
                style={[
                  styles.courseCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderRadius: radii.xl,
                  },
                ]}
              >
                <View style={styles.courseTop}>
                  <View style={[styles.courseBadge, { backgroundColor: grad[0] }]}>
                    <Sparkles size={15} color="#FFFFFF" />
                    <Text style={styles.courseBadgeText}>
                      {course.level?.name ?? course.subject ?? 'Course'}
                    </Text>
                  </View>

                  {course.lessonRewardCoins > 0 ? (
                    <View style={[styles.coinTag, { backgroundColor: colors.coinMuted }]}>
                      <Coin3D size={15} />
                      <Text style={styles.coinTagText}>+{course.lessonRewardCoins}/lesson</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.courseMid}>
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text style={[typography.title2, { color: colors.textPrimary }]}>
                      {course.title}
                    </Text>
                    {course.description ? (
                      <Text
                        style={[typography.caption, { color: colors.textSecondary }]}
                        numberOfLines={2}
                      >
                        {course.description}
                      </Text>
                    ) : null}
                  </View>
                  <ChevronRight size={20} color={colors.textTertiary} />
                </View>

                <View style={styles.courseProgressRow}>
                  <ProgressBar
                    progress={stats.pct / 100}
                    color={grad[0]}
                    secondaryColor={grad[1]}
                    height={11}
                    style={{ flex: 1 }}
                  />
                  <Text style={[styles.pctText, { color: grad[0] }]}>
                    {stats.completed}/{stats.total}
                  </Text>
                </View>
              </AnimatedPressable>
            </StaggeredEntrance>
          );
        })}
      </View>

      {/* Practice Earlier Levels (course.practice === true — matches production apps/student) */}
      {practiceCourses.length > 0 ? (
        <>
          <SectionHeader
            title="Practice Earlier Levels"
            subtitle="Open anytime for extra review"
          />
          <View style={styles.courseList}>
            {practiceCourses.map((course) => {
              const stats = computeCourseStats(course);
              return (
                <AnimatedPressable
                  key={course.id}
                  onPress={() => router.push(`/course/${course.id}` as never)}
                  style={[
                    styles.practiceCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderRadius: radii.lg,
                    },
                  ]}
                >
                  <View style={[styles.practiceIcon, { backgroundColor: '#EDE9FE' }]}>
                    <Gift size={18} color="#7C3AED" />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[typography.headline, { color: colors.textPrimary }]}>
                      {course.title}
                    </Text>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      {stats.completed}/{stats.total} lessons · Free practice
                    </Text>
                  </View>
                  <Badge label="Open" tone="accent" />
                </AnimatedPressable>
              );
            })}
          </View>
        </>
      ) : null}
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
    gap: 8,
  },
  mascotRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  leoHero: {
    marginLeft: -6,
  },
  heroTitleCol: {
    flex: 1,
    gap: 5,
  },
  levelPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(15, 23, 42, 0.25)',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
  },
  levelPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  ringText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  heroSub: {
    color: 'rgba(255,255,255,0.94)',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  emptyCard: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 24,
  },
  pastelStatsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pastelBubble: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 5,
  },
  bubbleIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleValue: {
    fontSize: 19,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  bubbleLabel: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  shortcutsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  shortcutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1.75,
    borderBottomWidth: 4,
  },
  shortcutIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  courseList: {
    gap: 12,
  },
  courseCard: {
    padding: 16,
    borderWidth: 1.5,
    borderBottomWidth: 4,
    gap: 12,
  },
  courseTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  courseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  courseBadgeText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  coinTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  coinTagText: {
    color: '#B45309',
    fontSize: 11.5,
    fontWeight: '800',
  },
  courseMid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  courseProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pctText: {
    fontSize: 12.5,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  practiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 13,
    borderWidth: 1.5,
  },
  practiceIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
