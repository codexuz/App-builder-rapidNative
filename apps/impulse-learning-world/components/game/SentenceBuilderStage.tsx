import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RotateCcw } from 'lucide-react-native';
import { AnimatedPressable } from '@/components/ui';
import { useAppTheme } from '@/constants/Theme';

export interface SentenceBuilderStageProps {
  tiles: string[];
  selectedTileIndices: number[];
  checked: boolean;
  isCorrect: boolean;
  accentColor: string;
  deepColor: string;
  onToggleTile: (tileIndex: number) => void;
  onClear: () => void;
}

/**
 * Duolingo-style notebook-lined sentence builder with chunky 3D word buttons.
 * - Uses horizontal ruled notebook lines (no rounded card box wrapper)
 * - Every word is a tactile 3D button with a chunky bottom lip
 * - Used word-bank slots stay anchored as recessed placeholders so layout never jumps
 */
export function SentenceBuilderStage({
  tiles,
  selectedTileIndices,
  checked,
  isCorrect,
  accentColor,
  deepColor,
  onToggleTile,
  onClear,
}: SentenceBuilderStageProps) {
  const { colors, typography } = useAppTheme();

  const lineColor = checked
    ? isCorrect
      ? '#58CC02'
      : '#FF4B4B'
    : '#CBD5E1';

  return (
    <View style={styles.root}>
      {/* Notebook-lined Answer Area (NO rounded card box wrapper!) */}
      <View style={styles.notebookWrap}>
        {/* Horizontal Ruled Notebook Lines */}
        <View pointerEvents="none" style={styles.linesBackdrop}>
          <View style={[styles.notebookLine, { borderBottomColor: lineColor }]} />
          <View style={[styles.notebookLine, { borderBottomColor: lineColor }]} />
          <View style={[styles.notebookLine, { borderBottomColor: lineColor }]} />
        </View>

        {/* Placed 3D Word Tiles Snapped Onto Notebook Lines */}
        <View style={styles.placedTilesRow}>
          {selectedTileIndices.length === 0 ? (
            <Text style={[typography.body, styles.emptyHint, { color: colors.textTertiary }]}>
              Tap words below to write on the lines...
            </Text>
          ) : (
            selectedTileIndices.map((tileIdx) => {
              const tileBg = checked
                ? isCorrect
                  ? '#D7FFB8'
                  : '#FFDFE0'
                : '#FFFFFF';
              const tileBorder = checked
                ? isCorrect
                  ? '#58CC02'
                  : '#FF4B4B'
                : accentColor;
              const tileLip = checked
                ? isCorrect
                  ? '#46A302'
                  : '#EA2B2B'
                : deepColor;
              const tileText = checked
                ? isCorrect
                  ? '#3B8700'
                  : '#CC1D1D'
                : colors.textPrimary;

              return (
                <AnimatedPressable
                  key={`line-${tileIdx}`}
                  disabled={checked}
                  onPress={() => onToggleTile(tileIdx)}
                  accessibilityLabel={`Remove ${tiles[tileIdx]}`}
                  style={[
                    styles.wordBtn3D,
                    {
                      backgroundColor: tileBg,
                      borderColor: tileBorder,
                      borderBottomColor: tileLip,
                    },
                  ]}
                >
                  <Text style={[styles.wordBtnText, { color: tileText }]}>
                    {tiles[tileIdx]}
                  </Text>
                </AnimatedPressable>
              );
            })
          )}
        </View>
      </View>

      {/* Clear Action Row */}
      <View style={styles.metaRow}>
        {selectedTileIndices.length > 0 && !checked ? (
          <Pressable onPress={onClear} style={styles.clearBtn} hitSlop={8}>
            <RotateCcw size={13} color={colors.textSecondary} />
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              Clear lines
            </Text>
          </Pressable>
        ) : (
          <View style={{ height: 18 }} />
        )}
      </View>

      {/* Word Bank: Tactile Duolingo 3D Buttons + Anchored Recessed Slots */}
      <View style={styles.bankWrap}>
        {tiles.map((word, idx) => {
          const used = selectedTileIndices.includes(idx);

          if (used) {
            // Recessed empty placeholder slot (prevents tiles from jumping when tapped)
            return (
              <View
                key={`slot-${idx}`}
                style={[styles.wordBtn3D, styles.recessedSlot]}
              >
                <Text style={[styles.wordBtnText, styles.hiddenText]}>{word}</Text>
              </View>
            );
          }

          return (
            <AnimatedPressable
              key={`bank-${idx}`}
              disabled={checked}
              onPress={() => onToggleTile(idx)}
              accessibilityLabel={`Add word ${word}`}
              style={[
                styles.wordBtn3D,
                styles.bankBtn3D,
                {
                  backgroundColor: colors.surface,
                  borderColor: '#CBD5E1',
                  borderBottomColor: '#94A3B8',
                },
              ]}
            >
              <Text style={[styles.wordBtnText, { color: colors.textPrimary }]}>
                {word}
              </Text>
            </AnimatedPressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 12,
  },
  notebookWrap: {
    position: 'relative',
    minHeight: 162,
    paddingTop: 6,
    paddingBottom: 6,
  },
  linesBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  notebookLine: {
    height: 54,
    borderBottomWidth: 1.75,
  },
  placedTilesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: 9,
    rowGap: 12,
    paddingHorizontal: 2,
    paddingTop: 2,
  },
  emptyHint: {
    paddingTop: 14,
    paddingLeft: 4,
    fontStyle: 'italic',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  bankWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    columnGap: 10,
    rowGap: 12,
    paddingTop: 4,
  },
  wordBtn3D: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.75,
    borderBottomWidth: 4.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankBtn3D: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  recessedSlot: {
    backgroundColor: '#E2E8F0',
    borderColor: '#E2E8F0',
    borderBottomColor: '#CBD5E1',
    borderBottomWidth: 2,
  },
  wordBtnText: {
    fontSize: 15.5,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
  hiddenText: {
    opacity: 0,
  },
});
