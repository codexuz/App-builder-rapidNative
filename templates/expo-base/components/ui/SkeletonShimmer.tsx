import React, { useEffect } from 'react';
import { type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useAppTheme } from '@/constants/Theme';

export interface SkeletonShimmerProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Restrained loading placeholder with subtle Reanimated opacity pulse.
 */
export function SkeletonShimmer({
  width = '100%',
  height = 18,
  borderRadius,
  style,
}: SkeletonShimmerProps) {
  const { colors, radii } = useAppTheme();
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(0.65);

  useEffect(() => {
    if (reducedMotion) return;
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.45, { duration: 700, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [opacity, reducedMotion]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      accessibilityRole="progressbar"
      style={[
        {
          width,
          height,
          borderRadius: borderRadius ?? radii.sm,
          backgroundColor: colors.surfaceMuted,
        },
        animStyle,
        style,
      ]}
    />
  );
}
