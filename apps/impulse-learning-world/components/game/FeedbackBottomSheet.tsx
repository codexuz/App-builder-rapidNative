import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { ArrowRight, CheckCircle2, Volume2, XCircle } from 'lucide-react-native';
import { AnimatedPressable } from '@/components/ui';
import { GameButton } from './GameButton';

export interface FeedbackBottomSheetProps {
  visible: boolean;
  isCorrect: boolean;
  headline: string;
  detail?: string;
  correctSolution?: string;
  buttonLabel: string;
  onContinue: () => void;
  onReplayVoice?: () => void;
}

/**
 * Duolingo-style sliding feedback bottom sheet anchored over the action footer.
 * Includes the result icon, title, explanation/correct answer, voice replay chip,
 * and the chunky 3D Continue / Finish CTA button inside the sheet itself.
 */
export function FeedbackBottomSheet({
  visible,
  isCorrect,
  headline,
  detail,
  correctSolution,
  buttonLabel,
  onContinue,
  onReplayVoice,
}: FeedbackBottomSheetProps) {
  const translateY = useSharedValue(220);

  useEffect(() => {
    translateY.value = withSpring(visible ? 0 : 220, {
      damping: 18,
      stiffness: 210,
      mass: 0.8,
    });
  }, [visible, translateY]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  const sheetBg = isCorrect ? '#D7FFB8' : '#FFDFE0';
  const sheetBorder = isCorrect ? '#58CC02' : '#FF4B4B';
  const titleColor = isCorrect ? '#3B8700' : '#CC1D1D';
  const bodyColor = isCorrect ? '#2E6B00' : '#A61717';
  const btnColor = isCorrect ? '#58CC02' : '#FF4B4B';
  const btnDepth = isCorrect ? '#46A302' : '#EA2B2B';
  const iconBg = isCorrect ? '#58CC02' : '#FF4B4B';
  const chipBg = isCorrect ? '#B8F28B' : '#FFC1C3';

  return (
    <Animated.View
      style={[
        styles.sheet,
        {
          backgroundColor: sheetBg,
          borderTopColor: sheetBorder,
        },
        sheetStyle,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.titleRow}>
          <View style={[styles.statusBadge, { backgroundColor: iconBg }]}>
            {isCorrect ? (
              <CheckCircle2 size={20} color="#FFFFFF" />
            ) : (
              <XCircle size={20} color="#FFFFFF" />
            )}
          </View>
          <Text style={[styles.headline, { color: titleColor }]}>{headline}</Text>
        </View>

        {onReplayVoice ? (
          <AnimatedPressable
            onPress={onReplayVoice}
            accessibilityLabel="Hear answer aloud"
            style={[
              styles.voiceChip,
              { backgroundColor: chipBg },
            ]}
          >
            <Volume2 size={16} color={titleColor} />
          </AnimatedPressable>
        ) : null}
      </View>

      {correctSolution ? (
        <View style={styles.solutionBlock}>
          <Text style={[styles.solutionLabel, { color: titleColor }]}>
            Correct answer:
          </Text>
          <Text style={[styles.solutionText, { color: bodyColor }]}>
            {correctSolution}
          </Text>
        </View>
      ) : null}

      {detail ? (
        <Text style={[styles.detailText, { color: bodyColor }]}>{detail}</Text>
      ) : null}

      <View style={styles.ctaWrap}>
        <GameButton
          label={buttonLabel}
          color={btnColor}
          depthColor={btnDepth}
          rightIcon={<ArrowRight size={18} color="#FFFFFF" />}
          onPress={onContinue}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderTopWidth: 2,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 18,
    gap: 10,
    shadowColor: '#0F172A',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -6 },
    elevation: 16,
    zIndex: 50,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.2,
    flex: 1,
  },
  voiceChip: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  solutionBlock: {
    gap: 2,
  },
  solutionLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  solutionText: {
    fontSize: 15.5,
    fontWeight: '800',
    lineHeight: 21,
  },
  detailText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  ctaWrap: {
    marginTop: 4,
  },
});
