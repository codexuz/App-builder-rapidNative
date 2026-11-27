import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  BookOpen,
  Check,
  ChevronRight,
  Play,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ConfettiBurst,
  GameButton,
  MascotChatBubble,
  ProgressBar,
  SentenceBuilderStage,
  VictoryCelebration,
  speakEnglishText,
  type VictorySummaryData,
} from '@/components/game';
import { LeoMascot } from '@/components/mascot/LeoMascot';
import { AnimatedPressable, Badge, Card } from '@/components/ui';
import { DS } from '@/constants/DesignSystem';
import { useAppTheme } from '@/constants/Theme';
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

/**
 * 100% Live Backend Impulse Kids Lesson & Interactive Exercise Player:
 * - Loads GET /lms/lessons/:id?studentId=...
 * - Phase 1 (study): Theory & Magic Words with Leo voice playback + exercise selector
 * - Phase 2 (play): Interactive Duolingo-style question runner (SINGLE_CHOICE, MULTI_CHOICE,
 *   TRUE_FALSE, ORDER Sentence Builder, TEXT/NUMERIC/ESSAY) wired to POST /lms/exercises/:id/start
 *   and POST /lms/exercises/:id/submit
 * - Phase 3 (victory): Server-graded AttemptResult inside 3D Leo VictoryCelebration
 * - Phase 4 (review): Full per-question server grading review when answersShown is enabled
 */
export default function KidsLessonScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { colors, typography, radii } = useAppTheme();
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
  const [victory, setVictory] = useState<VictorySummaryData | null>(null);

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

    // Final question -> submit to live backend POST /lms/exercises/:id/submit
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
        maxScoreNum > 0 ? Math.max(0, Math.min(100, Math.round((scoreNum / maxScoreNum) * 100))) : 100;

      const allLessons = parentCourse?.units.flatMap((u) => u.lessons) ?? [];
      const curPos = allLessons.findIndex((l) => l.id === lessonId);
      const nextUnlocked = curPos >= 0 ? allLessons[curPos + 1]?.title ?? null : null;

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
      <SafeAreaView style={[styles.safe, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#1055F8" />
        <Text style={[typography.callout, { color: colors.textSecondary, marginTop: 10 }]}>
          Loading lesson from Impulse...
        </Text>
      </SafeAreaView>
    );
  }

  if (loadError || !lesson) {
    return (
      <SafeAreaView style={[styles.safe, styles.center, { backgroundColor: colors.background, padding: 24 }]}>
        <LeoMascot pose="oops" size={120} />
        <Text style={[typography.title2, { color: colors.textPrimary, textAlign: 'center', marginTop: 8 }]}>
          Could Not Open Lesson
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginBottom: 16 }]}>
          {loadError ?? 'Lesson not found.'}
        </Text>
        <View style={{ width: '100%', maxWidth: 260, gap: 10 }}>
          <GameButton label="Try Again" color="#1055F8" depthColor="#0A3BB3" onPress={fetchLesson} />
          <GameButton label="Go Back" color="#64748B" depthColor="#475569" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  if (phase === 'review' && attemptResult) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => setPhase('victory')}
            style={[styles.closeBtn, { backgroundColor: colors.surfaceMuted }]}
          >
            <X size={20} color={colors.textPrimary} />
          </Pressable>
          <Text style={[typography.headline, { color: colors.textPrimary, flex: 1 }]}>
            Answer Review
          </Text>
          <Badge
            label={`${attemptResult.score ?? 0}/${attemptResult.maxScore}`}
            tone="accent"
          />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {questions.map((q, idx) => {
            const ans = attemptResult.answers.find((a) => a.questionId === q.id);
            const ok = ans?.isCorrect === true;
            return (
              <Card
                key={q.id}
                style={[
                  styles.reviewCard,
                  { borderColor: ok ? '#58CC02' : '#FF4B4B', borderWidth: 1.5 },
                ]}
              >
                <View style={styles.reviewHead}>
                  <Badge label={`Q${idx + 1}`} tone={ok ? 'success' : 'danger'} />
                  <Badge label={ok ? 'Correct' : 'Check Again'} tone={ok ? 'success' : 'danger'} />
                </View>
                <Text style={[typography.headline, { color: colors.textPrimary }]}>{q.prompt}</Text>
                {ans?.feedback ? (
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    {ans.feedback}
                  </Text>
                ) : null}
              </Card>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (phase === 'victory' && victory) {
    const allLessons = parentCourse?.units.flatMap((u) => u.lessons) ?? [];
    const completedCount = allLessons.filter(
      (l) => l.id === lessonId || l.progress?.status === 'COMPLETED'
    ).length;

    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <VictoryCelebration
          lessonTitle={lesson.title}
          courseName={parentCourse?.title ?? lesson.unit?.course?.title ?? 'Impulse Kids'}
          completedCount={completedCount}
          totalCount={Math.max(1, allLessons.length)}
          summary={victory}
          accentColor="#1055F8"
          deepColor="#0A3BB3"
          confettiKey={confettiKey}
          onClaimAndExit={() => router.back()}
          onPracticeAgain={() => {
            if (attemptResult?.answersShown) {
              setPhase('review');
            } else {
              setVictory(null);
              setPhase('study');
              resetQuestionInputs();
            }
          }}
        />
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
      <SafeAreaView style={[styles.safe, { backgroundColor: DS.colors.canvas }]}>
        <View style={[styles.topBar, { backgroundColor: DS.colors.surface, borderBottomWidth: 1, borderBottomColor: DS.colors.border }]}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.closeBtn, { backgroundColor: DS.colors.surfaceSubtle }]}
          >
            <X size={20} color={DS.colors.ink} />
          </Pressable>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={DS.type.cardTitle} numberOfLines={1}>
              {lesson.title}
            </Text>
            <Text style={DS.type.caption} numberOfLines={1}>
              {lesson.unit?.course?.title ?? 'Impulse Kids'}
            </Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <MascotChatBubble
            message={
              lesson.description ??
              'Read the lesson and listen to the new words, then start the quiz!'
            }
            pose="wave"
            accentColor={DS.colors.brand}
            softAccentColor={DS.colors.brandSoft}
            isSpeaking={isLeoSpeaking}
            onSpeakPress={() =>
              speakAsLeo(`${lesson.title}. ${lesson.description ?? ''}`)
            }
          />

          {submitError ? (
            <Card variant="muted" style={styles.errorBanner}>
              <Text style={styles.errorText}>{submitError}</Text>
            </Card>
          ) : null}

          {textBlocks.map((block) => (
            <View key={block.id} style={[DS.card, styles.theoryCard, { padding: 16 }]}>
              <View style={styles.theoryHead}>
                <BookOpen size={17} color={DS.colors.brand} />
                <Text style={DS.type.cardTitle}>Lesson Notes</Text>
              </View>
              <Text style={[DS.type.body, { lineHeight: 22 }]}>
                {(block.content.markdown ?? '').replace(/\*\*/g, '').replace(/\*/g, '')}
              </Text>
            </View>
          ))}

          {vocabItems.length > 0 ? (
            <View style={styles.vocabStack}>
              <Text style={DS.type.sectionTitle}>Vocabulary</Text>
              <View style={[DS.card, { overflow: 'hidden' }]}>
                {vocabItems.map((w, idx) => (
                  <View
                    key={w.term}
                    style={[
                      styles.vocabCard,
                      { padding: 14 },
                      idx > 0 ? { borderTopWidth: 1, borderTopColor: DS.colors.border } : null,
                    ]}
                  >
                    <View style={styles.vocabTop}>
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text style={DS.type.cardTitle}>{w.term}</Text>
                        {w.pronunciation ? (
                          <Text style={DS.type.caption}>
                            {w.pronunciation} {w.partOfSpeech ? `· ${w.partOfSpeech}` : ''}
                          </Text>
                        ) : null}
                      </View>
                      <AnimatedPressable
                        onPress={() => speakAsLeo(`${w.term}. ${w.example ?? ''}`)}
                        style={[styles.audioBtn, { backgroundColor: DS.colors.brandSoft }]}
                      >
                        <Volume2 size={18} color={DS.colors.brand} />
                      </AnimatedPressable>
                    </View>
                    <Text style={[DS.type.body, { color: DS.colors.greenInk, fontWeight: '700' }]}>
                      {w.meaning}
                    </Text>
                    {w.example ? (
                      <Text style={[DS.type.caption, { fontStyle: 'italic' }]}>
                        "{w.example}"
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {lesson.exercises.length > 1 ? (
            <View style={styles.vocabStack}>
              <Text style={[typography.title2, { color: colors.textPrimary }]}>
                Exercises
              </Text>
              {lesson.exercises.map((ex, idx) => (
                <AnimatedPressable
                  key={ex.id}
                  onPress={() => void handleStartQuiz(idx)}
                  style={[
                    styles.exPickCard,
                    { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.lg },
                  ]}
                >
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[typography.headline, { color: colors.textPrimary }]}>
                      {ex.title}
                    </Text>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      {ex.questions.length} questions · Max {ex.maxScore} pts
                    </Text>
                  </View>
                  <ChevronRight size={18} color={colors.textTertiary} />
                </AnimatedPressable>
              ))}
            </View>
          ) : null}
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <GameButton
            label={
              activeExercise
                ? `Start ${activeExercise.title} (${activeExercise.questions.length} Qs)`
                : 'Mark Lesson Complete'
            }
            color="#58CC02"
            depthColor="#46A302"
            icon={<Play size={17} color="#FFFFFF" fill="#FFFFFF" />}
            onPress={() => void handleStartQuiz(0)}
          />
        </View>
      </SafeAreaView>
    );
  }

  // PHASE 2: INTERACTIVE LIVE EXERCISE PLAYER
  const orderItems = currentQuestion?.data.items ?? [];
  const orderTiles = orderItems.map((it) => it.text);
  const progressValue = (qIdx + 1) / Math.max(1, questions.length);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ConfettiBurst triggerKey={confettiKey} intensity="small" />

      <View style={styles.topBar}>
        <Pressable
          onPress={() => {
            stopAudioRef.current?.();
            setPhase('study');
          }}
          hitSlop={10}
          style={[styles.closeBtn, { backgroundColor: colors.surfaceMuted }]}
        >
          <X size={20} color={colors.textPrimary} />
        </Pressable>

        <View style={{ flex: 1 }}>
          <ProgressBar progress={progressValue} color="#1055F8" height={14} />
        </View>

        <Pressable
          onPress={() => {
            if (soundEnabled) stopAudioRef.current?.();
            setSoundEnabled(!soundEnabled);
          }}
          style={[styles.soundBtn, { backgroundColor: colors.surfaceMuted }]}
        >
          {soundEnabled ? (
            <Volume2 size={17} color="#1055F8" />
          ) : (
            <VolumeX size={17} color={colors.textTertiary} />
          )}
        </Pressable>

        <Badge label={`${qIdx + 1}/${Math.max(1, questions.length)}`} tone="accent" />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {submitError ? (
          <Card variant="muted" style={styles.errorBanner}>
            <Text style={styles.errorText}>{submitError}</Text>
          </Card>
        ) : null}

        {currentQuestion ? (
          <>
            <MascotChatBubble
              eyebrow={
                currentQuestion.type === 'ORDER'
                  ? 'Sentence Builder'
                  : currentQuestion.type === 'TRUE_FALSE'
                    ? 'True or False'
                    : currentQuestion.type === 'MULTI_CHOICE'
                      ? 'Pick All That Fit'
                      : 'Quiz Challenge'
              }
              message={currentQuestion.prompt}
              subHint={currentQuestion.data.hint ?? undefined}
              pose={canAdvance ? 'cheer' : 'think'}
              accentColor="#1055F8"
              softAccentColor="#DBEAFE"
              isSpeaking={isLeoSpeaking}
              onSpeakPress={() => speakAsLeo(currentQuestion.prompt)}
            />

            {/* SINGLE_CHOICE & MULTI_CHOICE */}
            {currentQuestion.type === 'SINGLE_CHOICE' || currentQuestion.type === 'MULTI_CHOICE' ? (
              <View style={styles.optionsCol}>
                {(currentQuestion.data.options ?? []).map((opt, idx) => {
                  const isMulti = currentQuestion.type === 'MULTI_CHOICE';
                  const isSel = isMulti
                    ? selectedMulti.includes(opt.id)
                    : selectedChoice === opt.id;

                  const bg = isSel ? '#DDF4FF' : colors.surface;
                  const border = isSel ? '#1CB0F6' : '#CBD5E1';
                  const lip = isSel ? '#1899D6' : '#94A3B8';
                  const capBg = isSel ? '#1CB0F6' : '#F8FAFC';
                  const labelColor = isSel ? '#0369A1' : colors.textPrimary;

                  return (
                    <AnimatedPressable
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
                      style={[
                        styles.optionBtn3D,
                        { backgroundColor: bg, borderColor: border, borderBottomColor: lip },
                      ]}
                    >
                      <View
                        style={[
                          styles.optionKeycap,
                          { backgroundColor: capBg, borderColor: lip, borderBottomColor: lip },
                        ]}
                      >
                        {isSel ? (
                          <Check size={15} color="#FFFFFF" strokeWidth={3} />
                        ) : (
                          <Text style={{ color: '#64748B', fontSize: 12.5, fontWeight: '900' }}>
                            {String.fromCharCode(65 + idx)}
                          </Text>
                        )}
                      </View>
                      <Text
                        style={[
                          typography.body,
                          { color: labelColor, fontWeight: isSel ? '800' : '600', flex: 1 },
                        ]}
                      >
                        {opt.text}
                      </Text>
                    </AnimatedPressable>
                  );
                })}
              </View>
            ) : null}

            {/* TRUE_FALSE */}
            {currentQuestion.type === 'TRUE_FALSE' ? (
              <View style={styles.tfRow}>
                {[
                  { label: 'True', val: true },
                  { label: 'False', val: false },
                ].map((choice) => {
                  const isSel = selectedBool === choice.val;
                  const bg = isSel ? '#DDF4FF' : colors.surface;
                  const border = isSel ? '#1CB0F6' : '#CBD5E1';
                  const lip = isSel ? '#1899D6' : '#94A3B8';
                  const textCol = isSel ? '#0369A1' : colors.textPrimary;

                  return (
                    <AnimatedPressable
                      key={choice.label}
                      containerStyle={{ flex: 1, minWidth: 0 }}
                      onPress={() => {
                        playTileTapSound(choice.label, soundEnabled);
                        setSelectedBool(choice.val);
                      }}
                      style={[
                        styles.tfBtn3D,
                        { backgroundColor: bg, borderColor: border, borderBottomColor: lip },
                      ]}
                    >
                      <Text style={[typography.title2, { color: textCol }]}>{choice.label}</Text>
                    </AnimatedPressable>
                  );
                })}
              </View>
            ) : null}

            {/* ORDER — Notebook-Lined 3D Sentence Builder */}
            {currentQuestion.type === 'ORDER' ? (
              <SentenceBuilderStage
                tiles={orderTiles}
                selectedTileIndices={selectedOrderIndices}
                checked={false}
                isCorrect={false}
                accentColor="#1055F8"
                deepColor="#0A3BB3"
                onToggleTile={(idx) => {
                  const adding = !selectedOrderIndices.includes(idx);
                  playTileTapSound(adding ? orderTiles[idx] : undefined, soundEnabled);
                  setSelectedOrderIndices((prev) =>
                    prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
                  );
                }}
                onClear={() => setSelectedOrderIndices([])}
              />
            ) : null}

            {/* TEXT / NUMERIC / ESSAY / OTHER */}
            {currentQuestion.type !== 'SINGLE_CHOICE' &&
            currentQuestion.type !== 'MULTI_CHOICE' &&
            currentQuestion.type !== 'TRUE_FALSE' &&
            currentQuestion.type !== 'ORDER' ? (
              <Card style={styles.textInputCard}>
                <TextInput
                  value={textAnswer}
                  onChangeText={setTextAnswer}
                  placeholder="Type your answer here..."
                  placeholderTextColor={colors.textTertiary}
                  keyboardType={currentQuestion.type === 'NUMERIC' ? 'decimal-pad' : 'default'}
                  multiline={currentQuestion.type === 'ESSAY'}
                  style={[
                    styles.textInput,
                    {
                      color: colors.textPrimary,
                      borderColor: colors.borderStrong,
                      borderRadius: radii.md,
                    },
                  ]}
                />
              </Card>
            ) : null}
          </>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <GameButton
          label={
            submitting
              ? 'Leo is checking your answers...'
              : qIdx + 1 === questions.length
                ? 'Submit & See Score!'
                : 'Next Question'
          }
          disabled={!canAdvance || submitting}
          color={qIdx + 1 === questions.length ? '#58CC02' : '#1055F8'}
          depthColor={qIdx + 1 === questions.length ? '#46A302' : '#0A3BB3'}
          onPress={() => void handleNextOrSubmit()}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    gap: 16,
  },
  errorBanner: {
    backgroundColor: '#FFDFE0',
    borderColor: '#FF4B4B',
    borderWidth: 1.5,
  },
  errorText: {
    color: '#CC1D1D',
    fontSize: 13.5,
    fontWeight: '700',
  },
  theoryCard: {
    gap: 8,
  },
  theoryHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vocabStack: {
    gap: 10,
  },
  vocabCard: {
    gap: 6,
  },
  vocabTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  audioBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exPickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1.5,
    gap: 10,
  },
  optionsCol: {
    gap: 12,
  },
  optionBtn3D: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 16,
    borderWidth: 2,
    borderBottomWidth: 5,
    gap: 12,
  },
  optionKeycap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 1.5,
    borderBottomWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tfRow: {
    flexDirection: 'row',
    gap: 12,
  },
  tfBtn3D: {
    paddingVertical: 22,
    borderRadius: 18,
    borderWidth: 2,
    borderBottomWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInputCard: {
    padding: 12,
  },
  textInput: {
    borderWidth: 1.75,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  reviewCard: {
    gap: 8,
  },
  reviewHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
