import React, { useEffect } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useAppTheme } from '@/constants/Theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface ProgressRingProps {
  /** Normalized progress value between 0 and 1 */
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function ProgressRing({
  progress,
  size = 112,
  strokeWidth = 10,
  color,
  trackColor,
  label,
  sublabel,
  children,
  style,
}: ProgressRingProps) {
  const { colors, typography } = useAppTheme();
  const reducedMotion = useReducedMotion();
  const clamped = Math.max(0, Math.min(1, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const animatedProgress = useSharedValue(reducedMotion ? clamped : 0);

  useEffect(() => {
    animatedProgress.value = reducedMotion
      ? clamped
      : withTiming(clamped, {
          duration: 620,
          easing: Easing.out(Easing.cubic),
        });
  }, [animatedProgress, clamped, reducedMotion]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor ?? colors.surfaceMuted}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color ?? colors.accent}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeLinecap="round"
          fill="none"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
          animatedProps={animatedProps}
        />
      </Svg>
      <View style={styles.center}>
        {children ?? (
          <>
            {label ? (
              <Text style={[typography.headline, { color: colors.textPrimary }]}>{label}</Text>
            ) : null}
            {sublabel ? (
              <Text style={[typography.caption, { color: colors.textSecondary }]}>{sublabel}</Text>
            ) : null}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
