import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Check, Coins, Lock, Play, Star } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/gluestack/actionsheet';
import { Badge, BadgeText } from '@/components/gluestack/badge';
import { Box } from '@/components/gluestack/box';
import { Button, ButtonIcon, ButtonText } from '@/components/gluestack/button';
import { Card } from '@/components/gluestack/card';
import { Center } from '@/components/gluestack/center';
import { Heading } from '@/components/gluestack/heading';
import { HStack } from '@/components/gluestack/hstack';
import { Image } from '@/components/gluestack/image';
import { Pressable } from '@/components/gluestack/pressable';
import { Progress, ProgressFilledTrack } from '@/components/gluestack/progress';
import { Skeleton } from '@/components/gluestack/skeleton';
import { Text } from '@/components/gluestack/text';
import { VStack } from '@/components/gluestack/vstack';
import { LeoMascot } from '@/components/mascot/LeoMascot';
import { GeneratedAssets } from '@/constants/GeneratedAssets';
import type { Course, CourseLesson } from '@/lib/api/types';
import { useKidsApp } from '@/providers/KidsAppProvider';

const UNIT_GRADIENTS: Array<[string, string]> = [
  ['#2563EB', '#1055F8'],
  ['#6D28D9', '#7C3AED'],
  ['#059669', '#10B981'],
  ['#D97706', '#F59E0B'],
];

const NODE_OFFSETS = [0, -52, 0, 52];

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
  const height = 36;
  const x1 = width / 2 + fromX;
  const x2 = width / 2 + toX;
  const d = `M ${x1} 2 C ${x1} ${height * 0.55}, ${x2} ${height * 0.45}, ${x2} ${height - 2}`;

  return (
    <Center className="h-9 my-0.5" pointerEvents="none">
      <Svg width={width} height={height}>
        <Path
          d={d}
          stroke="#CBD5E1"
          strokeWidth={2.5}
          strokeDasharray="6 6"
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    </Center>
  );
}

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
  const [lockedLesson, setLockedLesson] = useState<CourseLesson | null>(null);

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
  const activeOpenLesson =
    allLessons.find((l) => l.progress?.status !== 'COMPLETED' && l.open !== false && !l.lock) ??
    null;

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <HStack className="items-center px-4 py-2.5 bg-card" space="sm">
        <Button
          size="icon"
          variant="secondary"
          className="h-9 w-9 rounded-full"
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={18} color="#0F172A" />
        </Button>

        <VStack className="flex-1 min-w-0">
          <Heading size="sm" className="text-foreground" numberOfLines={1}>
            {course?.title ?? 'Course Path'}
          </Heading>
          <Text size="xs" className="text-muted-foreground">
            {completedCount} of {allLessons.length} lessons · {pct}%
          </Text>
        </VStack>

        {course?.lessonRewardCoins ? (
          <Badge
            variant="outline"
            className="rounded-full bg-amber-50 border-amber-200 px-2.5 py-1 gap-1"
          >
            <Coins size={13} color="#D97706" />
            <BadgeText className="text-amber-700 font-extrabold normal-case">
              +{course.lessonRewardCoins}
            </BadgeText>
          </Badge>
        ) : null}
      </HStack>

      <Progress value={pct} className="h-2.5 bg-slate-200 rounded-none">
        <ProgressFilledTrack className="bg-success rounded-r-full" />
      </Progress>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 22 }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <Card className="p-5">
            <VStack space="md">
              <Skeleton variant="rounded" className="h-20 w-full" />
              <Skeleton variant="circular" className="h-16 w-16 self-center" />
              <Skeleton variant="circular" className="h-16 w-16 self-center" />
            </VStack>
          </Card>
        ) : error ? (
          <Card className="p-6 items-center gap-2">
            <LeoMascot pose="oops" size={80} />
            <Heading size="sm" className="text-foreground">
              Could not load course
            </Heading>
            <Text size="xs" className="text-muted-foreground text-center">
              {error}
            </Text>
          </Card>
        ) : null}

        {course?.units.map((unit, uIdx) => {
          const grad = UNIT_GRADIENTS[uIdx % UNIT_GRADIENTS.length];
          const unitDone = unit.lessons.filter((l) => l.progress?.status === 'COMPLETED').length;

          return (
            <VStack key={unit.id} space="lg">
              <Box className="rounded-2xl overflow-hidden border-2 border-black/10 border-b-[5px] border-b-black/25">
                <LinearGradient
                  colors={grad}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <VStack className="flex-1" space="xs">
                    <Text size="xs" bold className="text-white/85">
                      Unit {unit.position} · {unitDone}/{unit.lessons.length} done
                    </Text>
                    <Heading size="md" className="text-white">
                      {unit.title}
                    </Heading>
                  </VStack>
                  <LeoMascot pose={uIdx % 2 === 0 ? 'wave' : 'cheer'} size={58} />
                </LinearGradient>
              </Box>

              <VStack className="items-center py-1">
                {unit.lessons.map((lesson, lIdx) => {
                  const done = lesson.progress?.status === 'COMPLETED';
                  const locked = lesson.open === false || Boolean(lesson.lock);
                  const isCurrent = !done && !locked;
                  const xOffset = NODE_OFFSETS[lIdx % NODE_OFFSETS.length];
                  const nextOffset =
                    lIdx + 1 < unit.lessons.length
                      ? NODE_OFFSETS[(lIdx + 1) % NODE_OFFSETS.length]
                      : null;

                  return (
                    <VStack key={lesson.id} className="items-center w-full">
                      <VStack
                        className="items-center"
                        space="xs"
                        style={{ transform: [{ translateX: xOffset }] }}
                      >
                        {isCurrent ? (
                          <Badge
                            variant="outline"
                            className="rounded-xl bg-card border-2 border-primary/35 border-b-[3px] border-b-primary/40 px-3.5 py-1"
                          >
                            <BadgeText className="text-primary text-[11px] font-extrabold">
                              START
                            </BadgeText>
                          </Badge>
                        ) : null}

                        <Pressable
                          onPress={() => {
                            if (locked) {
                              setLockedLesson(lesson);
                            } else {
                              router.push(`/lesson/${lesson.id}` as never);
                            }
                          }}
                          className="items-center gap-2 active:translate-y-[2px]"
                        >
                          <Box
                            className={`p-2 rounded-full ${
                              isCurrent
                                ? 'border-[3px] border-primary/30 bg-accent/60'
                                : ''
                            }`}
                          >
                            <Center
                              className={`w-[72px] h-[72px] rounded-full border-b-[6px] relative overflow-hidden ${
                                done
                                  ? 'bg-success border-b-success-lip'
                                  : locked
                                    ? 'bg-slate-200 border-2 border-slate-300 border-b-[6px] border-b-slate-300'
                                    : 'bg-primary border-b-primary-lip'
                              }`}
                            >
                              {!locked ? (
                                <Box
                                  pointerEvents="none"
                                  className="absolute top-1.5 w-9 h-2.5 rounded-full bg-white/25"
                                />
                              ) : null}
                              {done ? (
                                <Check size={28} color="#FFFFFF" strokeWidth={3.2} />
                              ) : locked ? (
                                <Lock size={22} color="#94A3B8" strokeWidth={2.4} />
                              ) : (
                                <Play size={26} color="#FFFFFF" fill="#FFFFFF" />
                              )}
                            </Center>
                            {done ? (
                              <Center className="w-7 h-7 rounded-full bg-amber-400 border-2 border-white border-b-amber-600 absolute right-0 bottom-0">
                                <Star size={13} color="#FFFFFF" fill="#FFFFFF" />
                              </Center>
                            ) : null}
                          </Box>

                          <VStack className="items-center max-w-[190px]">
                            <Text
                              size="sm"
                              bold
                              className={`text-center ${
                                locked ? 'text-muted-foreground' : 'text-foreground'
                              }`}
                              numberOfLines={2}
                            >
                              {lesson.title}
                            </Text>
                            <Text size="xs" className="text-muted-foreground text-center" numberOfLines={2}>
                              {locked
                                ? lockCaption(lesson)
                                : lesson.estimatedMinutes
                                  ? `${lesson.estimatedMinutes} min`
                                  : done
                                    ? 'Completed'
                                    : 'Tap to play'}
                            </Text>
                          </VStack>
                        </Pressable>
                      </VStack>

                      {nextOffset !== null ? (
                        <PathConnector fromX={xOffset} toX={nextOffset} />
                      ) : null}
                    </VStack>
                  );
                })}
              </VStack>
            </VStack>
          );
        })}
      </ScrollView>

      {/* Locked Lesson Info Actionsheet (Bottom Sheet) */}
      <Actionsheet isOpen={Boolean(lockedLesson)} onClose={() => setLockedLesson(null)}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="bg-card px-5 pb-7 pt-2 rounded-t-3xl">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator className="bg-border w-12" />
          </ActionsheetDragIndicatorWrapper>

          {lockedLesson ? (
            <VStack space="md" className="w-full items-center pt-3">
              <Center className="w-20 h-20 rounded-3xl bg-slate-100 border-2 border-border">
                <Image
                  source={GeneratedAssets.lockPadlock}
                  alt="Locked lesson"
                  size="none"
                  resizeMode="contain"
                  style={{ width: 62, height: 62 }}
                />
              </Center>
              <VStack space="xs" className="items-center">
                <Heading size="md" className="text-foreground text-center">
                  {lockedLesson.title}
                </Heading>
                <Text size="sm" className="text-muted-foreground text-center max-w-[280px]">
                  {lockCaption(lockedLesson)}
                </Text>
              </VStack>

              <HStack space="sm" className="w-full mt-1">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 px-3"
                  onPress={() => setLockedLesson(null)}
                >
                  <ButtonText className="text-sm" numberOfLines={1}>Close</ButtonText>
                </Button>
                {activeOpenLesson ? (
                  <Button
                    size="lg"
                    variant="success"
                    className="flex-1 px-3"
                    onPress={() => {
                      const targetId = activeOpenLesson.id;
                      setLockedLesson(null);
                      router.push(`/lesson/${targetId}` as never);
                    }}
                  >
                    <ButtonIcon as={Play} className="text-white" />
                    <ButtonText className="text-sm" numberOfLines={1}>Open Next</ButtonText>
                  </Button>
                ) : null}
              </HStack>
            </VStack>
          ) : null}
        </ActionsheetContent>
      </Actionsheet>
    </SafeAreaView>
  );
}
