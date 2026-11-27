import { z } from 'zod';

export const SpringConfigSchema = z.object({
  damping: z.number().positive(),
  stiffness: z.number().positive(),
  mass: z.number().positive().default(1),
});

export const MotionInteractionSchema = z.object({
  target: z.string().min(1),
  trigger: z.enum(['mount', 'press', 'scroll', 'swipe', 'state-change', 'reward', 'loading']),
  behavior: z.string().min(3),
  reducedMotionFallback: z.string().default('instant crossfade'),
});

export const MotionSpecSchema = z.object({
  schemaVersion: z.literal('1.0.0').default('1.0.0'),
  engine: z.enum(['reanimated', 'reanimated-plus-gestures', 'reanimated-plus-lottie']).default('reanimated'),
  hapticsEnabled: z.boolean().default(true),
  respectReducedMotion: z.boolean().default(true),
  duration: z
    .object({
      instant: z.number().default(100),
      fast: z.number().default(180),
      normal: z.number().default(300),
      slow: z.number().default(480),
    })
    .default({}),
  springs: z
    .object({
      gentle: SpringConfigSchema.default({ damping: 20, stiffness: 140, mass: 1 }),
      snappy: SpringConfigSchema.default({ damping: 18, stiffness: 280, mass: 0.8 }),
      bouncy: SpringConfigSchema.default({ damping: 12, stiffness: 190, mass: 0.9 }),
    })
    .default({}),
  interactions: z.array(MotionInteractionSchema).default([]),
});

export type MotionSpec = z.infer<typeof MotionSpecSchema>;
