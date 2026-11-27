import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, RotateCw, Volume2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConfettiBurst, GameButton, speakEnglishText } from '@/components/game';
import { LeoMascot } from '@/components/mascot/LeoMascot';
import { AnimatedPressable, Badge, Card } from '@/components/ui';
import { useAppTheme } from '@/constants/Theme';
import { useKidsApp } from '@/providers/KidsAppProvider';
import { playCorrectFeedback, playTileTapSound } from '@/utils/soundFeedback';

/**
 * Kids Flashcards Review wired to production /lms/review/words & POST /lms/review/words/:id.
 */
export default function WordsReviewScreen() {
  const router = useRouter();
  const { colors, typography, radii } = useAppTheme();
  const { dueWords, soundEnabled, gradeVocabWord } = useKidsApp();

  const [flipped, setFlipped] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);

  const cards = dueWords?.cards ?? [];
  const current = cards[0] ?? null;

  const handleGrade = async (grade: 'AGAIN' | 'GOOD') => {
    if (!current) return;
    if (grade === 'GOOD') {
      playCorrectFeedback(soundEnabled);
      setConfettiKey((k) => k + 1);
    } else {
      playTileTapSound(undefined, soundEnabled);
    }
    setFlipped(false);
    await gradeVocabWord(current.id, grade);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ConfettiBurst triggerKey={confettiKey} intensity="small" />

      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.surfaceMuted }]}
        >
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={[typography.title2, { color: colors.textPrimary, flex: 1 }]}>
          Word Cards
        </Text>
        <Badge label={`${cards.length} left`} tone="accent" />
      </View>

      <View style={styles.body}>
        {current ? (
          <>
            <LeoMascot pose={flipped ? 'cheer' : 'think'} size={108} />

            <AnimatedPressable
              onPress={() => {
                playTileTapSound(current.term, soundEnabled);
                setFlipped((f) => !f);
              }}
              style={[
                styles.flashcard,
                {
                  backgroundColor: colors.surface,
                  borderColor: flipped ? '#58CC02' : '#1055F8',
                  borderBottomColor: flipped ? '#46A302' : '#0A3BB3',
                  borderRadius: radii.xl,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <Badge label={current.partOfSpeech ?? 'word'} tone="accent" />
                <Pressable
                  onPress={() => speakEnglishText(current.term)}
                  style={[styles.audioBtn, { backgroundColor: '#DBEAFE' }]}
                >
                  <Volume2 size={18} color="#1055F8" />
                </Pressable>
              </View>

              <Text style={[typography.display, { color: colors.textPrimary, textAlign: 'center' }]}>
                {current.term}
              </Text>
              {current.pronunciation ? (
                <Text style={[typography.callout, { color: colors.textTertiary }]}>
                  {current.pronunciation}
                </Text>
              ) : null}

              {flipped ? (
                <View style={styles.meaningBox}>
                  <Text style={[typography.title2, { color: '#3B8700', textAlign: 'center' }]}>
                    {current.meaning}
                  </Text>
                  {current.example ? (
                    <Text
                      style={[
                        typography.body,
                        { color: colors.textSecondary, textAlign: 'center', fontStyle: 'italic' },
                      ]}
                    >
                      "{current.example}"
                    </Text>
                  ) : null}
                </View>
              ) : (
                <View style={styles.flipHint}>
                  <RotateCw size={15} color={colors.textTertiary} />
                  <Text style={[typography.caption, { color: colors.textTertiary }]}>
                    Tap card to reveal meaning
                  </Text>
                </View>
              )}
            </AnimatedPressable>

            <View style={styles.actionsRow}>
              <View style={{ flex: 1 }}>
                <GameButton
                  label="Practice Again"
                  color="#FF4B4B"
                  depthColor="#EA2B2B"
                  onPress={() => handleGrade('AGAIN')}
                />
              </View>
              <View style={{ flex: 1 }}>
                <GameButton
                  label="I Know It!"
                  color="#58CC02"
                  depthColor="#46A302"
                  onPress={() => handleGrade('GOOD')}
                />
              </View>
            </View>
          </>
        ) : (
          <Card style={styles.doneCard}>
            <LeoMascot pose="roar" size={128} />
            <Text style={[typography.display, { color: colors.textPrimary, textAlign: 'center' }]}>
              All Words Mastered!
            </Text>
            <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>
              Leo is super proud! Complete more lessons to collect new flashcards.
            </Text>
            <View style={{ width: '100%' }}>
              <GameButton
                label="Back to Home"
                color="#1055F8"
                depthColor="#0A3BB3"
                onPress={() => router.back()}
              />
            </View>
          </Card>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  flashcard: {
    width: '100%',
    minHeight: 240,
    padding: 20,
    borderWidth: 2,
    borderBottomWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  cardHeader: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  audioBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meaningBox: {
    marginTop: 8,
    gap: 6,
    alignItems: 'center',
  },
  flipHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  doneCard: {
    width: '100%',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 26,
  },
});
