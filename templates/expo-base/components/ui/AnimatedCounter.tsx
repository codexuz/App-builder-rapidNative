import React, { useEffect, useState } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { useAppTheme } from '@/constants/Theme';

export interface AnimatedCounterProps {
  value: number;
  durationMs?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  style?: StyleProp<TextStyle>;
}

/**
 * Cross-platform smoothly animated numeric counter with tabular numerals.
 */
export function AnimatedCounter({
  value,
  durationMs = 550,
  decimals = 0,
  prefix = '',
  suffix = '',
  style,
}: AnimatedCounterProps) {
  const { colors, typography } = useAppTheme();
  const reducedMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (reducedMotion || durationMs <= 0) {
      setDisplayValue(value);
      return;
    }

    const startValue = displayValue;
    const diff = value - startValue;
    if (Math.abs(diff) < 0.0001) return;

    const startTime = Date.now();
    let frameId = 0;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(1, elapsed / durationMs);
      // Cubic ease-out
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayValue(startValue + diff * eased);
      if (t < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        setDisplayValue(value);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, durationMs, reducedMotion]);

  const formatted = displayValue.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <Text style={[typography.metric, { color: colors.textPrimary }, style]}>
      {prefix}
      {formatted}
      {suffix}
    </Text>
  );
}
