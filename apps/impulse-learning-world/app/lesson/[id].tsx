import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AlertCircle,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Coins,
  Flame,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTitleText,
  AccordionTrigger,
} from '@/components/gluestack/accordion';
import { Alert, AlertIcon, AlertText } from '@/components/gluestack/alert';
import { Badge, BadgeText } from '@/components/gluestack/badge';
import { Box } from '@/components/gluestack/box';
import { Button, ButtonIcon, ButtonSpinner, ButtonText } from '@/components/gluestack/button';
import { Card } from '@/components/gluestack/card';
import { Center } from '@/components/gluestack/center';
import { Divider } from '@/components/gluestack/divider';
import { Heading } from '@/components/gluestack/heading';
import { HStack } from '@/components/gluestack/hstack';
import { Image } from '@/components/gluestack/image';
import { Input, InputField } from '@/components/gluestack/input';
import { KeyboardAvoidingView } from '@/components/gluestack/keyboard-avoiding-view';
import { Pressable } from '@/components/gluestack/pressable';
import { Progress, ProgressFilledTrack } from '@/components/gluestack/progress';
import { Spinner } from '@/components/gluestack/spinner';
import { Text } from '@/components/gluestack/text';
import { Textarea, TextareaInput } from '@/components/gluestack/textarea';
import { VStack } from '@/components/gluestack/vstack';
import { ConfettiBurst, speakEnglishText } from '@/components/game';
import { LeoMascot } from '@/components/mascot/LeoMascot';
import { GeneratedAssets } from '@/constants/GeneratedAssets';
import { api } from '@/lib/api';
import type {
  AttemptResult,
  Lesson,
  LessonExercise,
  Question,
  VocabularyWord,
} from '@/lib/api/types';
import { useKidsApp } from '@/providers/KidsAppProvider';
import {
  playCorrectFeedback,
  playTileTapSound,
  playVictoryFeedback,
} from '@/utils/soundFeedback';

interface VictorySummary {
  accuracyPercent: number;
  xpEarned: number;
  coinsEarned: number;
  streakDays: number;
  unlockedNextLessonTitle?: string | null;
}

export default function KidsLessonScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const {
    studentId,
    courses,
    soundEnabled,
    setSoundEnabled,
    loadLessonDetail,
    submitExerciseAttempt,
  } = useKidsApp();

  const lessonId = typeof params.id === 'string' ? params.id : '';
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [phase, setPhase] = useState<'study' | 'play' | 'victory' | 'review'>('study');

  // Exercise state
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [attemptId, setAttemptId] = useState<string | undefined>(undefined);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [answersMap, setAnswersMap] = useState<Record<string, unknown>>({});

  // Current question input states
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [selectedMulti, setSelectedMulti] = useState<string[]>([]);
  const [selectedBool, setSelectedBool] = useState<boolean | null>(null);
  const [selectedOrderIndices, setSelectedOrderIndices] = useState<number[]>([]);
  const [textAnswer, setTextAnswer] = useState('');

  // Submission & celebration state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [attemptResult, setAttemptResult] = useState<AttemptResult | null>(null);
  const [confettiKey, setConfettiKey] = useState(0);
  const [isLeoSpeaking, setIsLeoSpeaking] = useState(false);
  const [victory, setVictory] = useState<VictorySummary | null>(null);

  const startedAtRef = useRef<number>(Date.now());
  const stopAudioRef = useRef<(() => void) | null>(null);

  const fetchLesson = useCallback(() => {
    if (!lessonId) {
      setLoadError('Lesson ID is missing.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    loadLessonDetail(lessonId)
      .then((data) => {
        if (!data) {
          setLoadError('Could not load this lesson.');
        } else {
          setLesson(data);
          setExerciseIdx(0);
          setQuestions(data.exercises?.[0]?.questions ?? []);
        }
        setLoading(false);
      })
      .catch((err) => {
        setLoadError(err instanceof Error ? err.message : 'Failed to load lesson.');
        setLoading(false);
      });
  }, [lessonId, loadLessonDetail]);

  useEffect(() => {
    fetchLesson();
    return () => {
      stopAudioRef.current?.();
    };
  }, [fetchLesson]);

  const activeExercise: LessonExercise | null = lesson?.exercises?.[exerciseIdx] ?? null;
  const currentQuestion: Question | null = questions[qIdx] ?? null;

  const parentCourse = useMemo(() => {
    const cid = lesson?.unit?.course?.id;
    return courses.find((c) => c.id === cid) ?? null;
  }, [courses, lesson]);

  const speakAsLeo = (text: string) => {
    if (!soundEnabled) return;
    stopAudioRef.current?.();
    setIsLeoSpeaking(true);
    stopAudioRef.current = speakEnglishText(text, () => setIsLeoSpeaking(false));
  };

  const resetQuestionInputs = () => {
    setSelectedChoice(null);
    setSelectedMulti([]);
    setSelectedBool(null);
    setSelectedOrderIndices([]);
    setTextAnswer('');
    setSubmitError(null);
  };

  const handleStartQuiz = async (idx = exerciseIdx) => {
    const targetEx = lesson?.exercises?.[idx] ?? null;
    startedAtRef.current = Date.now();
    setSubmitError(null);

    if (!targetEx) {
      if (studentId && lesson) {
        await api.markLessonViewed(lesson.id, studentId).catch(() => {});
      }
      setVictory({
        accuracyPercent: 100,
        xpEarned: 0,
        coinsEarned: parentCourse?.lessonRewardCoins ?? 0,
        streakDays: 0,
      });
      setPhase('victory');
      setConfettiKey((k) => k + 1);
      playVictoryFeedback(soundEnabled);
      return;
    }

    setExerciseIdx(idx);
    let runQuestions = targetEx.questions ?? [];
    let nextAttemptId: string | undefined;

    if (studentId && (targetEx.settings?.startRequired || targetEx.mine?.openAttempt)) {
      try {
        const started = await api.startAttempt(targetEx.id, studentId);
        nextAttemptId = started.attempt.id;
        runQuestions = started.questions;
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Could not start exercise.');
        return;
      }
    }

    setAttemptId(nextAttemptId);
    setQuestions(runQuestions);
    setQIdx(0);
    setAnswersMap({});
    resetQuestionInputs();
    setPhase('play');
  };

  const getCurrentAnswer = (): unknown => {
    if (!currentQuestion) return null;
    if (currentQuestion.type === 'SINGLE_CHOICE') return selectedChoice;
    if (currentQuestion.type === 'MULTI_CHOICE') return selectedMulti;
    if (currentQuestion.type === 'TRUE_FALSE') return selectedBool;
    if (currentQuestion.type === 'ORDER') {
      const items = currentQuestion.data.items ?? [];
      return selectedOrderIndices.map((idx) => items[idx]?.id).filter(Boolean);
    }
    return textAnswer.trim();
  };

  const canAdvance = (() => {
    if (!currentQuestion) return false;
    if (currentQuestion.type === 'SINGLE_CHOICE') return selectedChoice !== null;
    if (currentQuestion.type === 'MULTI_CHOICE') return selectedMulti.length > 0;
    if (currentQuestion.type === 'TRUE_FALSE') return selectedBool !== null;
    if (currentQuestion.type === 'ORDER') {
      return selectedOrderIndices.length === (currentQuestion.data.items ?? []).length;
    }
    return textAnswer.trim().length > 0;
  })();

  const handleNextOrSubmit = async () => {
    if (!currentQuestion || !canAdvance || !activeExercise) return;

    const currentAns = getCurrentAnswer();
    const updatedAnswers = { ...answersMap, [currentQuestion.id]: currentAns };
    setAnswersMap(updatedAnswers);

    if (qIdx + 1 < questions.length) {
      playCorrectFeedback(soundEnabled);
      setQIdx((i) => i + 1);
      resetQuestionInputs();
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const durationSeconds = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
      const formattedAnswers = Object.entries(updatedAnswers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));

      const result = await submitExerciseAttempt({
        exerciseId: activeExercise.id,
        attemptId,
        durationSeconds,
        answers: formattedAnswers,
      });

      setAttemptResult(result);

      const maxScoreNum = Number(result.maxScore) || 0;
      const scoreNum = Number(result.score ?? 0);
      const accuracyPercent =
        maxScoreNum > 0
          ? Math.max(0, Math.min(100, Math.round((scoreNum / maxScoreNum) * 100)))
          : 100;

      const allLessons = parentCourse?.units.flatMap((u) => u.lessons) ?? [];
      const curPos = allLessons.findIndex((l) => l.id === lessonId);
      const nextUnlocked = curPos >= 0 ? (allLessons[curPos + 1]?.title ?? null) : null;

      setVictory({
        accuracyPercent,
        xpEarned: result.reward?.xp.gained ?? 0,
        coinsEarned: result.streak?.coins ?? 0,
        streakDays: result.streak?.after ?? 0,
        unlockedNextLessonTitle: nextUnlocked,
      });
      setPhase('victory');
      setConfettiKey((k) => k + 1);
      playVictoryFeedback(soundEnabled);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit attempt.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <Center className="flex-1 px-6">
          <VStack space="md" className="items-center">
            <Spinner size="large" />
            <Text size="sm" className="text-muted-foreground">
              Loading lesson from Impulse...
            </Text>
          </VStack>
        </Center>
      </SafeAreaView>
    );
  }

  if (loadError || !lesson) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <Center className="flex-1 px-6">
          <VStack space="md" className="items-center w-full max-w-[300px]">
            <LeoMascot pose="oops" size={118} />
            <Heading size="lg" className="text-foreground text-center">
              Could Not Open Lesson
            </Heading>
            <Text size="sm" className="text-muted-foreground text-center">
              {loadError ?? 'Lesson not found.'}
            </Text>
            <Button size="lg" className="w-full" onPress={fetchLesson}>
              <ButtonText>Try Again</ButtonText>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onPress={() => router.back()}
            >
              <ButtonText>Go Back</ButtonText>
            </Button>
          </VStack>
        </Center>
      </SafeAreaView>
    );
  }

  // PHASE 4: ANSWER REVIEW
  if (phase === 'review' && attemptResult) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <HStack className="items-center px-4 py-2.5 bg-card border-b-2 border-border" space="sm">
          <Button
            size="icon"
            variant="secondary"
            className="h-9 w-9 rounded-full"
            onPress={() => setPhase('victory')}
          >
            <X size={18} color="#0F172A" />
          </Button>
          <Heading size="md" className="text-foreground flex-1">
            Answer Review
          </Heading>
          <Badge className="rounded-full bg-accent border-0 px-3 py-1">
            <BadgeText className="text-primary font-extrabold normal-case">
              {attemptResult.score ?? 0}/{attemptResult.maxScore}
            </BadgeText>
          </Badge>
        </HStack>

        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 12 }}
          showsVerticalScrollIndicator={false}
        >
          {questions.map((q, idx) => {
            const ans = attemptResult.answers.find((a) => a.questionId === q.id);
            const ok = ans?.isCorrect === true;
            return (
              <Card
                key={q.id}
                variant={ok ? 'success' : 'danger'}
                className="p-4"
              >
                <VStack space="sm">
                  <HStack className="items-center justify-between">
                    <Badge
                      className={`rounded-full border-0 px-2.5 py-0.5 ${
                        ok ? 'bg-emerald-50' : 'bg-red-50'
                      }`}
                    >
                      <BadgeText
                        className={`text-xs font-bold ${
                          ok ? 'text-emerald-700' : 'text-destructive'
                        }`}
                      >
                        Question {idx + 1}
                      </BadgeText>
                    </Badge>
                    <Badge
                      className={`rounded-full border-0 px-2.5 py-0.5 ${
                        ok ? 'bg-emerald-500' : 'bg-destructive'
                      }`}
                    >
                      <BadgeText className="text-white text-xs font-bold normal-case">
                        {ok ? 'Correct' : 'Review'}
                      </BadgeText>
                    </Badge>
                  </HStack>
                  <Text size="md" bold className="text-foreground">
                    {q.prompt}
                  </Text>
                  {ans?.feedback ? (
                    <Text size="xs" className="text-muted-foreground">
                      {ans.feedback}
                    </Text>
                  ) : null}
                </VStack>
              </Card>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // PHASE 3: VICTORY SUMMARY (Clean Gluestack Card)
  if (phase === 'victory' && victory) {
    const allLessons = parentCourse?.units.flatMap((u) => u.lessons) ?? [];
    const completedCount = allLessons.filter(
      (l) => l.id === lessonId || l.progress?.status === 'COMPLETED'
    ).length;
    const coursePct = allLessons.length
      ? Math.round((completedCount / allLessons.length) * 100)
      : 100;

    return (
      <SafeAreaView className="flex-1 bg-background">
        <ConfettiBurst triggerKey={confettiKey} intensity="grand" />
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            padding: 20,
            gap: 16,
          }}
          showsVerticalScrollIndicator={false}
        >
          <VStack space="sm" className="items-center">
            <Center className="w-32 h-32 rounded-full bg-accent border-2 border-primary/20 border-b-4 border-b-primary/30">
              <LeoMascot pose="cheer" size={114} />
            </Center>
            <Badge variant="success" className="px-3.5 py-1.5 gap-1.5">
              <Image
                source={GeneratedAssets.trophyGold}
                alt="Trophy"
                size="none"
                resizeMode="contain"
                style={{ width: 16, height: 16 }}
              />
              <BadgeText>Lesson Complete</BadgeText>
            </Badge>
            <Heading size="2xl" className="text-foreground text-center">
              Great Work!
            </Heading>
            <Text size="sm" className="text-muted-foreground text-center">
              {lesson.title}
            </Text>
          </VStack>

          <Card className="p-4">
            <HStack className="items-center">
              <VStack className="flex-1 items-center" space="xs">
                <Image
                  source={GeneratedAssets.badgeMedal}
                  alt="Accuracy medal"
                  size="none"
                  resizeMode="contain"
                  style={{ width: 36, height: 36 }}
                />
                <Text size="lg" bold className="text-foreground">
                  {victory.accuracyPercent}%
                </Text>
                <Text size="xs" className="text-muted-foreground font-semibold">
                  Accuracy
                </Text>
              </VStack>
              <Divider orientation="vertical" className="h-12 bg-border" />
              <VStack className="flex-1 items-center" space="xs">
                <Image
                  source={GeneratedAssets.xpBolt}
                  alt="XP bolt"
                  size="none"
                  resizeMode="contain"
                  style={{ width: 36, height: 36 }}
                />
                <Text size="lg" bold className="text-foreground">
                  +{victory.xpEarned}
                </Text>
                <Text size="xs" className="text-muted-foreground font-semibold">
                  XP Earned
                </Text>
              </VStack>
              <Divider orientation="vertical" className="h-12 bg-border" />
              <VStack className="flex-1 items-center" space="xs">
                <Image
                  source={GeneratedAssets.coinPouch}
                  alt="Coins"
                  size="none"
                  resizeMode="contain"
                  style={{ width: 36, height: 36 }}
                />
                <Text size="lg" bold className="text-foreground">
                  +{victory.coinsEarned}
                </Text>
                <Text size="xs" className="text-muted-foreground font-semibold">
                  Coins
                </Text>
              </VStack>
            </HStack>
          </Card>

          <Card className="p-4">
            <VStack space="sm">
              <HStack className="items-center justify-between">
                <Text size="sm" bold className="text-foreground">
                  {parentCourse?.title ?? 'Course Progress'}
                </Text>
                <Text size="xs" bold className="text-primary">
                  {completedCount}/{Math.max(1, allLessons.length)} lessons
                </Text>
              </HStack>
              <Progress value={coursePct} className="h-3.5">
                <ProgressFilledTrack className="bg-success" />
              </Progress>
              {victory.streakDays > 0 ? (
                <HStack className="items-center pt-1" space="xs">
                  <Image
                    source={GeneratedAssets.streakFlame}
                    alt="Streak flame"
                    size="none"
                    resizeMode="contain"
                    style={{ width: 20, height: 20 }}
                  />
                  <Text size="xs" bold className="text-orange-700">
                    {victory.streakDays}-day learning streak active!
                  </Text>
                </HStack>
              ) : null}
            </VStack>
          </Card>

          <VStack space="sm" className="mt-2">
            <Button
              size="lg"
              variant="success"
              className="w-full"
              onPress={() => router.back()}
            >
              <ButtonText>Continue Learning</ButtonText>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onPress={() => {
                if (attemptResult?.answersShown) {
                  setPhase('review');
                } else {
                  setVictory(null);
                  setPhase('study');
                  resetQuestionInputs();
                }
              }}
            >
              <ButtonText>
                {attemptResult?.answersShown ? 'Review My Answers' : 'Practice Again'}
              </ButtonText>
            </Button>
          </VStack>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // PHASE 1: STORY & VOCABULARY WARM-UP
  if (phase === 'study') {
    const textBlocks = (lesson.contentBlocks ?? []).filter((b) => b.type === 'TEXT');
    const vocabItems: VocabularyWord[] = (lesson.contentBlocks ?? [])
      .filter((b) => b.type === 'VOCABULARY')
      .flatMap((b) => b.content.items ?? []);

    return (
      <SafeAreaView className="flex-1 bg-background">
        <HStack className="items-center px-4 py-2.5 bg-card border-b border-border" space="sm">
          <Button
            size="icon"
            variant="secondary"
            className="h-9 w-9 rounded-full"
            onPress={() => router.back()}
            accessibilityLabel="Close lesson"
          >
            <X size={18} color="#0F172A" />
          </Button>
          <VStack className="flex-1 min-w-0">
            <Heading size="sm" className="text-foreground" numberOfLines={1}>
              {lesson.title}
            </Heading>
            <Text size="xs" className="text-muted-foreground" numberOfLines={1}>
              {lesson.unit?.course?.title ?? 'Impulse Kids'}
            </Text>
          </VStack>
          <Button
            size="icon"
            variant="secondary"
            className="h-9 w-9 rounded-full bg-accent"
            onPress={() => speakAsLeo(`${lesson.title}. ${lesson.description ?? ''}`)}
            accessibilityLabel="Read aloud"
          >
            <Volume2 size={17} color="#1055F8" />
          </Button>
        </HStack>

        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 28, gap: 14 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Leo Guide Card */}
          <Card className="p-3.5">
            <HStack className="items-center" space="md">
              <Center className="w-16 h-16 rounded-2xl bg-accent">
                <LeoMascot pose={isLeoSpeaking ? 'cheer' : 'wave'} size={58} />
              </Center>
              <VStack className="flex-1 min-w-0" space="xs">
                <Badge className="self-start rounded-full bg-accent border-0 px-2.5 py-0.5">
                  <BadgeText className="text-primary text-[10px] font-bold">
                    Leo Guide
                  </BadgeText>
                </Badge>
                <Text size="sm" className="text-foreground leading-5">
                  {lesson.description ??
                    'Read the notes and listen to the new words, then start the quiz!'}
                </Text>
              </VStack>
            </HStack>
          </Card>

          {submitError ? (
            <Alert variant="destructive" className="rounded-xl bg-red-50 border-red-200 p-3">
              <AlertIcon as={AlertCircle} className="text-destructive" />
              <AlertText className="text-destructive text-xs font-semibold">
                {submitError}
              </AlertText>
            </Alert>
          ) : null}

          {/* Gluestack Accordion for Lesson Notes */}
          {textBlocks.length > 0 ? (
            <Accordion
              type="multiple"
              defaultValue={['notes']}
            >
              <AccordionItem value="notes" className="mb-0">
                <AccordionHeader>
                  <AccordionTrigger className="px-4 py-3.5">
                    {({ isExpanded }: { isExpanded: boolean }) => (
                      <HStack className="items-center justify-between w-full">
                        <HStack className="items-center" space="sm">
                          <BookOpen size={17} color="#1055F8" />
                          <AccordionTitleText className="text-foreground font-bold text-sm">
                            Lesson Notes
                          </AccordionTitleText>
                        </HStack>
                        {isExpanded ? (
                          <ChevronUp size={17} color="#64748B" />
                        ) : (
                          <ChevronDown size={17} color="#64748B" />
                        )}
                      </HStack>
                    )}
                  </AccordionTrigger>
                </AccordionHeader>
                <AccordionContent className="px-4 pb-4 pt-0">
                  <VStack space="sm">
                    {textBlocks.map((block) => (
                      <Text key={block.id} size="sm" className="text-foreground leading-6">
                        {(block.content.markdown ?? '').replace(/\*\*/g, '').replace(/\*/g, '')}
                      </Text>
                    ))}
                  </VStack>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : null}

          {/* Vocabulary Card */}
          {vocabItems.length > 0 ? (
            <VStack space="sm">
              <HStack className="items-center justify-between">
                <Heading size="md" className="text-foreground">
                  Vocabulary
                </Heading>
                <Badge variant="secondary" className="rounded-full px-2.5">
                  <BadgeText className="text-muted-foreground font-semibold normal-case">
                    {vocabItems.length} words
                  </BadgeText>
                </Badge>
              </HStack>

              <Card className="p-0 overflow-hidden">
                {vocabItems.map((w, idx) => (
                  <Box key={w.term}>
                    {idx > 0 ? <Divider className="bg-border" /> : null}
                    <VStack className="p-3.5" space="xs">
                      <HStack className="items-center justify-between" space="sm">
                        <VStack className="flex-1 min-w-0">
                          <Text size="md" bold className="text-foreground">
                            {w.term}
                          </Text>
                          {w.pronunciation ? (
                            <Text size="xs" className="text-muted-foreground">
                              {w.pronunciation} {w.partOfSpeech ? `· ${w.partOfSpeech}` : ''}
                            </Text>
                          ) : null}
                        </VStack>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-9 w-9 rounded-xl bg-accent"
                          onPress={() => speakAsLeo(`${w.term}. ${w.example ?? ''}`)}
                          accessibilityLabel={`Listen to ${w.term}`}
                        >
                          <Volume2 size={17} color="#1055F8" />
                        </Button>
                      </HStack>
                      <Text size="sm" bold className="text-emerald-700">
                        {w.meaning}
                      </Text>
                      {w.example ? (
                        <Text size="xs" italic className="text-muted-foreground">
                          &ldquo;{w.example}&rdquo;
                        </Text>
                      ) : null}
                    </VStack>
                  </Box>
                ))}
              </Card>
            </VStack>
          ) : null}

          {lesson.exercises.length > 1 ? (
            <VStack space="sm">
              <Heading size="md" className="text-foreground">
                Exercises
              </Heading>
              <Card className="p-0 overflow-hidden">
                {lesson.exercises.map((ex, idx) => (
                  <Box key={ex.id}>
                    {idx > 0 ? <Divider className="bg-border" /> : null}
                    <Pressable
                      onPress={() => void handleStartQuiz(idx)}
                      className="p-3.5 active:bg-accent/50"
                    >
                      <HStack className="items-center justify-between" space="sm">
                        <VStack className="flex-1 min-w-0">
                          <Text size="sm" bold className="text-foreground">
                            {ex.title}
                          </Text>
                          <Text size="xs" className="text-muted-foreground">
                            {ex.questions.length} questions · Max {ex.maxScore} pts
                          </Text>
                        </VStack>
                        <ChevronRight size={17} color="#94A3B8" />
                      </HStack>
                    </Pressable>
                  </Box>
                ))}
              </Card>
            </VStack>
          ) : null}
        </ScrollView>

        <Box className="px-4 py-3 bg-card border-t-2 border-border">
          <Button
            size="lg"
            variant="success"
            className="w-full"
            onPress={() => void handleStartQuiz(0)}
          >
            <ButtonIcon as={Play} className="text-white" />
            <ButtonText>
              {activeExercise
                ? `Start Quiz  ·  ${activeExercise.questions.length} Questions`
                : 'Mark Lesson Complete'}
            </ButtonText>
          </Button>
        </Box>
      </SafeAreaView>
    );
  }

  // PHASE 2: INTERACTIVE LIVE EXERCISE PLAYER (Duolingo 3D Gluestack Parity + KeyboardAvoidingView)
  const orderItems = currentQuestion?.data.items ?? [];
  const orderTiles = orderItems.map((it) => it.text);
  const progressPct = Math.round(((qIdx + 1) / Math.max(1, questions.length)) * 100);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ConfettiBurst triggerKey={confettiKey} intensity="small" />

      <HStack className="items-center px-4 py-2.5 bg-card border-b border-border" space="sm">
        <Button
          size="icon"
          variant="secondary"
          className="h-9 w-9 rounded-full"
          onPress={() => {
            stopAudioRef.current?.();
            setPhase('study');
          }}
        >
          <X size={18} color="#0F172A" />
        </Button>

        <Box className="flex-1">
          <Progress value={progressPct} className="h-4">
            <ProgressFilledTrack className="bg-success" />
          </Progress>
        </Box>

        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 rounded-full"
          onPress={() => {
            if (soundEnabled) stopAudioRef.current?.();
            setSoundEnabled(!soundEnabled);
          }}
        >
          {soundEnabled ? (
            <Volume2 size={16} color="#1055F8" />
          ) : (
            <VolumeX size={16} color="#64748B" />
          )}
        </Button>

        <Badge className="rounded-full bg-accent border-0 px-2.5 py-1">
          <BadgeText className="text-primary font-extrabold normal-case">
            {qIdx + 1}/{Math.max(1, questions.length)}
          </BadgeText>
        </Badge>
      </HStack>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 28, gap: 16 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
        >
        {submitError ? (
          <Alert variant="destructive" className="rounded-xl bg-red-50 border-red-200 p-3">
            <AlertIcon as={AlertCircle} className="text-destructive" />
            <AlertText className="text-destructive text-xs font-semibold">
              {submitError}
            </AlertText>
          </Alert>
        ) : null}

        {currentQuestion ? (
          <>
            {/* Question Prompt Card */}
            <Card className="p-4">
              <HStack className="items-start" space="md">
                <Center className="w-16 h-16 rounded-2xl bg-accent">
                  <LeoMascot pose={canAdvance ? 'cheer' : 'think'} size={58} />
                </Center>
                <VStack className="flex-1 min-w-0" space="xs">
                  <HStack className="items-center justify-between">
                    <Badge className="rounded-full bg-accent border-0 px-2.5 py-0.5">
                      <BadgeText className="text-primary text-[10px] font-bold">
                        {currentQuestion.type === 'ORDER'
                          ? 'Sentence Builder'
                          : currentQuestion.type === 'TRUE_FALSE'
                            ? 'True or False'
                            : currentQuestion.type === 'MULTI_CHOICE'
                              ? 'Pick All That Fit'
                              : 'Quiz Challenge'}
                      </BadgeText>
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-lg"
                      onPress={() => speakAsLeo(currentQuestion.prompt)}
                    >
                      <Volume2 size={16} color="#1055F8" />
                    </Button>
                  </HStack>

                  <Heading size="md" className="text-foreground leading-6">
                    {currentQuestion.prompt}
                  </Heading>

                  {currentQuestion.data.hint ? (
                    <Text size="xs" className="text-muted-foreground">
                      Hint: {currentQuestion.data.hint}
                    </Text>
                  ) : null}
                </VStack>
              </HStack>
            </Card>

            {/* SINGLE_CHOICE & MULTI_CHOICE (Clean Gluestack Option Cards) */}
            {currentQuestion.type === 'SINGLE_CHOICE' ||
            currentQuestion.type === 'MULTI_CHOICE' ? (
              <VStack space="sm">
                {(currentQuestion.data.options ?? []).map((opt, idx) => {
                  const isMulti = currentQuestion.type === 'MULTI_CHOICE';
                  const isSel = isMulti
                    ? selectedMulti.includes(opt.id)
                    : selectedChoice === opt.id;

                  return (
                    <Pressable
                      key={opt.id}
                      onPress={() => {
                        playTileTapSound(undefined, soundEnabled);
                        if (isMulti) {
                          setSelectedMulti((prev) =>
                            prev.includes(opt.id)
                              ? prev.filter((id) => id !== opt.id)
                              : [...prev, opt.id]
                          );
                        } else {
                          setSelectedChoice(opt.id);
                        }
                      }}
                    >
                      <Card
                        variant={isSel ? 'selected' : 'default'}
                        className="p-3.5"
                      >
                        <HStack className="items-center" space="md">
                          <Center
                            className={`w-9 h-9 rounded-xl border-2 border-b-[3px] ${
                              isSel
                                ? 'bg-primary border-primary border-b-primary-lip'
                                : 'bg-secondary border-border border-b-lip'
                            }`}
                          >
                            {isSel ? (
                              <Check size={15} color="#FFFFFF" strokeWidth={3} />
                            ) : (
                              <Text size="xs" bold className="text-muted-foreground">
                                {String.fromCharCode(65 + idx)}
                              </Text>
                            )}
                          </Center>
                          <Text
                            size="md"
                            bold={isSel}
                            className={`flex-1 ${
                              isSel ? 'text-primary' : 'text-foreground'
                            }`}
                          >
                            {opt.text}
                          </Text>
                        </HStack>
                      </Card>
                    </Pressable>
                  );
                })}
              </VStack>
            ) : null}

            {/* TRUE_FALSE (Clean Gluestack Cards) */}
            {currentQuestion.type === 'TRUE_FALSE' ? (
              <HStack space="sm">
                {[
                  { label: 'True', val: true },
                  { label: 'False', val: false },
                ].map((choice) => {
                  const isSel = selectedBool === choice.val;
                  return (
                    <Pressable
                      key={choice.label}
                      className="flex-1"
                      onPress={() => {
                        playTileTapSound(choice.label, soundEnabled);
                        setSelectedBool(choice.val);
                      }}
                    >
                      <Card
                        variant={isSel ? 'selected' : 'default'}
                        className="py-6 items-center justify-center"
                      >
                        <Heading
                          size="lg"
                          className={isSel ? 'text-primary' : 'text-foreground'}
                        >
                          {choice.label}
                        </Heading>
                      </Card>
                    </Pressable>
                  );
                })}
              </HStack>
            ) : null}

            {/* ORDER — Clean Gluestack Sentence Builder */}
            {currentQuestion.type === 'ORDER' ? (
              <VStack space="md">
                <Card className="p-4 min-h-[112px]">
                  <HStack className="items-center justify-between mb-3">
                    <Text size="xs" bold className="text-muted-foreground uppercase">
                      Your Sentence
                    </Text>
                    {selectedOrderIndices.length > 0 ? (
                      <Button
                        variant="link"
                        size="sm"
                        className="px-0 h-auto"
                        onPress={() => setSelectedOrderIndices([])}
                      >
                        <ButtonIcon as={RotateCcw} className="text-muted-foreground" />
                        <ButtonText className="text-xs text-muted-foreground font-semibold">
                          Clear
                        </ButtonText>
                      </Button>
                    ) : null}
                  </HStack>

                  {selectedOrderIndices.length > 0 ? (
                    <Box className="flex-row flex-wrap gap-2">
                      {selectedOrderIndices.map((tileIdx) => (
                        <Button
                          key={`picked-${tileIdx}`}
                          size="sm"
                          variant="default"
                          className="min-h-10 px-4"
                          onPress={() => {
                            playTileTapSound(undefined, soundEnabled);
                            setSelectedOrderIndices((prev) =>
                              prev.filter((i) => i !== tileIdx)
                            );
                          }}
                        >
                          <ButtonText className="normal-case text-sm font-bold">
                            {orderTiles[tileIdx]}
                          </ButtonText>
                        </Button>
                      ))}
                    </Box>
                  ) : (
                    <Center className="py-4">
                      <Text size="sm" className="text-muted-foreground">
                        Tap the words below in the correct order
                      </Text>
                    </Center>
                  )}
                </Card>

                <Box className="flex-row flex-wrap gap-2 justify-center">
                  {orderTiles.map((word, idx) => {
                    const used = selectedOrderIndices.includes(idx);
                    return (
                      <Button
                        key={`bank-${idx}-${word}`}
                        size="sm"
                        variant="outline"
                        isDisabled={used}
                        className={`min-h-11 px-4 ${
                          used ? 'bg-secondary border-border border-b-2 opacity-35' : ''
                        }`}
                        onPress={() => {
                          playTileTapSound(word, soundEnabled);
                          setSelectedOrderIndices((prev) => [...prev, idx]);
                        }}
                      >
                        <ButtonText className="normal-case text-foreground font-bold text-sm">
                          {word}
                        </ButtonText>
                      </Button>
                    );
                  })}
                </Box>
              </VStack>
            ) : null}

            {/* TEXT / NUMERIC / ESSAY (Gluestack Input / Textarea) */}
            {currentQuestion.type !== 'SINGLE_CHOICE' &&
            currentQuestion.type !== 'MULTI_CHOICE' &&
            currentQuestion.type !== 'TRUE_FALSE' &&
            currentQuestion.type !== 'ORDER' ? (
              <Card className="p-4">
                {currentQuestion.type === 'ESSAY' ? (
                  <Textarea className="min-h-[132px]">
                    <TextareaInput
                      value={textAnswer}
                      onChangeText={setTextAnswer}
                      placeholder="Write your answer here..."
                    />
                  </Textarea>
                ) : (
                  <Input>
                    <InputField
                      value={textAnswer}
                      onChangeText={setTextAnswer}
                      placeholder="Type your answer here..."
                      keyboardType={
                        currentQuestion.type === 'NUMERIC' ? 'decimal-pad' : 'default'
                      }
                    />
                  </Input>
                )}
              </Card>
            ) : null}
          </>
        ) : null}
        </ScrollView>

        <Box className="px-4 py-3 bg-card border-t-2 border-border">
          <Button
            size="lg"
            variant={qIdx + 1 === questions.length ? 'success' : 'default'}
            isDisabled={!canAdvance || submitting}
            className="w-full"
            onPress={() => void handleNextOrSubmit()}
          >
            {submitting ? <ButtonSpinner color="#FFFFFF" /> : null}
            <ButtonText>
              {submitting
                ? 'Leo is checking...'
                : qIdx + 1 === questions.length
                  ? 'Submit & See Score'
                  : 'Next Question'}
            </ButtonText>
          </Button>
        </Box>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
