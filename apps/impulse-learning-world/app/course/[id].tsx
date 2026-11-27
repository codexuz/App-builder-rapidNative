import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Check, Coins, Lock, Play, Star } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { AnimatedPressable } from '@/components/ui';
import { LeoMascot } from '@/components/mascot/LeoMascot';
import { DS } from '@/constants/DesignSystem';
import type { Course, CourseLesson } from '@/lib/api/types';
import { useKidsApp } from '@/providers/KidsAppProvider';

const UNIT_GRADIENTS: Array<[string, string]> = [
  ['#2563EB', '#1055F8'],
  ['#6D28D9', '#7C3AED'],
  ['#059669', '#10B981'],
  ['#D97706', '#F59E0B'],
];

const NODE_OFFSETS = [0, -56, 0, 56];

function lockCaption(lesson: CourseLesson): string {
  if (!lesson.lock) return 'Locked';
  if (lesson.lock.reason === 'PREVIOUS_NOT_DONE') {
    return `Complete "${lesson.lock.previousTitle}" first`;
  }
  if (lesson.lock.reason === 'NOT_IN_CLASS_YET') {
    return 'Opens after class';
  }
  return 'Opens soon';
}

function PathConnector({ fromX, toX }: { fromX: number; toX: number }) {
  const width = 220;
  const height = 38;
  const x1 = width / 2 + fromX;
  const x2 = width / 2 + toX;
  const d = `M ${x1} 2 C ${x1} ${height * 0.55}, ${x2} ${height * 0.45}, ${x2} ${height - 2}`;

  return (
    <View style={styles.connectorWrap} pointerEvents="none">
      <Svg width={width} height={height}>
        <Path
          d={d}
          stroke="#CBD5E1"
          strokeWidth={3}
          strokeDasharray="6 6"
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    </View>
  );
}

/**
 * Tactile Duolingo-style Stepping-Stone Learning Path:
 * Clean Unit Banners + centered S-curve 3D lesson nodes connected by smooth dotted SVG trails.
 */
export default function CourseRoadmapScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
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
  const pct = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
          <ArrowLeft size={20} color={DS.colors.ink} />
        </Pressable>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={DS.type.cardTitle} numberOfLines={1}>
            {course?.title ?? 'Course Path'}
          </Text>
          <Text style={DS.type.caption}>
            {completedCount} of {allLessons.length} lessons · {pct}%
          </Text>
        </View>
        {course?.lessonRewardCoins ? (
          <View style={styles.rewardChip}>
            <Coins size={14} color={DS.colors.amberDeep} />
            <Text style={styles.rewardChipText}>+{course.lessonRewardCoins}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.topTrack}>
        <View style={[styles.topFill, { width: `${pct}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={[DS.card, styles.stateCard]}>
            <LeoMascot pose="think" size={80} />
            <Text style={DS.type.cardTitle}>Loading lessons...</Text>
          </View>
        ) : error ? (
          <View style={[DS.card, styles.stateCard]}>
            <LeoMascot pose="oops" size={80} />
            <Text style={DS.type.cardTitle}>Could not load course</Text>
            <Text style={[DS.type.caption, { textAlign: 'center' }]}>{error}</Text>
          </View>
        ) : null}

        {course?.units.map((unit, uIdx) => {
          const grad = UNIT_GRADIENTS[uIdx % UNIT_GRADIENTS.length];
          const unitDone = unit.lessons.filter((l) => l.progress?.status === 'COMPLETED').length;

          return (
            <View key={unit.id} style={styles.unitBlock}>
              <LinearGradient
                colors={grad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.unitBanner}
              >
                <View style={styles.unitTextCol}>
                  <Text style={styles.unitMeta}>
                    Unit {unit.position} · {unitDone}/{unit.lessons.length} done
                  </Text>
                  <Text style={styles.unitTitle}>{unit.title}</Text>
                </View>
                <LeoMascot pose={uIdx % 2 === 0 ? 'wave' : 'cheer'} size={62} />
              </LinearGradient>

              <View style={styles.pathCol}>
                {unit.lessons.map((lesson, lIdx) => {
                  const done = lesson.progress?.status === 'COMPLETED';
                  const locked = lesson.open === false || Boolean(lesson.lock);
                  const isCurrent = !done && !locked;
                  const xOffset = NODE_OFFSETS[lIdx % NODE_OFFSETS.length];
                  const nextOffset =
                    lIdx + 1 < unit.lessons.length
                      ? NODE_OFFSETS[(lIdx + 1) % NODE_OFFSETS.length]
                      : null;

                  const bg = done
                    ? DS.colors.green
                    : locked
                      ? '#E2E8F0'
                      : DS.colors.brand;
                  const lip = done
                    ? DS.colors.greenDeep
                    : locked
                      ? '#CBD5E1'
                      : DS.colors.brandDeep;

                  return (
                    <View key={lesson.id} style={styles.nodeWrapper}>
                      <View style={[styles.nodeAnchor, { transform: [{ translateX: xOffset }] }]}>
                        {isCurrent ? (
                          <View style={styles.startTooltip}>
                            <Text style={styles.startTooltipText}>START</Text>
                          </View>
                        ) : null}

                        <AnimatedPressable
                          disabled={locked}
                          onPress={() => router.push(`/lesson/${lesson.id}` as never)}
                          style={styles.nodeTapTarget}
                        >
                          <View
                            style={[
                              styles.nodeOuter,
                              isCurrent ? styles.nodeOuterActive : null,
                            ]}
                          >
                            <View
                              style={[
                                styles.node3D,
                                { backgroundColor: bg, borderBottomColor: lip },
                              ]}
                            >
                              <View style={styles.nodeHighlight} />
                              {done ? (
                                <Check size={28} color="#FFFFFF" strokeWidth={3.2} />
                              ) : locked ? (
                                <Lock size={22} color="#64748B" strokeWidth={2.4} />
                              ) : (
                                <Play size={26} color="#FFFFFF" fill="#FFFFFF" />
                              )}
                            </View>
                            {done ? (
                              <View style={styles.starBadge}>
                                <Star size={12} color="#FFFFFF" fill="#FFFFFF" />
                              </View>
                            ) : null}
                          </View>

                          <View style={styles.nodeCaptionBox}>
                            <Text
                              style={[
                                styles.nodeTitle,
                                locked ? { color: DS.colors.inkMuted } : null,
                              ]}
                              numberOfLines={2}
                            >
                              {lesson.title}
                            </Text>
                            <Text style={styles.nodeMeta} numberOfLines={2}>
                              {locked
                                ? lockCaption(lesson)
                                : lesson.estimatedMinutes
                                  ? `${lesson.estimatedMinutes} min`
                                  : done
                                    ? 'Completed'
                                    : 'Tap to play'}
                            </Text>
                          </View>
                        </AnimatedPressable>
                      </View>

                      {nextOffset !== null ? (
                        <PathConnector fromX={xOffset} toX={nextOffset} />
                      ) : null}
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
  safe: {
    flex: 1,
    backgroundColor: DS.colors.canvas,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
    backgroundColor: DS.colors.surface,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: DS.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: DS.colors.amberSoft,
  },
  rewardChipText: {
    color: DS.colors.amberInk,
    fontSize: 12.5,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  topTrack: {
    height: 3,
    backgroundColor: DS.colors.border,
  },
  topFill: {
    height: 3,
    backgroundColor: DS.colors.brand,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
    gap: 24,
  },
  stateCard: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  unitBlock: {
    gap: 22,
  },
  unitBanner: {
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  unitTextCol: {
    flex: 1,
    gap: 3,
  },
  unitMeta: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 12.5,
    fontWeight: '700',
  },
  unitTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  pathCol: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  nodeWrapper: {
    alignItems: 'center',
    width: '100%',
  },
  nodeAnchor: {
    alignItems: 'center',
    gap: 4,
  },
  nodeTapTarget: {
    alignItems: 'center',
    gap: 8,
  },
  startTooltip: {
    backgroundColor: DS.colors.surface,
    borderWidth: 1.5,
    borderColor: DS.colors.brandBorder,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 2,
  },
  startTooltipText: {
    color: DS.colors.brand,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  nodeOuter: {
    padding: 5,
    borderRadius: 44,
  },
  nodeOuterActive: {
    borderWidth: 3,
    borderColor: DS.colors.brandBorder,
    backgroundColor: '#FFFFFF',
  },
  node3D: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderBottomWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  nodeHighlight: {
    position: 'absolute',
    top: 7,
    left: 16,
    right: 16,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.24)',
  },
  starBadge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: DS.colors.amber,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeCaptionBox: {
    alignItems: 'center',
    maxWidth: 190,
    gap: 2,
  },
  nodeTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: DS.colors.ink,
    textAlign: 'center',
  },
  nodeMeta: {
    fontSize: 12,
    fontWeight: '600',
    color: DS.colors.inkMuted,
    textAlign: 'center',
  },
  connectorWrap: {
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
});
