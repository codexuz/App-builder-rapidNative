import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const BAR_HEIGHTS = [14, 28, 20, 36, 26, 40, 22, 34, 18, 30, 16];

function WaveBar({
  baseHeight,
  index,
  active,
  color,
}: {
  baseHeight: number;
  index: number;
  active: boolean;
  color: string;
}) {
  const scaleY = useSharedValue(0.35);

  useEffect(() => {
    if (active) {
      scaleY.value = withDelay(
        index * 55,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 280, easing: Easing.out(Easing.ease) }),
            withTiming(0.28, { duration: 280, easing: Easing.in(Easing.ease) })
          ),
          -1,
          true
        )
      );
    } else {
      scaleY.value = withTiming(0.35, { duration: 220 });
    }
  }, [active, index, scaleY]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: scaleY.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.bar,
        {
          height: baseHeight,
          backgroundColor: color,
        },
        animStyle,
      ]}
    />
  );
}

export function SoundWaveVisualizer({
  active,
  color,
}: {
  active: boolean;
  color: string;
}) {
  return (
    <View style={styles.container}>
      {BAR_HEIGHTS.map((h, i) => (
        <WaveBar key={i} baseHeight={h} index={i} active={active} color={color} />
      ))}
    </View>
  );
}

/**
 * Plays real spoken English audio on Web via SpeechSynthesis when available.
 * Returns a cleanup callback so callers can stop speech cleanly.
 */
export function speakEnglishText(text: string, onEnd?: () => void): () => void {
  if (
    Platform.OS === 'web' &&
    typeof globalThis.window !== 'undefined' &&
    'speechSynthesis' in globalThis.window
  ) {
    try {
      const synth = globalThis.window.speechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.95;
      utterance.onend = () => onEnd?.();
      utterance.onerror = () => onEnd?.();
      synth.speak(utterance);
      return () => synth.cancel();
    } catch {
      // Fall through to timed simulation
    }
  }

  const durationMs = Math.max(2200, Math.min(6000, text.length * 48));
  const timer = setTimeout(() => onEnd?.(), durationMs);
  return () => clearTimeout(timer);
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    gap: 5,
  },
  bar: {
    width: 5,
    borderRadius: 999,
  },
});
