import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useAppTheme } from '@/constants/Theme';
import { AnimatedPressable } from './AnimatedPressable';

export interface BarChartDatum {
  label: string;
  value: number;
}

export interface BarChartProps {
  data: BarChartDatum[];
  maxValue?: number;
  height?: number;
  barColor?: string;
  activeColor?: string;
  unit?: string;
  style?: StyleProp<ViewStyle>;
}

function AnimatedBar({
  ratio,
  maxHeight,
  color,
  index,
}: {
  ratio: number;
  maxHeight: number;
  color: string;
  index: number;
}) {
  const reducedMotion = useReducedMotion();
  const targetH = Math.max(8, Math.round(ratio * maxHeight));
  const barHeight = useSharedValue(reducedMotion ? targetH : 8);

  useEffect(() => {
    barHeight.value = reducedMotion
      ? targetH
      : withDelay(
          Math.min(index * 35, 280),
          withTiming(targetH, { duration: 420, easing: Easing.out(Easing.cubic) })
        );
  }, [barHeight, index, reducedMotion, targetH]);

  const animStyle = useAnimatedStyle(() => ({
    height: barHeight.value,
  }));

  return <Animated.View style={[styles.bar, { backgroundColor: color }, animStyle]} />;
}

/**
 * Clean rounded-bar activity/progress chart with tappable bar selection
 * and automatic peak highlighting.
 */
export function BarChart({
  data,
  maxValue,
  height = 148,
  barColor,
  activeColor,
  unit = '',
  style,
}: BarChartProps) {
  const { colors, typography } = useAppTheme();
  const peakIndex = data.reduce(
    (bestIdx, item, idx, arr) => (item.value > arr[bestIdx].value ? idx : bestIdx),
    0
  );
  const [selectedIdx, setSelectedIdx] = useState<number>(peakIndex);

  const computedMax = Math.max(
    maxValue ?? 0,
    ...data.map((d) => d.value),
    1
  );
  const selected = data[selectedIdx] ?? data[0];

  return (
    <View style={[styles.container, style]}>
      {selected ? (
        <View style={styles.readoutRow}>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            {selected.label}
          </Text>
          <Text style={[typography.callout, { color: colors.textPrimary, fontVariant: ['tabular-nums'] }]}>
            {selected.value.toLocaleString()}
            {unit ? ` ${unit}` : ''}
          </Text>
        </View>
      ) : null}

      <View style={[styles.plot, { height }]}>
        <View style={[styles.midLine, { borderBottomColor: colors.border }]} pointerEvents="none" />
        <View style={styles.barsRow}>
          {data.map((item, idx) => {
            const isSelected = idx === selectedIdx;
            const fill = isSelected
              ? activeColor ?? colors.accent
              : barColor ?? colors.accentMuted;

            return (
              <AnimatedPressable
                key={`${item.label}-${idx}`}
                haptic="selection"
                scaleTo={0.95}
                containerStyle={styles.barSlot}
                onPress={() => setSelectedIdx(idx)}
                accessibilityRole="button"
                accessibilityLabel={`${item.label}: ${item.value} ${unit}`}
                style={styles.barCol}
              >
                <View style={[styles.barTrack, { height: height - 24 }]}>
                  <AnimatedBar
                    ratio={Math.max(0, Math.min(1, item.value / computedMax))}
                    maxHeight={height - 28}
                    color={fill}
                    index={idx}
                  />
                </View>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.axisLabel,
                    {
                      color: isSelected ? colors.textPrimary : colors.textTertiary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </AnimatedPressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  readoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  plot: {
    position: 'relative',
    justifyContent: 'flex-end',
  },
  midLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '42%',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderStyle: 'dashed',
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  barSlot: {
    flex: 1,
    minWidth: 0,
  },
  barCol: {
    alignItems: 'center',
    gap: 6,
  },
  barTrack: {
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '68%',
    maxWidth: 22,
    borderRadius: 999,
  },
  axisLabel: {
    fontSize: 11,
  },
});
