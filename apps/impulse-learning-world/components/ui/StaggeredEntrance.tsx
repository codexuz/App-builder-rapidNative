import React, { useEffect } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

export interface StaggeredEntranceProps {
  children: React.ReactNode;
  index?: number;
  stepDelayMs?: number;
  distance?: number;
  durationMs?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Purposeful staggered fade + lift entrance that automatically falls back
 * to immediate visibility when reduced-motion is enabled.
 */
export function StaggeredEntrance({
  children,
  index = 0,
  stepDelayMs = 55,
  distance = 12,
  durationMs = 280,
  style,
}: StaggeredEntranceProps) {
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(reducedMotion ? 1 : 0);
  const translateY = useSharedValue(reducedMotion ? 0 : distance);

  useEffect(() => {
    if (reducedMotion) {
      opacity.value = 1;
      translateY.value = 0;
      return;
    }
    const delay = Math.min(index * stepDelayMs, 360);
    const config = { duration: durationMs, easing: Easing.out(Easing.cubic) };
    opacity.value = withDelay(delay, withTiming(1, config));
    translateY.value = withDelay(delay, withTiming(0, config));
  }, [distance, durationMs, index, opacity, reducedMotion, stepDelayMs, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[animStyle, style]}>{children}</Animated.View>;
}
