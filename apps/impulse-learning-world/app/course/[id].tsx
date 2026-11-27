import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Check, Clock, Lock, Play } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Coin3D, ProgressBar, Star3D } from '@/components/game';
import { LeoMascot } from '@/components/mascot/LeoMascot';
import { AnimatedPressable, Badge, Card } from '@/components/ui';
import { useAppTheme } from '@/constants/Theme';
import type { Course, CourseLesson } from '@/lib/api/types';
import { useKidsApp } from '@/providers/KidsAppProvider';

const UNIT_GRADIENTS: Array<[string, string]> = [
  ['#1055F8', '#0EA5E9'],
  ['#7C3AED', '#A855F7'],
  ['#059669', '#10B981'],
  ['#F59E0B', '#EA580C'],
];

function lockText(lesson: CourseLesson): string {
  if (!lesson.lock) return 'Locked';
  if (lesson.lock.reason === 'PREVIOUS_NOT_DONE') {
    return `Finish "${lesson.lock.previousTitle}" first`;
  }
  if (lesson.lock.reason === 'NOT_IN_CLASS_YET') {
    return 'Opens after class';
  }
  return 'Opens soon';
}

/**
 * Production-matched Zigzag Unit & Lesson Roadmap (mirrors apps/student/app/(course)/roadmap.tsx)
 * reimagined for kids 5–13 with Leo cheering beside each unit and chunky 3D lesson nodes.
 */
export default function CourseRoadmapScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { colors, typography, radii } = useAppTheme();
  const { courses, loadCourseDetail } = useKidsApp();

  const courseId = typeof params.id === 'string' ? params.id : '';
  const [course, setCourse] = useState<Course | null>(
    () => courses.find((c) => c.id === courseId) ?? null
  );
  const [loading, setLoading] = useState(!course);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!courseId) {
      setLoading(false);
      return;
    }
    setError(null);
    loadCourseDetail(courseId)
      .then((detail) => {
        if (!active) return;
        if (detail) setCourse(detail);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Could not load course.');
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [courseId, loadCourseDetail]);

  const allLessons = course?.units.flatMap((u) => u.lessons) ?? [];
  const completedCount = allLessons.filter((l) => l.progress?.status === 'COMPLETED').length;
  const pct = allLessons.length > 0 ? completedCount / allLessons.length : 0;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={[styles.backBtn, { backgroundColor: colors.surfaceMuted }]}
        >
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[typography.headline, { color: colors.textPrimary }]} numberOfLines={1}>
            {course?.title ?? 'Course Roadmap'}
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            {completedCount}/{allLessons.length} lessons completed
          </Text>
        </View>
        {course?.lessonRewardCoins ? (
          <View style={[styles.coinPill, { backgroundColor: colors.coinMuted }]}>
            <Coin3D size={16} />
            <Text style={styles.coinText}>+{course.lessonRewardCoins}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.progressBarWrap}>
        <ProgressBar progress={pct} color="#1055F8" height={12} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {loading ? (
          <Card style={{ alignItems: 'center', gap: 10, paddingVertical: 28 }}>
            <LeoMascot pose="think" size={88} />
            <Text style={[typography.callout, { color: colors.textSecondary }]}>
              Loading lessons from Impulse...
            </Text>
          </Card>
        ) : error ? (
          <Card style={{ alignItems: 'center', gap: 10, paddingVertical: 24 }}>
            <LeoMascot pose="oops" size={88} />
            <Text style={[typography.headline, { color: colors.textPrimary }]}>
              Could Not Load Course
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary, textAlign: 'center' }]}>
              {error}
            </Text>
          </Card>
        ) : null}

        {course?.units.map((unit, uIdx) => {
          const grad = UNIT_GRADIENTS[uIdx % UNIT_GRADIENTS.length];
          return (
            <View key={unit.id} style={styles.unitSection}>
              <Card variant="gradient" gradientColors={grad} style={styles.unitHeader}>
                <View style={styles.unitHeaderRow}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={styles.unitKicker}>UNIT {unit.position}</Text>
                    <Text style={[typography.title2, { color: '#FFFFFF' }]}>{unit.title}</Text>
                  </View>
                  <LeoMascot pose={uIdx % 2 === 0 ? 'wave' : 'cheer'} size={66} />
                </View>
              </Card>

              <View style={styles.nodesStack}>
                {unit.lessons.map((lesson, lIdx) => {
                  const done = lesson.progress?.status === 'COMPLETED';
                  const locked = lesson.open === false || Boolean(lesson.lock);
                  const offset = lIdx % 2 === 0 ? 0 : 14;
                  const nodeBg = done ? '#58CC02' : locked ? '#E2E8F0' : grad[0];
                  const nodeLip = done ? '#46A302' : locked ? '#CBD5E1' : '#0A3BB3';

                  return (
                    <View
                      key={lesson.id}
                      style={[
                        styles.lessonRow,
                        { paddingLeft: offset, paddingRight: offset === 0 ? 14 : 0 },
                      ]}
                    >
                      <AnimatedPressable
                        disabled={locked}
                        onPress={() => router.push(`/lesson/${lesson.id}` as never)}
                        style={[
                          styles.lessonNodeCard,
                          {
                            backgroundColor: colors.surface,
                            borderColor: done ? '#58CC02' : locked ? colors.border : grad[0],
                            borderBottomColor: done ? '#46A302' : locked ? '#CBD5E1' : '#0A3BB3',
                            borderRadius: radii.xl,
                            opacity: locked ? 0.72 : 1,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.nodeCircle,
                            { backgroundColor: nodeBg, borderBottomColor: nodeLip },
                          ]}
                        >
                          {done ? (
                            <Check size={24} color="#FFFFFF" strokeWidth={3} />
                          ) : locked ? (
                            <Lock size={20} color="#64748B" />
                          ) : (
                            <Play size={22} color="#FFFFFF" fill="#FFFFFF" />
                          )}
                        </View>

                        <View style={{ flex: 1, gap: 3 }}>
                          <View style={styles.lessonTopMeta}>
                            <Text style={[typography.headline, { color: colors.textPrimary, flex: 1 }]}>
                              {lesson.title}
                            </Text>
                            {done ? <Star3D size={22} filled /> : null}
                          </View>
                          {locked ? (
                            <Text style={[typography.caption, { color: '#64748B' }]}>
                              {lockText(lesson)}
                            </Text>
                          ) : (
                            <View style={styles.metaLine}>
                              {lesson.estimatedMinutes ? (
                                <View style={styles.metaChip}>
                                  <Clock size={12} color={colors.textSecondary} />
                                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                                    {lesson.estimatedMinutes} min
                                  </Text>
                                </View>
                              ) : null}
                              {done ? (
                                <Badge label="Completed" tone="success" />
                              ) : (
                                <Badge label="Play Now" tone="accent" dot />
                              )}
                            </View>
                          )}
                        </View>
                      </AnimatedPressable>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  coinText: {
    color: '#B45309',
    fontSize: 12.5,
    fontWeight: '900',
  },
  progressBarWrap: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 20,
  },
  unitSection: {
    gap: 14,
  },
  unitHeader: {
    paddingVertical: 14,
  },
  unitHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  unitKicker: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  nodesStack: {
    gap: 12,
  },
  lessonRow: {
    width: '100%',
  },
  lessonNodeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 13,
    borderWidth: 2,
    borderBottomWidth: 5,
  },
  nodeCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderBottomWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonTopMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
