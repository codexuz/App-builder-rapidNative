import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  BookOpen,
  Check,
  Headphones,
  Mic,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ConfettiBurst,
  FeedbackBottomSheet,
  GameButton,
  MascotChatBubble,
  ProgressBar,
  SentenceBuilderStage,
  SoundWaveVisualizer,
  VictoryCelebration,
  speakEnglishText,
} from '@/components/game';
import { AnimatedPressable, Badge, Card } from '@/components/ui';
import { RegionPalette, useAppTheme } from '@/constants/Theme';
import { getCityById, getLessonById } from '@/data/worldData';
import { useGame, type LessonCompletionSummary } from '@/store/GameContext';
import type { LessonStageType } from '@/types/game';
import {
  playCorrectFeedback,
  playTileTapSound,
  playVictoryFeedback,
  playWrongFeedback,
} from '@/utils/soundFeedback';

const STAGE_META: Record<LessonStageType, { label: string; pipHint: string }> = {
  vocabulary: { label: 'Vocabulary', pipHint: 'Tap the speaker to hear each new word!' },
  grammar: { label: 'Grammar', pipHint: 'Spot the pattern and unlock the rule!' },
  listening: { label: 'Listening', pipHint: 'Listen closely to our local guide!' },
  reading: { label: 'Reading', pipHint: 'Read the clue card to find the answer!' },
  speaking: { label: 'Speaking', pipHint: 'Say it loud and proud — you have got this!' },
  interactive: { label: 'Sentence Builder', pipHint: 'Tap the word tiles in order!' },
};

export default function LessonExpeditionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { colors, typography, radii } = useAppTheme();
  const { player, completeLesson } = useGame();

  const lesson = useMemo(
    () => getLessonById(typeof params.id === 'string' ? params.id : ''),
    [params.id]
  );
  const city = lesson ? getCityById(lesson.cityId) : undefined;
  const palette = lesson ? RegionPalette[lesson.level] : RegionPalette.A1;

  const [stageIndex, setStageIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  // Listening state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const stopAudioRef = useRef<(() => void) | null>(null);

  // Speaking state
  const [isRecording, setIsRecording] = useState(false);
  const [speakingScore, setSpeakingScore] = useState<number | null>(null);

  // Interactive tile builder state
  const [selectedTileIndices, setSelectedTileIndices] = useState<number[]>([]);

  // Completion & celebration state
  const [summary, setSummary] = useState<LessonCompletionSummary | null>(null);
  const [confettiKey, setConfettiKey] = useState(0);
  const [confettiIntensity, setConfettiIntensity] = useState<'small' | 'grand'>('small');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPipSpeaking, setIsPipSpeaking] = useState(false);

  const triggerConfetti = (intensity: 'small' | 'grand') => {
    setConfettiIntensity(intensity);
    setConfettiKey((k) => k + 1);
  };

  useEffect(() => {
    return () => {
      stopAudioRef.current?.();
    };
  }, []);

  if (!lesson) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.missingWrap}>
          <Text style={[typography.title1, { color: colors.textPrimary }]}>
            Expedition Not Found
          </Text>
          <GameButton label="Back to World Map" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const totalStages = lesson.stages.length;
  const stage = lesson.stages[stageIndex];

  const resetStageInputs = () => {
    stopAudioRef.current?.();
    setSelectedOption(null);
    setChecked(false);
    setIsCorrect(false);
    setIsPlayingAudio(false);
    setIsPipSpeaking(false);
    setShowTranscript(false);
    setIsRecording(false);
    setSpeakingScore(null);
    setSelectedTileIndices([]);
  };

  const playVoice = (text: string) => {
    stopAudioRef.current?.();
    setIsPlayingAudio(true);
    stopAudioRef.current = speakEnglishText(text, () => setIsPlayingAudio(false));
  };

  const speakAsPip = (text: string) => {
    if (!soundEnabled) return;
    stopAudioRef.current?.();
    setIsPipSpeaking(true);
    stopAudioRef.current = speakEnglishText(text, () => setIsPipSpeaking(false));
  };

  const handleCheck = () => {
    if (stage.type === 'vocabulary' || stage.type === 'grammar' || stage.type === 'listening' || stage.type === 'reading') {
      if (selectedOption === null) return;
      const right = selectedOption === stage.correctIndex;
      setChecked(true);
      setIsCorrect(right);
      if (right) {
        setCorrectCount((c) => c + 1);
        triggerConfetti('small');
        playCorrectFeedback(soundEnabled);
      } else {
        playWrongFeedback(soundEnabled);
      }
      return;
    }

    if (stage.type === 'interactive') {
      const built = selectedTileIndices.map((idx) => stage.tiles[idx]).join(' ').trim();
      const right = built.toLowerCase() === stage.correctSentence.toLowerCase();
      setChecked(true);
      setIsCorrect(right);
      if (right) {
        setCorrectCount((c) => c + 1);
        triggerConfetti('small');
        playCorrectFeedback(soundEnabled);
      } else {
        playWrongFeedback(soundEnabled);
      }
    }
  };

  const handleRecordSpeak = () => {
    if (isRecording) return;
    setIsRecording(true);
    setSpeakingScore(null);
    setTimeout(() => {
      setIsRecording(false);
      const score = 92 + Math.floor(Math.random() * 7);
      setSpeakingScore(score);
      setChecked(true);
      setIsCorrect(true);
      setCorrectCount((c) => c + 1);
      triggerConfetti('small');
      playCorrectFeedback(soundEnabled);
    }, 1700);
  };

  const handleNext = () => {
    if (stageIndex + 1 < totalStages) {
      setStageIndex((i) => i + 1);
      resetStageInputs();
    } else {
      const accuracy = Math.round((correctCount / totalStages) * 100);
      const result = completeLesson(lesson.id, Math.max(60, Math.min(100, accuracy)));
      setSummary(result);
      triggerConfetti('grand');
      playVictoryFeedback(soundEnabled);
    }
  };

  const toggleTile = (tileIdx: number) => {
    if (checked) return;
    const isAdding = !selectedTileIndices.includes(tileIdx);
    if (stage.type === 'interactive') {
      playTileTapSound(isAdding ? stage.tiles[tileIdx] : undefined, soundEnabled);
    }
    setSelectedTileIndices((prev) =>
      prev.includes(tileIdx) ? prev.filter((i) => i !== tileIdx) : [...prev, tileIdx]
    );
  };

  if (summary) {
    const cityLessonIds = city?.lessons.map((l) => l.id) ?? [lesson.id];
    const cityCompletedCount = cityLessonIds.filter(
      (lid) => lid === lesson.id || player.completedLessonIds.includes(lid)
    ).length;

    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <VictoryCelebration
          lessonTitle={lesson.title}
          cityName={city?.name ?? 'Impulse World'}
          cityCompletedCount={cityCompletedCount}
          cityTotalCount={cityLessonIds.length}
          summary={summary}
          accentColor={palette.primary}
          deepColor={palette.deep}
          confettiKey={confettiKey}
          onClaimAndExit={() => router.back()}
          onPracticeAgain={() => {
            setSummary(null);
            setStageIndex(0);
            setCorrectCount(0);
            resetStageInputs();
          }}
        />
      </SafeAreaView>
    );
  }

  const canCheck =
    stage.type === 'speaking'
      ? false
      : stage.type === 'interactive'
        ? selectedTileIndices.length > 0
        : selectedOption !== null;

  const pipBubbleMessage =
    stage.type === 'interactive'
      ? stage.instruction
      : stage.type === 'speaking'
        ? stage.context
        : STAGE_META[stage.type].pipHint;

  const pipBubbleHint =
    stage.type === 'interactive' ? stage.promptHint : undefined;

  const pipSpeechText =
    stage.type === 'interactive'
      ? `${stage.instruction}. ${stage.promptHint}`
      : stage.type === 'speaking'
        ? `${stage.context}. ${stage.targetPhrase}`
        : `${stage.title}. ${STAGE_META[stage.type].pipHint}`;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ConfettiBurst triggerKey={confettiKey} intensity={confettiIntensity} />
      {/* Top Expedition Progress Header */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => {
            stopAudioRef.current?.();
            router.back();
          }}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Exit lesson"
          style={[styles.closeBtn, { backgroundColor: colors.surfaceMuted }]}
        >
          <X size={20} color={colors.textPrimary} />
        </Pressable>

        <View style={styles.progressWrap}>
          <ProgressBar
            progress={(stageIndex + (checked ? 1 : 0.35)) / totalStages}
            color={palette.primary}
            height={14}
          />
        </View>

        <Pressable
          onPress={() => {
            if (soundEnabled) stopAudioRef.current?.();
            setSoundEnabled((v) => !v);
          }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={soundEnabled ? 'Mute voice and sound effects' : 'Unmute voice and sound effects'}
          style={[styles.soundToggleBtn, { backgroundColor: colors.surfaceMuted }]}
        >
          {soundEnabled ? (
            <Volume2 size={17} color={palette.primary} />
          ) : (
            <VolumeX size={17} color={colors.textTertiary} />
          )}
        </Pressable>

        <Badge label={`${stageIndex + 1}/${totalStages}`} tone="accent" />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.stageScroll,
          checked ? styles.stageScrollWithSheet : null,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stageHeader}>
          <Text style={[typography.title1, { color: colors.textPrimary }]}>{stage.title}</Text>
          <MascotChatBubble
            eyebrow={`${lesson.level} · ${STAGE_META[stage.type].label}`}
            message={pipBubbleMessage}
            subHint={pipBubbleHint}
            accentColor={palette.primary}
            softAccentColor={palette.soft}
            isSpeaking={isPipSpeaking}
            onSpeakPress={() => speakAsPip(pipSpeechText)}
          />
        </View>

        {/* 1. VOCABULARY STAGE */}
        {stage.type === 'vocabulary' ? (
          <View style={styles.stageBody}>
            {stage.words.map((item) => (
              <Card key={item.word} style={styles.vocabCard}>
                <View style={styles.vocabTop}>
                  <View style={styles.vocabWordCol}>
                    <Text style={[typography.title2, { color: colors.textPrimary }]}>
                      {item.word}
                    </Text>
                    <Text style={[typography.caption, { color: colors.textTertiary }]}>
                      {item.phonetic} · {item.partOfSpeech}
                    </Text>
                  </View>
                  <AnimatedPressable
                    onPress={() => playVoice(`${item.word}. ${item.example}`)}
                    style={[styles.audioIconBtn, { backgroundColor: palette.soft }]}
                    accessibilityLabel={`Listen to ${item.word}`}
                  >
                    <Volume2 size={18} color={palette.primary} />
                  </AnimatedPressable>
                </View>
                <Text style={[typography.body, { color: colors.textPrimary }]}>
                  {item.definition}
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary, fontStyle: 'italic' }]}>
                  "{item.example}"
                </Text>
              </Card>
            ))}

            <Text style={[typography.headline, { color: colors.textPrimary, marginTop: 6 }]}>
              {stage.checkPrompt}
            </Text>
            <OptionList
              options={stage.options}
              selected={selectedOption}
              correctIndex={stage.correctIndex}
              checked={checked}
              accent={palette.primary}
              onSelect={setSelectedOption}
            />
          </View>
        ) : null}

        {/* 2. GRAMMAR STAGE */}
        {stage.type === 'grammar' ? (
          <View style={styles.stageBody}>
            <Card variant="muted" style={styles.ruleCard}>
              <View style={styles.ruleHeader}>
                <BookOpen size={17} color={palette.primary} />
                <Text style={[typography.headline, { color: colors.textPrimary, flex: 1 }]}>
                  {stage.ruleHeadline}
                </Text>
              </View>
              <Text style={[typography.body, { color: colors.textSecondary }]}>
                {stage.ruleSummary}
              </Text>
            </Card>

            <Text style={[typography.title2, { color: colors.textPrimary }]}>{stage.prompt}</Text>
            <OptionList
              options={stage.options}
              selected={selectedOption}
              correctIndex={stage.correctIndex}
              checked={checked}
              accent={palette.primary}
              onSelect={setSelectedOption}
            />
          </View>
        ) : null}

        {/* 3. LISTENING STAGE */}
        {stage.type === 'listening' ? (
          <View style={styles.stageBody}>
            <Card style={styles.audioPlayerCard}>
              <View style={styles.speakerRow}>
                <View style={[styles.speakerIcon, { backgroundColor: palette.soft }]}>
                  <Headphones size={20} color={palette.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.headline, { color: colors.textPrimary }]}>
                    {stage.speakerName}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    {stage.speakerRole}
                  </Text>
                </View>
                <GameButton
                  label={isPlayingAudio ? 'Playing...' : 'Listen'}
                  size="md"
                  fullWidth={false}
                  color={palette.primary}
                  depthColor={palette.deep}
                  icon={<Volume2 size={16} color="#FFFFFF" />}
                  onPress={() => playVoice(stage.audioScript)}
                />
              </View>

              <SoundWaveVisualizer active={isPlayingAudio} color={palette.primary} />

              <Pressable
                onPress={() => setShowTranscript((v) => !v)}
                style={styles.transcriptToggle}
              >
                <Text style={[typography.caption, { color: palette.primary }]}>
                  {showTranscript ? 'Hide Transcript' : 'Need a hint? Show Transcript'}
                </Text>
              </Pressable>

              {showTranscript ? (
                <Text style={[typography.body, { color: colors.textSecondary }]}>
                  "{stage.audioScript}"
                </Text>
              ) : null}
            </Card>

            <Text style={[typography.headline, { color: colors.textPrimary }]}>
              {stage.question}
            </Text>
            <OptionList
              options={stage.options}
              selected={selectedOption}
              correctIndex={stage.correctIndex}
              checked={checked}
              accent={palette.primary}
              onSelect={setSelectedOption}
            />
          </View>
        ) : null}

        {/* 4. READING STAGE */}
        {stage.type === 'reading' ? (
          <View style={styles.stageBody}>
            <Card style={styles.readingCard}>
              <Text style={[typography.headline, { color: palette.primary }]}>
                {stage.passageTitle}
              </Text>
              <Text style={[typography.body, { color: colors.textPrimary, lineHeight: 24 }]}>
                {stage.passage}
              </Text>
            </Card>

            <Text style={[typography.headline, { color: colors.textPrimary }]}>
              {stage.question}
            </Text>
            <OptionList
              options={stage.options}
              selected={selectedOption}
              correctIndex={stage.correctIndex}
              checked={checked}
              accent={palette.primary}
              onSelect={setSelectedOption}
            />
          </View>
        ) : null}

        {/* 5. SPEAKING STAGE */}
        {stage.type === 'speaking' ? (
          <View style={styles.stageBody}>
            <Text style={[typography.body, { color: colors.textSecondary }]}>{stage.context}</Text>

            <Card style={styles.speakCard}>
              <Text style={[typography.title2, { color: colors.textPrimary }]}>
                "{stage.targetPhrase}"
              </Text>
              <Text style={[typography.caption, { color: colors.textTertiary }]}>
                {stage.phoneticGuide}
              </Text>
              <Pressable
                onPress={() => playVoice(stage.targetPhrase)}
                style={[styles.hearModelBtn, { backgroundColor: palette.soft, borderRadius: radii.pill }]}
              >
                <Volume2 size={15} color={palette.primary} />
                <Text style={[typography.caption, { color: palette.primary }]}>
                  Hear model pronunciation
                </Text>
              </Pressable>
            </Card>

            <Card variant="muted" style={styles.tipsCard}>
              {stage.tips.map((tip, idx) => (
                <Text key={idx} style={[typography.caption, { color: colors.textSecondary }]}>
                  • {tip}
                </Text>
              ))}
            </Card>

            <View style={styles.micZone}>
              <SoundWaveVisualizer active={isRecording} color={palette.primary} />
              <GameButton
                label={
                  isRecording
                    ? 'Listening to your voice...'
                    : speakingScore
                      ? `Fluency ${speakingScore}% · Try Again`
                      : 'Tap to Speak Aloud'
                }
                color={isRecording ? colors.streak : palette.primary}
                depthColor={isRecording ? '#9A3412' : palette.deep}
                icon={<Mic size={18} color="#FFFFFF" />}
                onPress={handleRecordSpeak}
              />
            </View>
          </View>
        ) : null}

        {/* 6. INTERACTIVE SENTENCE BUILDER STAGE (Duolingo notebook lines + 3D word buttons) */}
        {stage.type === 'interactive' ? (
          <SentenceBuilderStage
            tiles={stage.tiles}
            selectedTileIndices={selectedTileIndices}
            checked={checked}
            isCorrect={isCorrect}
            accentColor={palette.primary}
            deepColor={palette.deep}
            onToggleTile={toggleTile}
            onClear={() => setSelectedTileIndices([])}
          />
        ) : null}
      </ScrollView>

      {/* Bottom Sticky Action Footer (hidden while Duolingo FeedbackBottomSheet is open) */}
      {!checked ? (
        <View
          style={[
            styles.footer,
            { backgroundColor: colors.surface, borderTopColor: colors.border },
          ]}
        >
          {stage.type === 'speaking' ? (
            <GameButton
              label="Skip Speaking for Now"
              color={colors.surfaceMuted}
              depthColor={colors.borderStrong}
              textColor={colors.textPrimary}
              onPress={() => {
                setSpeakingScore(80);
                setChecked(true);
                setIsCorrect(true);
                setCorrectCount((c) => c + 1);
                playCorrectFeedback(soundEnabled);
              }}
            />
          ) : (
            <GameButton
              label="Check Answer"
              disabled={!canCheck}
              color={palette.primary}
              depthColor={palette.deep}
              onPress={handleCheck}
            />
          )}
        </View>
      ) : null}

      {/* Duolingo-Style Sliding Feedback Bottom Sheet (includes Continue / Finish button) */}
      <FeedbackBottomSheet
        visible={checked}
        isCorrect={isCorrect}
        headline={
          stage.type === 'speaking'
            ? `Great pacing! Fluency ${speakingScore}%`
            : isCorrect
              ? 'Spot on!'
              : 'Not quite — try this!'
        }
        correctSolution={
          !isCorrect
            ? stage.type === 'interactive'
              ? stage.correctSentence
              : 'options' in stage && 'correctIndex' in stage
                ? stage.options[stage.correctIndex]
                : undefined
            : undefined
        }
        detail={'explanation' in stage ? stage.explanation : undefined}
        buttonLabel={
          stageIndex + 1 === totalStages
            ? 'Finish Expedition'
            : isCorrect
              ? 'Continue'
              : 'Got It'
        }
        onContinue={handleNext}
        onReplayVoice={
          stage.type === 'interactive'
            ? () => speakAsPip(stage.correctSentence)
            : stage.type === 'speaking'
              ? () => speakAsPip(stage.targetPhrase)
              : 'explanation' in stage
                ? () => speakAsPip(stage.explanation)
                : undefined
        }
      />
    </SafeAreaView>
  );
}

function OptionList({
  options,
  selected,
  correctIndex,
  checked,
  accent,
  onSelect,
}: {
  options: string[];
  selected: number | null;
  correctIndex: number;
  checked: boolean;
  accent: string;
  onSelect: (index: number) => void;
}) {
  const { colors, typography } = useAppTheme();

  return (
    <View style={styles.optionsCol}>
      {options.map((opt, idx) => {
        const isSelected = selected === idx;
        const isRight = checked && idx === correctIndex;
        const isWrong = checked && isSelected && idx !== correctIndex;

        const bg = isRight
          ? '#D7FFB8'
          : isWrong
            ? '#FFDFE0'
            : isSelected
              ? '#DDF4FF'
              : colors.surface;

        const borderColor = isRight
          ? '#58CC02'
          : isWrong
            ? '#FF4B4B'
            : isSelected
              ? '#1CB0F6'
              : '#CBD5E1';

        const lipColor = isRight
          ? '#46A302'
          : isWrong
            ? '#EA2B2B'
            : isSelected
              ? '#1899D6'
              : '#94A3B8';

        const keycapBg = isRight
          ? '#58CC02'
          : isWrong
            ? '#FF4B4B'
            : isSelected
              ? '#1CB0F6'
              : '#F8FAFC';

        const keycapBorder = isRight
          ? '#46A302'
          : isWrong
            ? '#EA2B2B'
            : isSelected
              ? '#1899D6'
              : '#CBD5E1';

        const labelColor = isRight
          ? '#2E6B00'
          : isWrong
            ? '#CC1D1D'
            : isSelected
              ? '#0369A1'
              : colors.textPrimary;

        return (
          <AnimatedPressable
            key={opt}
            disabled={checked}
            onPress={() => {
              playTileTapSound(undefined, true);
              onSelect(idx);
            }}
            haptic="selection"
            style={[
              styles.optionBtn,
              {
                backgroundColor: bg,
                borderColor,
                borderBottomColor: lipColor,
              },
            ]}
          >
            <View
              style={[
                styles.optionIndex,
                {
                  backgroundColor: keycapBg,
                  borderColor: keycapBorder,
                  borderBottomColor: keycapBorder,
                },
              ]}
            >
              {isRight ? (
                <Check size={15} color="#FFFFFF" strokeWidth={3} />
              ) : isWrong ? (
                <X size={15} color="#FFFFFF" strokeWidth={3} />
              ) : (
                <Text
                  style={{
                    color: isSelected ? '#FFFFFF' : '#64748B',
                    fontSize: 12.5,
                    fontWeight: '900',
                  }}
                >
                  {String.fromCharCode(65 + idx)}
                </Text>
              )}
            </View>
            <Text
              style={[
                typography.body,
                {
                  color: labelColor,
                  fontWeight: isRight || isWrong || isSelected ? '800' : '600',
                  flex: 1,
                },
              ]}
            >
              {opt}
            </Text>
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  missingWrap: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundToggleBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressWrap: {
    flex: 1,
  },
  stageScroll: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    gap: 16,
  },
  stageScrollWithSheet: {
    paddingBottom: 230,
  },
  stageHeader: {
    gap: 12,
  },
  pipBubbleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pipCutoutWrap: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pipAvatar: {
    width: 56,
    height: 56,
  },
  pipSpeech: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1.25,
    gap: 2,
  },
  stageBody: {
    gap: 14,
  },
  vocabCard: {
    gap: 6,
  },
  vocabTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  vocabWordCol: {
    flex: 1,
    gap: 2,
  },
  audioIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleCard: {
    gap: 8,
  },
  ruleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  audioPlayerCard: {
    gap: 14,
  },
  speakerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  speakerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transcriptToggle: {
    alignSelf: 'flex-start',
  },
  readingCard: {
    gap: 10,
  },
  speakCard: {
    gap: 10,
  },
  hearModelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  tipsCard: {
    gap: 6,
  },
  micZone: {
    gap: 14,
    paddingTop: 6,
  },
  builderHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sentenceTray: {
    minHeight: 74,
    justifyContent: 'center',
  },
  clearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 5,
  },
  tilesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wordTile: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
  },
  wordTileSelectedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  optionsCol: {
    gap: 12,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 16,
    borderWidth: 2,
    borderBottomWidth: 5,
    gap: 12,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  optionIndex: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 1.5,
    borderBottomWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackBanner: {
    gap: 6,
    borderWidth: 1.5,
  },
  feedbackTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  victoryScroll: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18,
  },
  trophyCircle: {
    width: 132,
    height: 132,
    borderRadius: 36,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  victoryChestImg: {
    width: '100%',
    height: '100%',
  },
  victoryStats: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  victoryTile: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 16,
  },
  unlockCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
});
