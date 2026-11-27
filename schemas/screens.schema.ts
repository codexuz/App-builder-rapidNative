import { z } from 'zod';

export const ScreenStatesSchema = z.object({
  loading: z.string().min(1),
  empty: z.string().min(1),
  error: z.string().min(1),
  success: z.string().optional(),
});

export const ScreenSpecSchema = z.object({
  id: z.string().min(1),
  route: z.string().startsWith('/'),
  title: z.string().min(1),
  purpose: z.string().min(5),
  layout: z.string().min(1),
  isTab: z.boolean().default(false),
  components: z.array(z.string()).min(1),
  assets: z.array(z.string()).default([]),
  interactions: z.array(z.string()).default([]),
  states: ScreenStatesSchema,
  captureInQa: z.boolean().default(true),
  scrollOffsets: z.array(z.number().int().min(0)).default([]),
});

export const ScreensSpecSchema = z.object({
  schemaVersion: z.literal('1.0.0').default('1.0.0'),
  navigation: z.object({
    type: z.enum([
      'floating-pill-tabs',
      'capsule-tabs',
      'notched-fab-tabs',
      'native-tabs',
      'stack-only',
      'drawer-plus-stack',
    ]),
    tabs: z
      .array(
        z.object({
          name: z.string().min(1),
          route: z.string().startsWith('/'),
          icon: z.string().min(1),
        })
      )
      .default([]),
  }),
  screens: z.array(ScreenSpecSchema).min(1),
});

export type ScreenSpec = z.infer<typeof ScreenSpecSchema>;
export type ScreensSpec = z.infer<typeof ScreensSpecSchema>;
