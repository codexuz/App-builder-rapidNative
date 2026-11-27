import { z } from 'zod';

const HexOrRgbaColor = z
  .string()
  .min(4)
  .regex(/^(#[0-9a-fA-F]{3,8}|rgba?\(.+\))$/, 'Must be a valid hex or rgb/rgba color');

export const VisualDirectionIdSchema = z.enum([
  'editorial',
  'playful',
  'fintech-premium',
  'neobrutalist',
  'organic',
  'spatial',
  'minimal',
]);

export const ColorPaletteSchema = z.object({
  background: HexOrRgbaColor,
  surface: HexOrRgbaColor,
  surfaceElevated: HexOrRgbaColor,
  surfaceMuted: HexOrRgbaColor,
  border: HexOrRgbaColor,
  borderStrong: HexOrRgbaColor,
  textPrimary: HexOrRgbaColor,
  textSecondary: HexOrRgbaColor,
  textTertiary: HexOrRgbaColor,
  accent: HexOrRgbaColor,
  accentMuted: HexOrRgbaColor,
  accentForeground: HexOrRgbaColor,
  success: HexOrRgbaColor,
  successMuted: HexOrRgbaColor,
  warning: HexOrRgbaColor,
  warningMuted: HexOrRgbaColor,
  danger: HexOrRgbaColor,
  dangerMuted: HexOrRgbaColor,
  gradientStart: HexOrRgbaColor,
  gradientEnd: HexOrRgbaColor,
});

export const DesignTokensSchema = z.object({
  schemaVersion: z.literal('1.0.0').default('1.0.0'),
  project: z.object({
    slug: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
    name: z.string().min(1),
    category: z.string().min(1),
    audience: z.string().min(1),
    platform: z.literal('expo').default('expo'),
  }),
  visualDirection: z.object({
    primary: VisualDirectionIdSchema,
    secondary: VisualDirectionIdSchema.optional(),
    surfaceMode: z.enum(['operate', 'experience', 'read', 'persuade']).default('operate'),
    rationale: z.string().min(10),
    antiPatternsToAvoid: z.array(z.string()).default([]),
  }),
  theme: z.object({
    defaultMode: z.enum(['light', 'dark', 'system']).default('system'),
    light: ColorPaletteSchema,
    dark: ColorPaletteSchema.optional(),
    typography: z.object({
      displayFont: z.string().default('System'),
      bodyFont: z.string().default('System'),
      displaySize: z.number().min(24).max(48).default(30),
      bodySize: z.number().min(14).max(18).default(15),
    }),
    radius: z.object({
      sm: z.number().min(0).max(24).default(8),
      md: z.number().min(0).max(32).default(14),
      lg: z.number().min(0).max(40).default(20),
      xl: z.number().min(0).max(48).default(26),
    }),
    spacingUnit: z.number().min(4).max(8).default(4),
  }),
});

export type DesignTokens = z.infer<typeof DesignTokensSchema>;
export type VisualDirectionId = z.infer<typeof VisualDirectionIdSchema>;
