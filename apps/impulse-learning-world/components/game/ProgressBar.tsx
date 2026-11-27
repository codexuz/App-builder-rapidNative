import React, { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useAppTheme } from '@/constants/Theme';

export interface ProgressBarProps {
  /** Value between 0 and 1 */
  progress: number;
  color?: string;
  trackColor?: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

export function ProgressBar({
  progress,
  color,
  trackColor,
  height = 10,
  style,
}: ProgressBarProps) {
  const { colors } = useAppTheme();
  const clamped = Math.max(0, Math.min(1, progress));
  const widthPct = useSharedValue(clamped * 100);

  useEffect(() => {
    widthPct.value = withTiming(clamped * 100, { duration: 420 });
  }, [clamped, widthPct]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${widthPct.value}%`,
  }));

  return (
    <View
      style={[
        styles.track,
        {
          height,
          borderRadius: height / 2,
          backgroundColor: trackColor ?? colors.surfaceMuted,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            height,
            borderRadius: height / 2,
            backgroundColor: color ?? colors.accent,
          },
          fillStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    minWidth: 6,
  },
});
