import React, { useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { Canvas, Circle, Group, RoundedRect } from '@shopify/react-native-skia';
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

export interface ConfettiBurstProps {
  /** Increment to trigger a fresh celebration burst */
  triggerKey: number;
  /** 'small' for right answers, 'grand' for Victory / chest unlocks */
  intensity?: 'small' | 'grand';
}

interface Particle {
  x0: number;
  y0: number;
  vx: number;
  vy: number;
  rot0: number;
  vrot: number;
  flutterSpeed: number;
  w: number;
  h: number;
  shape: 'rect' | 'circle' | 'pill';
  color: string;
}

const CONFETTI_COLORS = [
  '#FACC15', // Sunburst Gold
  '#38BDF8', // Sky Cyan
  '#22C55E', // Emerald XP
  '#FB7185', // Coral Rose
  '#A855F7', // Royal Violet
  '#F97316', // Streak Orange
  '#2563EB', // Electric Blue
];

function ConfettiPiece({ p, t }: { p: Particle; t: SharedValue<number> }) {
  const transform = useDerivedValue(() => {
    const time = t.value;
    // Slight horizontal air drag + downward gravity
    const drag = 1 - 0.18 * time;
    const x = p.x0 + p.vx * time * drag;
    const y = p.y0 + p.vy * time + 0.5 * 1450 * time * time;
    const rot = p.rot0 + p.vrot * time;
    const flutter = Math.cos(time * p.flutterSpeed);
    return [
      { translateX: x },
      { translateY: y },
      { rotate: rot },
      { scaleX: 0.35 + 0.65 * Math.abs(flutter) },
    ];
  });

  const opacity = useDerivedValue(() => {
    if (t.value <= 0.01) return 0;
    if (t.value > 0.72) return Math.max(0, (1 - t.value) / 0.28);
    return 1;
  });

  return (
    <Group transform={transform} opacity={opacity}>
      {p.shape === 'circle' ? (
        <Circle cx={0} cy={0} r={p.w * 0.5} color={p.color} />
      ) : (
        <RoundedRect
          x={-p.w / 2}
          y={-p.h / 2}
          width={p.w}
          height={p.h}
          r={p.shape === 'pill' ? p.w / 2 : 2}
          color={p.color}
        />
      )}
    </Group>
  );
}

/**
 * GPU-accelerated Skia physics confetti fountain for iOS & Android.
 * Draws up to 80 tumbling, gravity-driven particles inside a single non-interactive Canvas.
 */
export function ConfettiBurst({ triggerKey, intensity = 'grand' }: ConfettiBurstProps) {
  const { width, height } = useWindowDimensions();
  const t = useSharedValue(0);

  const count = intensity === 'grand' ? 78 : 36;
  const duration = intensity === 'grand' ? 1900 : 1250;

  const particles = useMemo<Particle[]>(() => {
    if (triggerKey <= 0) return [];
    const shapes: Particle['shape'][] = ['rect', 'pill', 'circle'];
    const originY = intensity === 'grand' ? height * 0.26 : height * 0.42;
    const spreadX = intensity === 'grand' ? 90 : 50;
    const speedMult = intensity === 'grand' ? 1.0 : 0.76;

    return Array.from({ length: count }, (_, i) => {
      const seed = (i * 9301 + triggerKey * 49297) % 233280;
      const r1 = seed / 233280;
      const r2 = ((seed * 17 + 131) % 233280) / 233280;
      const r3 = ((seed * 31 + 523) % 233280) / 233280;
      const r4 = ((seed * 53 + 911) % 233280) / 233280;

      return {
        x0: width * 0.5 + (r1 - 0.5) * spreadX,
        y0: originY + (r2 - 0.5) * 32,
        vx: (r1 - 0.5) * 560 * speedMult,
        vy: (-340 - r2 * 440) * speedMult,
        rot0: r3 * Math.PI * 2,
        vrot: (r4 - 0.5) * 16,
        flutterSpeed: 9 + r3 * 12,
        w: 6 + r4 * 6,
        h: 9 + r2 * 8,
        shape: shapes[i % shapes.length],
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      };
    });
  }, [triggerKey, intensity, count, width, height]);

  useEffect(() => {
    if (triggerKey <= 0) return;
    t.value = 0;
    t.value = withTiming(1, { duration, easing: Easing.out(Easing.quad) });
  }, [triggerKey, duration, t]);

  if (triggerKey <= 0) return null;

  return (
    <Canvas pointerEvents="none" style={styles.overlay}>
      {particles.map((p, idx) => (
        <ConfettiPiece key={`${triggerKey}-${idx}`} p={p} t={t} />
      ))}
    </Canvas>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 999,
  },
});
