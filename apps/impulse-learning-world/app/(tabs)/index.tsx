import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  BookOpen,
  ChevronRight,
  GraduationCap,
  Play,
  RotateCcw,
  Store,
} from 'lucide-react-native';
import { GameButton, GameHud } from '@/components/game';
import { LeoMascot, type LeoPose } from '@/components/mascot/LeoMascot';
import { Screen } from '@/components/ui';
import { DS } from '@/constants/DesignSystem';
import type { Course, CourseLesson } from '@/lib/api/types';
import { useKidsApp } from '@/providers/KidsAppProvider';

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

export default function KidsHomeScreen() {
  const router = useRouter();
  const { courses, gamification, today, dueWords, me, loading, error, refreshAll } = useKidsApp();

  const activeCourses = useMemo(() => courses.filter((c) => !c.practice), [courses]);
  const practiceCourses = useMemo(() => courses.filter((c) => Boolean(c.practice)), [courses]);

  const currentCourse = useMemo(() => {
    const withStats = activeCourses.map((c) => ({ course: c, stats: computeCourseStats(c) }));
    return (
      withStats.find((x) => x.stats.pct < 100 && x.stats.completed > 0) ??
      withStats.find((x) => x.stats.pct < 100) ??
      withStats[0] ??
      null
    );
  }, [activeCourses]);

  // Dynamic Leo greeting matching production erp-lms LeoGreeting
  const leoNote = useMemo<{ pose: LeoPose; title: string; body: string }>(() => {
    const quests = today?.quests ?? [];
    const allDone = quests.length > 0 && quests.every((q) => q.done);
    const streak = gamification?.streak?.currentStreak ?? 0;
    const activeToday = gamification?.streak?.activeToday ?? false;
    const hour = new Date().getHours();

    if (allDone) {
      return {
        pose: 'cheer',
        title: 'All daily quests complete!',
        body: 'Open your treasure chest in Quests to claim your coins.',
      };
    }
    if (streak > 0 && !activeToday) {
      return {
        pose: 'oops',
        title: `Protect your ${streak}-day streak`,
        body: 'Finish one quick lesson today to keep your flame alive.',
      };
    }
    if (hour >= 22 || hour < 6) {
      return {
        pose: 'sleep',
        title: 'Late-night study session',
        body: 'Do a short review and get plenty of rest.',
      };
    }
    if (streak > 0 && activeToday) {
      return {
        pose: 'idle',
        title: `Great job today, ${me?.firstName ?? 'Explorer'}!`,
        body: `Your ${streak}-day streak is safe. Ready for the next lesson?`,
      };
    }
    return {
      pose: 'wave',
      title: `Ready to learn, ${me?.firstName ?? 'Explorer'}?`,
      body: 'Pick up right where you left off with Leo.',
    };
  }, [gamification, me, today]);

  const coins = gamification?.wallet?.cachedCoinBalance ?? today?.coins ?? 0;
  const dueCount = dueWords?.counts.due ?? 0;

  return (
    <Screen hasTabBar refreshing={loading} onRefresh={() => void refreshAll()}>
      <GameHud onAvatarPress={() => router.push('/(tabs)/profile')} />

      {error ? (
        <View style={[DS.card, styles.stateCard]}>
          <LeoMascot pose="oops" size={76} />
          <Text style={DS.type.cardTitle}>Could not load courses</Text>
          <Text style={[DS.type.caption, { textAlign: 'center' }]}>{error}</Text>
          <View style={{ width: 180, marginTop: 4 }}>
            <GameButton
              label="Try Again"
              size="md"
              color={DS.colors.brand}
              depthColor={DS.colors.brandDeep}
              onPress={() => void refreshAll()}
            />
          </View>
        </View>
      ) : null}

      {/* Clean Leo Daily Check-In Card (mirrors production LeoGreeting) */}
      <View style={[DS.card, styles.leoCard]}>
        <View style={styles.leoStage}>
          <LeoMascot pose={leoNote.pose} size={64} />
        </View>
        <View style={styles.leoCopy}>
          <Text style={DS.type.cardTitle} numberOfLines={1}>
            {leoNote.title}
          </Text>
          <Text style={DS.type.caption} numberOfLines={2}>
            {leoNote.body}
          </Text>
        </View>
      </View>

      {/* Primary Focus Card: Current Enrolled Course + Tactile 3D CTA */}
      {currentCourse ? (
        <LinearGradient
          colors={['#2563EB', '#1055F8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroHeader}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.heroMeta} numberOfLines={1}>
                {currentCourse.course.level?.name ?? currentCourse.course.title}
              </Text>
              <Text style={styles.heroTitle} numberOfLines={2}>
                {currentCourse.stats.nextLesson?.title ?? currentCourse.course.title}
              </Text>
            </View>
            <View style={styles.heroPctBadge}>
              <Text style={styles.heroPctText}>{currentCourse.stats.pct}%</Text>
            </View>
          </View>

          <View style={styles.heroProgressWrap}>
            <View style={styles.heroTrack}>
              <View style={[styles.heroFill, { width: `${currentCourse.stats.pct}%` }]} />
            </View>
            <Text style={styles.heroCount}>
              {currentCourse.stats.completed}/{currentCourse.stats.total} lessons
            </Text>
          </View>

          <GameButton
            label={
              currentCourse.stats.nextLesson
                ? currentCourse.course.lessonRewardCoins > 0
                  ? `Play Next Lesson  ·  +${currentCourse.course.lessonRewardCoins} Coins`
                  : 'Play Next Lesson'
                : 'Open Course Path'
            }
            color={DS.colors.green}
            depthColor={DS.colors.greenDeep}
            icon={<Play size={16} color="#FFFFFF" fill="#FFFFFF" />}
            onPress={() => {
              if (currentCourse.stats.nextLesson) {
                router.push(`/lesson/${currentCourse.stats.nextLesson.id}` as never);
              } else {
                router.push(`/course/${currentCourse.course.id}` as never);
              }
            }}
          />
        </LinearGradient>
      ) : loading ? (
        <View style={[DS.card, styles.stateCard]}>
          <LeoMascot pose="think" size={80} />
          <Text style={DS.type.cardTitle}>Loading your courses...</Text>
        </View>
      ) : (
        <View style={[DS.card, styles.stateCard]}>
          <LeoMascot pose="wave" size={80} />
          <Text style={DS.type.cardTitle}>No enrolled courses yet</Text>
          <Text style={[DS.type.caption, { textAlign: 'center', maxWidth: 260 }]}>
            Once your teacher adds you to an Impulse group, your lessons will appear here.
          </Text>
        </View>
      )}

      {/* Uniform 2-Column Quick Actions (Word Cards & Coin Shop — no mismatched borders) */}
      <View style={styles.quickRow}>
        <Pressable
          onPress={() => router.push('/words' as never)}
          style={[DS.card, styles.quickTile]}
        >
          <View style={[styles.iconSquare, { backgroundColor: DS.colors.brandSoft }]}>
            <BookOpen size={20} color={DS.colors.brand} />
          </View>
          <View style={styles.quickCopy}>
            <Text style={DS.type.cardTitle} numberOfLines={1}>
              Word Cards
            </Text>
            <Text style={DS.type.caption} numberOfLines={1}>
              {dueCount > 0 ? `${dueCount} due today` : 'All reviewed'}
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => router.push('/shop' as never)}
          style={[DS.card, styles.quickTile]}
        >
          <View style={[styles.iconSquare, { backgroundColor: DS.colors.amberSoft }]}>
            <Store size={20} color={DS.colors.amberDeep} />
          </View>
          <View style={styles.quickCopy}>
            <Text style={DS.type.cardTitle} numberOfLines={1}>
              Coin Shop
            </Text>
            <Text style={DS.type.caption} numberOfLines={1}>
              {coins} coins
            </Text>
          </View>
        </Pressable>
      </View>

      {/* Enrolled Courses Section */}
      {activeCourses.length > 0 ? (
        <View style={styles.section}>
          <Text style={DS.type.sectionTitle}>My Courses</Text>
          <View style={styles.courseStack}>
            {activeCourses.map((course) => {
              const stats = computeCourseStats(course);
              return (
                <Pressable
                  key={course.id}
                  onPress={() => router.push(`/course/${course.id}` as never)}
                  style={[DS.card, styles.courseRow]}
                >
                  <View style={[styles.courseIcon, { backgroundColor: DS.colors.brandSoft }]}>
                    <GraduationCap size={22} color={DS.colors.brand} />
                  </View>
                  <View style={styles.courseBody}>
                    <View style={styles.courseTitleLine}>
                      <Text style={[DS.type.cardTitle, { flex: 1 }]} numberOfLines={1}>
                        {course.title}
                      </Text>
                      <ChevronRight size={18} color={DS.colors.inkSubtle} />
                    </View>
                    <Text style={DS.type.caption} numberOfLines={1}>
                      {course.level?.name ? `${course.level.name} · ` : ''}
                      {stats.completed} of {stats.total} lessons completed
                    </Text>
                    <View style={styles.courseBarRow}>
                      <View style={styles.courseTrack}>
                        <View style={[styles.courseFill, { width: `${stats.pct}%` }]} />
                      </View>
                      <Text style={styles.coursePct}>{stats.pct}%</Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {/* Earlier-Level Practice (grouped inside one clean white card) */}
      {practiceCourses.length > 0 ? (
        <View style={styles.section}>
          <Text style={DS.type.sectionTitle}>Earlier Levels</Text>
          <View style={[DS.card, styles.groupedCard]}>
            {practiceCourses.map((course, idx) => {
              const stats = computeCourseStats(course);
              return (
                <Pressable
                  key={course.id}
                  onPress={() => router.push(`/course/${course.id}` as never)}
                  style={[
                    styles.practiceRow,
                    idx > 0 ? styles.rowDivider : null,
                  ]}
                >
                  <View style={[styles.iconSquare, { backgroundColor: DS.colors.surfaceSubtle }]}>
                    <RotateCcw size={18} color={DS.colors.inkSecondary} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={DS.type.cardTitle} numberOfLines={1}>
                      {course.title}
                    </Text>
                    <Text style={DS.type.caption} numberOfLines={1}>
                      {stats.completed}/{stats.total} lessons · Open practice
                    </Text>
                  </View>
                  <ChevronRight size={18} color={DS.colors.inkSubtle} />
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stateCard: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  leoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  leoStage: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: DS.colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leoCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  heroCard: {
    borderRadius: 22,
    padding: 18,
    gap: 16,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  heroMeta: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12.5,
    fontWeight: '700',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  heroPctBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  heroPctText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  heroProgressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.28)',
    overflow: 'hidden',
  },
  heroFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  heroCount: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  quickRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickTile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    gap: 10,
    minWidth: 0,
  },
  iconSquare: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickCopy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  section: {
    gap: 10,
    marginTop: 4,
  },
  courseStack: {
    gap: 10,
  },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  courseIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseBody: {
    flex: 1,
    gap: 5,
    minWidth: 0,
  },
  courseTitleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  courseBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  courseTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: DS.colors.surfaceSubtle,
    overflow: 'hidden',
  },
  courseFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: DS.colors.brand,
  },
  coursePct: {
    fontSize: 12,
    fontWeight: '700',
    color: DS.colors.inkSecondary,
    fontVariant: ['tabular-nums'],
  },
  groupedCard: {
    overflow: 'hidden',
  },
  practiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: DS.colors.border,
  },
});
