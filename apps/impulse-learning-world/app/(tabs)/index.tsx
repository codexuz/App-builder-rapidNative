import React, { useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  AlertCircle,
  BookOpen,
  ChevronRight,
  GraduationCap,
  Play,
  RotateCcw,
  Store,
} from 'lucide-react-native';
import { Alert, AlertIcon, AlertText } from '@/components/gluestack/alert';
import { Badge, BadgeText } from '@/components/gluestack/badge';
import { Box } from '@/components/gluestack/box';
import { Button, ButtonIcon, ButtonText } from '@/components/gluestack/button';
import { Card } from '@/components/gluestack/card';
import { Center } from '@/components/gluestack/center';
import { Divider } from '@/components/gluestack/divider';
import { Heading } from '@/components/gluestack/heading';
import { HStack } from '@/components/gluestack/hstack';
import { Pressable } from '@/components/gluestack/pressable';
import { Progress, ProgressFilledTrack } from '@/components/gluestack/progress';
import { Skeleton, SkeletonText } from '@/components/gluestack/skeleton';
import { Text } from '@/components/gluestack/text';
import { VStack } from '@/components/gluestack/vstack';
import { GameHud } from '@/components/game';
import { LeoMascot, type LeoPose } from '@/components/mascot/LeoMascot';
import { Screen } from '@/components/ui';
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
  const { courses, gamification, today, dueWords, me, loading, error, refreshAll } =
    useKidsApp();

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
        <Alert
          variant="destructive"
          className="rounded-2xl bg-red-50 border-red-200 p-3.5"
        >
          <AlertIcon as={AlertCircle} className="text-destructive" />
          <VStack className="flex-1" space="xs">
            <AlertText className="text-destructive font-semibold">
              {error}
            </AlertText>
            <Button
              size="sm"
              variant="outline"
              className="self-start bg-white rounded-lg border-red-200 mt-1"
              onPress={() => void refreshAll()}
            >
              <ButtonText className="text-destructive text-xs font-bold">
                Try Again
              </ButtonText>
            </Button>
          </VStack>
        </Alert>
      ) : null}

      {/* Leo Daily Check-In Card */}
      <Card className="bg-card border border-border rounded-2xl p-3.5">
        <HStack className="items-center" space="md">
          <Center className="w-16 h-16 rounded-2xl bg-accent">
            <LeoMascot pose={leoNote.pose} size={58} />
          </Center>
          <VStack className="flex-1 min-w-0" space="xs">
            <Heading size="sm" className="text-foreground" numberOfLines={1}>
              {leoNote.title}
            </Heading>
            <Text size="xs" className="text-muted-foreground leading-4" numberOfLines={2}>
              {leoNote.body}
            </Text>
          </VStack>
        </HStack>
      </Card>

      {/* Primary Focus Card */}
      {currentCourse ? (
        <Box className="rounded-3xl overflow-hidden shadow-xs">
          <LinearGradient
            colors={['#2563EB', '#1055F8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 18, gap: 14 }}
          >
            <HStack className="items-start justify-between" space="md">
              <VStack className="flex-1 min-w-0" space="xs">
                <Text size="xs" bold className="text-white/80" numberOfLines={1}>
                  {currentCourse.course.level?.name ?? currentCourse.course.title}
                </Text>
                <Heading size="lg" className="text-white leading-6" numberOfLines={2}>
                  {currentCourse.stats.nextLesson?.title ?? currentCourse.course.title}
                </Heading>
              </VStack>
              <Badge className="rounded-full bg-white/20 px-2.5 py-1 border-0">
                <BadgeText className="text-white font-extrabold normal-case">
                  {currentCourse.stats.pct}%
                </BadgeText>
              </Badge>
            </HStack>

            <HStack className="items-center" space="sm">
              <Box className="flex-1">
                <Progress
                  value={currentCourse.stats.pct}
                  className="h-2 bg-white/25 rounded-full"
                >
                  <ProgressFilledTrack className="bg-white rounded-full" />
                </Progress>
              </Box>
              <Text size="xs" bold className="text-white/90">
                {currentCourse.stats.completed}/{currentCourse.stats.total} lessons
              </Text>
            </HStack>

            <Button
              size="lg"
              variant="secondary"
              className="h-12 rounded-xl bg-white active:bg-slate-100 w-full"
              onPress={() => {
                if (currentCourse.stats.nextLesson) {
                  router.push(`/lesson/${currentCourse.stats.nextLesson.id}` as never);
                } else {
                  router.push(`/course/${currentCourse.course.id}` as never);
                }
              }}
            >
              <ButtonIcon as={Play} className="text-primary" />
              <ButtonText className="text-primary font-extrabold text-sm">
                {currentCourse.stats.nextLesson
                  ? currentCourse.course.lessonRewardCoins > 0
                    ? `Continue Lesson  ·  +${currentCourse.course.lessonRewardCoins} Coins`
                    : 'Continue Lesson'
                  : 'Open Course Path'}
              </ButtonText>
            </Button>
          </LinearGradient>
        </Box>
      ) : loading ? (
        <Card className="bg-card border border-border rounded-2xl p-5">
          <VStack space="md">
            <Skeleton variant="rounded" className="h-5 w-1/3" />
            <SkeletonText _lines={2} className="h-3" />
            <Skeleton variant="rounded" className="h-11 w-full" />
          </VStack>
        </Card>
      ) : (
        <Card className="bg-card border border-border rounded-2xl p-6">
          <VStack space="sm" className="items-center">
            <LeoMascot pose="wave" size={80} />
            <Heading size="md" className="text-foreground">
              No enrolled courses yet
            </Heading>
            <Text size="xs" className="text-muted-foreground text-center max-w-[260px]">
              Once your teacher adds you to an Impulse group, your lessons will appear here.
            </Text>
          </VStack>
        </Card>
      )}

      {/* 2-Column Quick Actions */}
      <HStack space="md">
        <Pressable
          onPress={() => router.push('/words' as never)}
          className="flex-1 min-w-0"
        >
          <Card className="bg-card border border-border rounded-2xl p-3.5">
            <HStack className="items-center" space="sm">
              <Center className="w-10 h-10 rounded-xl bg-accent">
                <BookOpen size={19} color="#1055F8" />
              </Center>
              <VStack className="flex-1 min-w-0">
                <Text size="sm" bold className="text-foreground" numberOfLines={1}>
                  Word Cards
                </Text>
                <Text size="xs" className="text-muted-foreground" numberOfLines={1}>
                  {dueCount > 0 ? `${dueCount} due today` : 'All reviewed'}
                </Text>
              </VStack>
            </HStack>
          </Card>
        </Pressable>

        <Pressable
          onPress={() => router.push('/shop' as never)}
          className="flex-1 min-w-0"
        >
          <Card className="bg-card border border-border rounded-2xl p-3.5">
            <HStack className="items-center" space="sm">
              <Center className="w-10 h-10 rounded-xl bg-amber-50">
                <Store size={19} color="#D97706" />
              </Center>
              <VStack className="flex-1 min-w-0">
                <Text size="sm" bold className="text-foreground" numberOfLines={1}>
                  Coin Shop
                </Text>
                <Text size="xs" className="text-muted-foreground" numberOfLines={1}>
                  {coins} coins
                </Text>
              </VStack>
            </HStack>
          </Card>
        </Pressable>
      </HStack>

      {/* My Courses */}
      {activeCourses.length > 0 ? (
        <VStack space="sm">
          <HStack className="items-center justify-between">
            <Heading size="md" className="text-foreground">
              My Courses
            </Heading>
            <Badge variant="secondary" className="rounded-full px-2.5">
              <BadgeText className="text-muted-foreground normal-case font-semibold">
                {activeCourses.length} active
              </BadgeText>
            </Badge>
          </HStack>

          <VStack space="sm">
            {activeCourses.map((course) => {
              const stats = computeCourseStats(course);
              return (
                <Pressable
                  key={course.id}
                  onPress={() => router.push(`/course/${course.id}` as never)}
                >
                  <Card className="bg-card border border-border rounded-2xl p-4">
                    <HStack className="items-center" space="md">
                      <Center className="w-12 h-12 rounded-xl bg-accent">
                        <GraduationCap size={22} color="#1055F8" />
                      </Center>
                      <VStack className="flex-1 min-w-0" space="xs">
                        <HStack className="items-center justify-between" space="xs">
                          <Text
                            size="sm"
                            bold
                            className="text-foreground flex-1"
                            numberOfLines={1}
                          >
                            {course.title}
                          </Text>
                          <ChevronRight size={17} color="#94A3B8" />
                        </HStack>
                        <Text size="xs" className="text-muted-foreground" numberOfLines={1}>
                          {course.level?.name ? `${course.level.name} · ` : ''}
                          {stats.completed} of {stats.total} lessons completed
                        </Text>
                        <HStack className="items-center mt-0.5" space="sm">
                          <Box className="flex-1">
                            <Progress
                              value={stats.pct}
                              className="h-1.5 bg-secondary rounded-full"
                            >
                              <ProgressFilledTrack className="bg-primary rounded-full" />
                            </Progress>
                          </Box>
                          <Text size="xs" bold className="text-muted-foreground">
                            {stats.pct}%
                          </Text>
                        </HStack>
                      </VStack>
                    </HStack>
                  </Card>
                </Pressable>
              );
            })}
          </VStack>
        </VStack>
      ) : null}

      {/* Earlier Levels */}
      {practiceCourses.length > 0 ? (
        <VStack space="sm">
          <Heading size="md" className="text-foreground">
            Earlier Levels
          </Heading>
          <Card className="bg-card border border-border rounded-2xl p-0 overflow-hidden">
            {practiceCourses.map((course, idx) => {
              const stats = computeCourseStats(course);
              return (
                <Box key={course.id}>
                  {idx > 0 ? <Divider className="bg-border" /> : null}
                  <Pressable
                    onPress={() => router.push(`/course/${course.id}` as never)}
                    className="p-3.5 active:bg-accent/50"
                  >
                    <HStack className="items-center" space="md">
                      <Center className="w-10 h-10 rounded-xl bg-secondary">
                        <RotateCcw size={17} color="#475569" />
                      </Center>
                      <VStack className="flex-1 min-w-0">
                        <Text size="sm" bold className="text-foreground" numberOfLines={1}>
                          {course.title}
                        </Text>
                        <Text size="xs" className="text-muted-foreground" numberOfLines={1}>
                          {stats.completed}/{stats.total} lessons · Open practice
                        </Text>
                      </VStack>
                      <ChevronRight size={17} color="#94A3B8" />
                    </HStack>
                  </Pressable>
                </Box>
              );
            })}
          </Card>
        </VStack>
      ) : null}
    </Screen>
  );
}
