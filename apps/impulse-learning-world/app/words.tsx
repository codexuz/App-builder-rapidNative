import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, RotateCw, Volume2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConfettiBurst, GameButton, speakEnglishText } from '@/components/game';
import { LeoMascot } from '@/components/mascot/LeoMascot';
import { DS } from '@/constants/DesignSystem';
import { useKidsApp } from '@/providers/KidsAppProvider';
import { playCorrectFeedback, playTileTapSound } from '@/utils/soundFeedback';

export default function WordsReviewScreen() {
  const router = useRouter();
  const { dueWords, soundEnabled, gradeVocabWord } = useKidsApp();

  const [flipped, setFlipped] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);

  const cards = dueWords?.cards ?? [];
  const current = cards[0] ?? null;
  const totalCount = Math.max(1, (dueWords?.counts.due ?? cards.length) + (dueWords?.counts.learned ?? 0));
  const doneRatio = Math.min(100, Math.round(((dueWords?.counts.learned ?? 0) / totalCount) * 100));

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
    <SafeAreaView style={styles.safe}>
      <ConfettiBurst triggerKey={confettiKey} intensity="small" />

      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
          <ArrowLeft size={20} color={DS.colors.ink} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={DS.type.cardTitle}>Word Cards</Text>
          <Text style={DS.type.caption}>
            {cards.length > 0 ? `${cards.length} left to review` : 'All caught up'}
          </Text>
        </View>
      </View>

      <View style={styles.topTrack}>
        <View style={[styles.topFill, { width: `${doneRatio}%` }]} />
      </View>

      <View style={styles.stage}>
        {current ? (
          <>
            <View style={styles.mascotHeader}>
              <LeoMascot pose={flipped ? 'cheer' : 'think'} size={108} />
            </View>

            <Pressable
              onPress={() => {
                playTileTapSound(current.term, soundEnabled);
                setFlipped((f) => !f);
              }}
              style={[
                styles.flashcard,
                flipped ? styles.flashcardFlipped : null,
              ]}
            >
              <View style={styles.cardTopRow}>
                <View style={styles.posPill}>
                  <Text style={styles.posText}>{current.partOfSpeech ?? 'word'}</Text>
                </View>
                <Pressable
                  onPress={() => speakEnglishText(current.term)}
                  hitSlop={8}
                  style={styles.audioBtn}
                >
                  <Volume2 size={18} color={DS.colors.brand} />
                </Pressable>
              </View>

              <View style={styles.cardCenter}>
                <Text style={styles.term}>{current.term}</Text>
                {current.pronunciation ? (
                  <Text style={styles.pronunciation}>{current.pronunciation}</Text>
                ) : null}

                {flipped ? (
                  <View style={styles.meaningBlock}>
                    <View style={styles.meaningDivider} />
                    <Text style={styles.meaning}>{current.meaning}</Text>
                    {current.example ? (
                      <Text style={styles.example}>"{current.example}"</Text>
                    ) : null}
                  </View>
                ) : (
                  <View style={styles.flipHint}>
                    <RotateCw size={14} color={DS.colors.inkMuted} />
                    <Text style={styles.flipHintText}>Tap card to flip</Text>
                  </View>
                )}
              </View>
            </Pressable>
          </>
        ) : (
          <View style={[DS.card, styles.doneCard]}>
            <LeoMascot pose="cheer" size={116} />
            <Text style={DS.type.pageTitle}>All words reviewed!</Text>
            <Text style={[DS.type.body, { textAlign: 'center', color: DS.colors.inkSecondary }]}>
              Complete more lessons to unlock fresh vocabulary cards.
            </Text>
            <View style={{ width: '100%', marginTop: 8 }}>
              <GameButton
                label="Back to Learn"
                color={DS.colors.brand}
                depthColor={DS.colors.brandDeep}
                onPress={() => router.back()}
              />
            </View>
          </View>
        )}
      </View>

      {current ? (
        <View style={styles.footer}>
          <View style={{ flex: 1 }}>
            <GameButton
              label="Practice Again"
              color={DS.colors.red}
              depthColor={DS.colors.redDeep}
              onPress={() => void handleGrade('AGAIN')}
            />
          </View>
          <View style={{ flex: 1 }}>
            <GameButton
              label="I Know It"
              color={DS.colors.green}
              depthColor={DS.colors.greenDeep}
              onPress={() => void handleGrade('GOOD')}
            />
          </View>
        </View>
      ) : null}
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
  topTrack: {
    height: 3,
    backgroundColor: DS.colors.border,
  },
  topFill: {
    height: 3,
    backgroundColor: DS.colors.brand,
  },
  stage: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: 'center',
  },
  mascotHeader: {
    alignItems: 'center',
    marginBottom: -12,
    zIndex: 2,
  },
  flashcard: {
    backgroundColor: DS.colors.surface,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: DS.colors.brandBorder,
    borderBottomWidth: 6,
    borderBottomColor: '#93C5FD',
    padding: 20,
    minHeight: 310,
  },
  flashcardFlipped: {
    borderColor: '#BBF7D0',
    borderBottomColor: '#4ADE80',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  posPill: {
    backgroundColor: DS.colors.brandSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  posText: {
    fontSize: 12,
    fontWeight: '700',
    color: DS.colors.brand,
  },
  audioBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: DS.colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  term: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: -0.7,
    color: DS.colors.ink,
    textAlign: 'center',
  },
  pronunciation: {
    fontSize: 15,
    fontWeight: '600',
    color: DS.colors.inkMuted,
  },
  meaningBlock: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  meaningDivider: {
    width: 48,
    height: 2,
    borderRadius: 1,
    backgroundColor: DS.colors.border,
    marginBottom: 4,
  },
  meaning: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: DS.colors.greenInk,
    textAlign: 'center',
  },
  example: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    color: DS.colors.inkSecondary,
    textAlign: 'center',
  },
  flipHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 18,
  },
  flipHintText: {
    fontSize: 13,
    fontWeight: '600',
    color: DS.colors.inkMuted,
  },
  doneCard: {
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: DS.colors.surface,
    borderTopWidth: 1,
    borderTopColor: DS.colors.border,
  },
});
