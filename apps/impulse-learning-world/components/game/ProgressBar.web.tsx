import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
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

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  const r = Math.min(radius, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Web Retina HTML5 2D Canvas counterpart to Skia ProgressBar.tsx.
 * Renders the exact same spring-animated candy gradient, top specular sheen,
 * and continuous liquid shimmer sweep with zero WASM startup overhead.
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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const clamped = Math.max(0, Math.min(1, progress));
  const fillColor = color ?? colors.accent;
  const startColor = useMemo(
    () => secondaryColor ?? brightenHex(fillColor, 0.28),
    [fillColor, secondaryColor]
  );
  const bgTrack = trackColor ?? colors.surfaceMuted;

  const stateRef = useRef({
    current: clamped,
    velocity: 0,
    target: clamped,
  });

  useEffect(() => {
    stateRef.current.target = clamped;
  }, [clamped]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0) return;

    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let lastTs = performance.now();
    const startTs = lastTs;

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;

      // Damped spring physics matching Reanimated withSpring
      const st = stateRef.current;
      const stiffness = 145;
      const damping = 16;
      const force = (st.target - st.current) * stiffness;
      st.velocity = (st.velocity + force * dt) * Math.max(0, 1 - damping * dt);
      st.current += st.velocity * dt;
      if (Math.abs(st.target - st.current) < 0.0005 && Math.abs(st.velocity) < 0.0005) {
        st.current = st.target;
        st.velocity = 0;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const r = height / 2;

      // 1. Track
      roundRectPath(ctx, 0, 0, width, height, r);
      ctx.fillStyle = bgTrack;
      ctx.fill();

      // 2. Glossy gradient fill
      const p = Math.max(0, Math.min(1, st.current));
      const fillW = p > 0.001 ? Math.max(height, Math.min(width, width * p)) : 0;

      if (fillW > 0) {
        ctx.save();
        roundRectPath(ctx, 0, 0, fillW, height, r);
        ctx.clip();

        const grad = ctx.createLinearGradient(0, 0, width, 0);
        grad.addColorStop(0, startColor);
        grad.addColorStop(1, fillColor);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, fillW, height);

        // 3. Duolingo-style top candy highlight
        const sheenPad = Math.max(4, height * 0.36);
        const sheenW = Math.max(0, fillW - sheenPad * 2);
        if (sheenW > 2) {
          roundRectPath(
            ctx,
            sheenPad,
            Math.max(1.5, height * 0.16),
            sheenW,
            Math.max(2, height * 0.28),
            height * 0.14
          );
          ctx.fillStyle = 'rgba(255,255,255,0.42)';
          ctx.fill();
        }

        // 4. Diagonal liquid shimmer sweep
        if (shimmer && fillW > height * 1.4) {
          const cycle = ((now - startTs) % 1900) / 1900;
          const sx = -48 + cycle * (fillW + 96);
          const shimGrad = ctx.createLinearGradient(sx - 24, 0, sx + 24, 0);
          shimGrad.addColorStop(0, 'rgba(255,255,255,0)');
          shimGrad.addColorStop(0.5, 'rgba(255,255,255,0.38)');
          shimGrad.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = shimGrad;
          ctx.fillRect(sx - 28, 0, 56, height);
        }

        // 5. Soft glowing tip cap
        const tipGrad = ctx.createRadialGradient(
          fillW - r * 0.85,
          r,
          1,
          fillW - r * 0.85,
          r,
          r * 1.15
        );
        tipGrad.addColorStop(0, 'rgba(255,255,255,0.42)');
        tipGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = tipGrad;
        ctx.fillRect(fillW - height, 0, height, height);

        ctx.restore();
      }

      ctx.restore();
      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [width, height, fillColor, startColor, bgTrack, shimmer]);

  const handleLayout = (e: LayoutChangeEvent) => {
    const nextW = Math.round(e.nativeEvent.layout.width);
    if (nextW > 0 && nextW !== width) setWidth(nextW);
  };

  return (
    <View style={[styles.container, { height }, style]} onLayout={handleLayout}>
      {width > 0 ? (
        <canvas
          ref={canvasRef}
          style={{
            width,
            height,
            display: 'block',
            pointerEvents: 'none',
          }}
        />
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
