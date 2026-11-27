import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

export interface ConfettiBurstProps {
  /** Increment to trigger a fresh celebration burst */
  triggerKey: number;
  /** 'small' for right answers, 'grand' for Victory / chest unlocks */
  intensity?: 'small' | 'grand';
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  flutter: number;
  flutterSpeed: number;
  w: number;
  h: number;
  shape: 'rect' | 'circle' | 'pill';
  color: string;
}

const CONFETTI_COLORS = [
  '#FACC15',
  '#38BDF8',
  '#22C55E',
  '#FB7185',
  '#A855F7',
  '#F97316',
  '#2563EB',
];

/**
 * Web Retina HTML5 2D Canvas counterpart to Skia ConfettiBurst.tsx.
 * Renders 60fps gravity, drag, and 3D-flutter tumbling confetti bursts over any screen.
 */
export function ConfettiBurst({ triggerKey, intensity = 'grand' }: ConfettiBurstProps) {
  const { width, height } = useWindowDimensions();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (triggerKey <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas || width <= 0 || height <= 0) return;

    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const count = intensity === 'grand' ? 78 : 36;
    const durationMs = intensity === 'grand' ? 2100 : 1350;
    const shapes: Particle['shape'][] = ['rect', 'pill', 'circle'];
    const originY = intensity === 'grand' ? height * 0.28 : height * 0.44;
    const spreadX = intensity === 'grand' ? 90 : 50;
    const speedMult = intensity === 'grand' ? 1.0 : 0.78;

    const particles: Particle[] = Array.from({ length: count }, (_, i) => ({
      x: width * 0.5 + (Math.random() - 0.5) * spreadX,
      y: originY + (Math.random() - 0.5) * 32,
      vx: (Math.random() - 0.5) * 440 * speedMult,
      vy: (-280 - Math.random() * 380) * speedMult,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 10,
      flutter: Math.random() * Math.PI * 2,
      flutterSpeed: 8 + Math.random() * 10,
      w: 7 + Math.random() * 6,
      h: 10 + Math.random() * 8,
      shape: shapes[i % shapes.length],
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    }));

    let rafId = 0;
    const startTs = performance.now();
    let lastTs = startTs;

    const step = (now: number) => {
      const elapsed = now - startTs;
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;

      const progress = Math.min(1, elapsed / durationMs);
      const alpha = progress > 0.72 ? Math.max(0, (1 - progress) / 0.28) : 1;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = alpha;

      for (const p of particles) {
        p.vy += 980 * dt; // gravity
        p.vx *= 1 - 0.85 * dt; // air drag
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vrot * dt;
        p.flutter += p.flutterSpeed * dt;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(0.35 + 0.65 * Math.abs(Math.cos(p.flutter)), 1);
        ctx.fillStyle = p.color;

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.w * 0.48, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const hw = p.w / 2;
          const hh = p.h / 2;
          ctx.beginPath();
          const rad = p.shape === 'pill' ? hw : 2;
          ctx.roundRect?.(-hw, -hh, p.w, p.h, rad);
          if (!ctx.roundRect) {
            ctx.rect(-hw, -hh, p.w, p.h);
          }
          ctx.fill();
        }

        ctx.restore();
      }

      ctx.restore();

      if (elapsed < durationMs) {
        rafId = requestAnimationFrame(step);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [triggerKey, intensity, width, height]);

  if (triggerKey <= 0) return null;

  return (
    <View pointerEvents="none" style={styles.overlay}>
      <canvas
        ref={canvasRef}
        style={{
          width,
          height,
          display: 'block',
          pointerEvents: 'none',
        }}
      />
    </View>
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
