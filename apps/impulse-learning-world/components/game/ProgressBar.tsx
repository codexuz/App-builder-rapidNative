import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import {
  BlurMask,
  Canvas,
  Group,
  LinearGradient,
  RoundedRect,
  rect,
  rrect,
  vec,
} from '@shopify/react-native-skia';
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useAppTheme } from '@/constants/Theme';

export interface ProgressBarProps {
  /** Value between 0 and 1 */
  progress: number;
  color?: string;
  secondaryColor?: string;
  trackColor?: string;
  height?: number;
  shimmer?: boolean;
  style?: StyleProp<ViewStyle>;
}

function brightenHex(hex: string, amount = 0.24): string {
  const cleaned = hex.replace('#', '');
  if (cleaned.length !== 6) return hex;
  const num = parseInt(cleaned, 16);
  if (Number.isNaN(num)) return hex;
  const r = Math.min(255, Math.round(((num >> 16) & 255) + (255 - ((num >> 16) & 255)) * amount));
  const g = Math.min(255, Math.round(((num >> 8) & 255) + (255 - ((num >> 8) & 255)) * amount));
  const b = Math.min(255, Math.round((num & 255) + (255 - (num & 255)) * amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * GPU-accelerated Skia glossy progress bar for iOS & Android.
 * Features spring-driven fill, two-stop candy gradient, top specular sheen,
 * and a subtle liquid shimmer sweep clipped cleanly inside the progress pill.
 */
export function ProgressBar({
  progress,
  color,
  secondaryColor,
  trackColor,
  height = 12,
  shimmer = true,
  style,
}: ProgressBarProps) {
  const { colors } = useAppTheme();
  const [width, setWidth] = useState(0);

  const clamped = Math.max(0, Math.min(1, progress));
  const fillColor = color ?? colors.accent;
  const startColor = useMemo(
    () => secondaryColor ?? brightenHex(fillColor, 0.28),
    [fillColor, secondaryColor]
  );
  const bgTrack = trackColor ?? colors.surfaceMuted;

  const animProgress = useSharedValue(clamped);
  const shimmerPhase = useSharedValue(0);

  useEffect(() => {
    animProgress.value = withSpring(clamped, {
      damping: 15,
      stiffness: 145,
      mass: 0.75,
    });
  }, [clamped, animProgress]);

  useEffect(() => {
    if (!shimmer) return;
    shimmerPhase.value = 0;
    shimmerPhase.value = withRepeat(
      withTiming(1, { duration: 1900, easing: Easing.inOut(Easing.ease) }),
      -1,
      false
    );
  }, [shimmer, shimmerPhase]);

  const handleLayout = (e: LayoutChangeEvent) => {
    const nextW = Math.round(e.nativeEvent.layout.width);
    if (nextW > 0 && nextW !== width) setWidth(nextW);
  };

  const r = height / 2;

  const fillWidth = useDerivedValue(() => {
    if (width <= 0) return 0;
    const raw = width * animProgress.value;
    return animProgress.value > 0.001 ? Math.max(height, Math.min(width, raw)) : 0;
  }, [width, height]);

  const clipPath = useDerivedValue(
    () => rrect(rect(0, 0, Math.max(0.01, fillWidth.value), height), r, r),
    [height, r]
  );

  const sheenWidth = useDerivedValue(
    () => Math.max(0, fillWidth.value - Math.max(8, height * 0.75)),
    [height]
  );

  const shimmerX = useDerivedValue(() => {
    const span = Math.max(40, fillWidth.value + 56);
    return -56 + shimmerPhase.value * span;
  });

  const tipX = useDerivedValue(() => Math.max(0, fillWidth.value - height * 0.9), [height]);

  return (
    <View style={[styles.container, { height }, style]} onLayout={handleLayout}>
      {width > 0 ? (
        <Canvas style={{ width, height }}>
          {/* Recessed capsule track */}
          <RoundedRect x={0} y={0} width={width} height={height} r={r} color={bgTrack} />

          {/* Clipped glossy fill + specular highlight + liquid shimmer */}
          <Group clip={clipPath}>
            <RoundedRect x={0} y={0} width={fillWidth} height={height} r={r}>
              <LinearGradient
                start={vec(0, 0)}
                end={vec(width, 0)}
                colors={[startColor, fillColor]}
              />
            </RoundedRect>

            {/* Duolingo-style top candy highlight */}
            <RoundedRect
              x={height * 0.36}
              y={Math.max(1.5, height * 0.16)}
              width={sheenWidth}
              height={Math.max(2, height * 0.28)}
              r={height * 0.14}
              color="rgba(255,255,255,0.42)"
            />

            {/* Animated shimmer sweep */}
            {shimmer ? (
              <RoundedRect
                x={shimmerX}
                y={0}
                width={34}
                height={height}
                r={r}
                color="rgba(255,255,255,0.34)"
              >
                <BlurMask blur={5} style="normal" />
              </RoundedRect>
            ) : null}

            {/* Bright leading glow cap */}
            <RoundedRect
              x={tipX}
              y={height * 0.15}
              width={height * 0.7}
              height={height * 0.7}
              r={height * 0.35}
              color="rgba(255,255,255,0.32)"
            >
              <BlurMask blur={3} style="normal" />
            </RoundedRect>
          </Group>
        </Canvas>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'center',
  },
});
