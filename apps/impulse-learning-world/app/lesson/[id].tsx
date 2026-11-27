import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Coins,
  Gem,
  Headphones,
  Mic,
  Puzzle,
  RotateCcw,
  Sparkles,
  Trophy,
  Volume2,
  X,
  XCircle,
  Zap,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GameButton, ProgressBar, SoundWaveVisualizer, speakEnglishText } from '@/components/game';
import { AnimatedPressable, Badge, Card } from '@/components/ui';
import { RegionPalette, useAppTheme } from '@/constants/Theme';
import { getCityById, getLessonById } from '@/data/worldData';
import { useGame, type LessonCompletionSummary } from '@/store/GameContext';
import type { LessonStageType } from '@/types/game';

const STAGE_META: Record<LessonStageType, { label: string }> = {
  vocabulary: { label: 'Vocabulary' },
  grammar: { label: 'Grammar' },
  listening: { label: 'Listening' },
  reading: { label: 'Reading' },
  speaking: { label: 'Speaking' },
  interactive: { label: 'Sentence Builder' },
};

export default function LessonExpeditionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { colors, typography, radii } = useAppTheme();
  const { completeLesson } = useGame();

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

  // Completion state
  const [summary, setSummary] = useState<LessonCompletionSummary | null>(null);

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

  const handleCheck = () => {
    if (stage.type === 'vocabulary' || stage.type === 'grammar' || stage.type === 'listening' || stage.type === 'reading') {
      if (selectedOption === null) return;
      const right = selectedOption === stage.correctIndex;
      setChecked(true);
      setIsCorrect(right);
      if (right) setCorrectCount((c) => c + 1);
      return;
    }

    if (stage.type === 'interactive') {
      const built = selectedTileIndices.map((idx) => stage.tiles[idx]).join(' ').trim();
      const right = built.toLowerCase() === stage.correctSentence.toLowerCase();
      setChecked(true);
      setIsCorrect(right);
      if (right) setCorrectCount((c) => c + 1);
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
    }
  };

  const toggleTile = (tileIdx: number) => {
    if (checked) return;
    setSelectedTileIndices((prev) =>
      prev.includes(tileIdx) ? prev.filter((i) => i !== tileIdx) : [...prev, tileIdx]
    );
  };

  if (summary) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.victoryScroll}>
          <View style={[styles.trophyCircle, { backgroundColor: colors.coinMuted }]}>
            <Trophy size={48} color={colors.coin} />
          </View>

          <Text style={[typography.display, { color: colors.textPrimary, textAlign: 'center' }]}>
            Expedition Complete!
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>
            You cleared "{lesson.title}" in {city?.name} with {summary.accuracyPercent}% accuracy.
          </Text>

          <View style={styles.victoryStats}>
            <Card style={styles.victoryTile}>
              <Zap size={22} color={colors.xp} />
              <Text style={[typography.metric, { color: colors.textPrimary }]}>
                +{summary.xpEarned}
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>XP Earned</Text>
            </Card>
            <Card style={styles.victoryTile}>
              <Coins size={22} color={colors.coin} />
              <Text style={[typography.metric, { color: colors.textPrimary }]}>
                +{summary.coinsEarned}
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>Coins</Text>
            </Card>
            <Card style={styles.victoryTile}>
              <Gem size={22} color={colors.gem} />
              <Text style={[typography.metric, { color: colors.textPrimary }]}>
                +{summary.gemsEarned}
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>Gems</Text>
            </Card>
          </View>

          {summary.unlockedNextLessonTitle ? (
            <Card variant="muted" style={styles.unlockCallout}>
              <Sparkles size={18} color={palette.primary} />
              <Text style={[typography.callout, { color: colors.textPrimary, flex: 1 }]}>
                Unlocked next stop: {summary.unlockedNextLessonTitle}
              </Text>
            </Card>
          ) : null}

          <GameButton
            label="Return to World Map"
            color={palette.primary}
            depthColor={palette.deep}
            onPress={() => router.back()}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const canCheck =
    stage.type === 'speaking'
      ? false
      : stage.type === 'interactive'
        ? selectedTileIndices.length > 0
        : selectedOption !== null;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
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
            height={10}
          />
        </View>

        <Badge label={`${stageIndex + 1}/${totalStages}`} tone="accent" />
      </View>

      <ScrollView
        contentContainerStyle={styles.stageScroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stageHeader}>
          <Badge label={`${lesson.level} · ${STAGE_META[stage.type].label}`} tone="neutral" />
          <Text style={[typography.title1, { color: colors.textPrimary }]}>{stage.title}</Text>
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

        {/* 6. INTERACTIVE SENTENCE BUILDER STAGE */}
        {stage.type === 'interactive' ? (
          <View style={styles.stageBody}>
            <View style={styles.builderHintRow}>
              <Puzzle size={16} color={palette.primary} />
              <Text style={[typography.body, { color: colors.textSecondary, flex: 1 }]}>
                {stage.instruction} ({stage.promptHint})
              </Text>
            </View>

            {/* Answer Construction Tray */}
            <Card
              variant="outlined"
              style={[
                styles.sentenceTray,
                {
                  borderColor: checked
                    ? isCorrect
                      ? colors.success
                      : colors.danger
                    : colors.borderStrong,
                },
              ]}
            >
              {selectedTileIndices.length === 0 ? (
                <Text style={[typography.body, { color: colors.textTertiary }]}>
                  Tap tiles below in order to build the sentence...
                </Text>
              ) : (
                <View style={styles.tilesWrap}>
                  {selectedTileIndices.map((tileIdx) => (
                    <AnimatedPressable
                      key={`tray-${tileIdx}`}
                      onPress={() => toggleTile(tileIdx)}
                      style={[
                        styles.wordTile,
                        {
                          backgroundColor: palette.primary,
                          borderColor: palette.deep,
                          borderRadius: radii.sm,
                        },
                      ]}
                    >
                      <Text style={styles.wordTileSelectedText}>{stage.tiles[tileIdx]}</Text>
                    </AnimatedPressable>
                  ))}
                </View>
              )}
            </Card>

            {selectedTileIndices.length > 0 && !checked ? (
              <Pressable
                onPress={() => setSelectedTileIndices([])}
                style={styles.clearRow}
              >
                <RotateCcw size={13} color={colors.textSecondary} />
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  Clear tiles
                </Text>
              </Pressable>
            ) : null}

            {/* Word Bank */}
            <View style={styles.tilesWrap}>
              {stage.tiles.map((word, idx) => {
                const used = selectedTileIndices.includes(idx);
                return (
                  <AnimatedPressable
                    key={`bank-${idx}`}
                    disabled={used || checked}
                    onPress={() => toggleTile(idx)}
                    style={[
                      styles.wordTile,
                      {
                        backgroundColor: used ? colors.surfaceMuted : colors.surface,
                        borderColor: used ? colors.border : colors.borderStrong,
                        borderRadius: radii.sm,
                        opacity: used ? 0.35 : 1,
                      },
                    ]}
                  >
                    <Text style={[typography.callout, { color: colors.textPrimary }]}>{word}</Text>
                  </AnimatedPressable>
                );
              })}
            </View>
          </View>
        ) : null}

        {/* Instant Feedback Banner */}
        {checked ? (
          <Card
            style={[
              styles.feedbackBanner,
              {
                backgroundColor: isCorrect ? colors.successMuted : colors.dangerMuted,
                borderColor: isCorrect ? colors.success : colors.danger,
              },
            ]}
          >
            <View style={styles.feedbackTitleRow}>
              {isCorrect ? (
                <CheckCircle2 size={20} color={colors.success} />
              ) : (
                <XCircle size={20} color={colors.danger} />
              )}
              <Text
                style={[
                  typography.headline,
                  { color: isCorrect ? colors.success : colors.danger },
                ]}
              >
                {stage.type === 'speaking'
                  ? `Great pacing! Fluency score: ${speakingScore}%`
                  : isCorrect
                    ? 'Spot on!'
                    : 'Good try — review the tip'}
              </Text>
            </View>
            {'explanation' in stage ? (
              <Text style={[typography.body, { color: colors.textPrimary }]}>
                {stage.explanation}
              </Text>
            ) : null}
            {stage.type === 'interactive' && !isCorrect ? (
              <Text style={[typography.callout, { color: colors.textPrimary }]}>
                Target: "{stage.correctSentence}"
              </Text>
            ) : null}
          </Card>
        ) : null}
      </ScrollView>

      {/* Bottom Sticky Action Footer */}
      <View
        style={[
          styles.footer,
          { backgroundColor: colors.surface, borderTopColor: colors.border },
        ]}
      >
        {checked ? (
          <GameButton
            label={stageIndex + 1 === totalStages ? 'Finish Expedition' : 'Continue'}
            color={isCorrect ? colors.success : palette.primary}
            depthColor={isCorrect ? '#166534' : palette.deep}
            rightIcon={<ArrowRight size={18} color="#FFFFFF" />}
            onPress={handleNext}
          />
        ) : stage.type === 'speaking' ? (
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
  const { colors, radii, typography } = useAppTheme();

  return (
    <View style={styles.optionsCol}>
      {options.map((opt, idx) => {
        const isSelected = selected === idx;
        const isRight = checked && idx === correctIndex;
        const isWrong = checked && isSelected && idx !== correctIndex;

        const borderColor = isRight
          ? colors.success
          : isWrong
            ? colors.danger
            : isSelected
              ? accent
              : colors.border;

        const bg = isRight
          ? colors.successMuted
          : isWrong
            ? colors.dangerMuted
            : isSelected
              ? colors.accentMuted
              : colors.surface;

        return (
          <AnimatedPressable
            key={opt}
            disabled={checked}
            onPress={() => onSelect(idx)}
            haptic="selection"
            style={[
              styles.optionBtn,
              {
                backgroundColor: bg,
                borderColor,
                borderRadius: radii.md,
              },
            ]}
          >
            <View
              style={[
                styles.optionIndex,
                {
                  backgroundColor: isSelected ? accent : colors.surfaceMuted,
                },
              ]}
            >
              <Text
                style={{
                  color: isSelected ? '#FFFFFF' : colors.textSecondary,
                  fontSize: 12,
                  fontWeight: '800',
                }}
              >
                {String.fromCharCode(65 + idx)}
              </Text>
            </View>
            <Text style={[typography.body, { color: colors.textPrimary, flex: 1 }]}>{opt}</Text>
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
  progressWrap: {
    flex: 1,
  },
  stageScroll: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    gap: 16,
  },
  stageHeader: {
    gap: 8,
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
    gap: 10,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1.5,
    gap: 12,
  },
  optionIndex: {
    width: 26,
    height: 26,
    borderRadius: 13,
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
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
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
