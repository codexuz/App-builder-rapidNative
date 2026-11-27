import { z } from 'zod';

export const QaRubricSchema = z.object({
  visualHierarchy: z.number().min(0).max(20),
  typography: z.number().min(0).max(15),
  layoutAndSpacing: z.number().min(0).max(15),
  colorAndContrast: z.number().min(0).max(10),
  originality: z.number().min(0).max(15),
  motionImplementation: z.number().min(0).max(15),
  consistency: z.number().min(0).max(10),
});

export const QaReportSchema = z.object({
  schemaVersion: z.literal('1.0.0').default('1.0.0'),
  projectSlug: z.string().min(1),
  iteration: z.number().int().min(1),
  evaluatedAt: z.string(),
  screenshotsReviewed: z.array(z.string()).min(1),
  score: z.number().min(0).max(100),
  rubric: QaRubricSchema.optional(),
  criticalIssues: z.array(z.string()).default([]),
  designViolations: z.array(z.string()).default([]),
  layoutIssues: z.array(z.string()).default([]),
  typographyIssues: z.array(z.string()).default([]),
  assetIssues: z.array(z.string()).default([]),
  improvements: z.array(z.string()).default([]),
  repairInstructions: z.array(z.string()).default([]),
  runtimeChecks: z
    .object({
      typescriptPassed: z.boolean(),
      webBundlePassed: z.boolean(),
      consoleErrors: z.number().int().min(0),
      horizontalOverflowDetected: z.boolean(),
    })
    .optional(),
  passed: z.boolean(),
});

export type QaReport = z.infer<typeof QaReportSchema>;
