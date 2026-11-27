import { z } from 'zod';

export const PipelineStageSchema = z.enum([
  'queued',
  'product',
  'design',
  'ux',
  'compile',
  'assets',
  'build',
  'technical_qa',
  'screenshots',
  'visual_qa',
  'repair',
  'complete',
  'failed_product',
  'failed_design',
  'failed_compilation',
  'failed_assets',
  'failed_build',
  'failed_technical_qa',
  'failed_screenshot',
  'failed_visual_qa',
]);

export const StageRecordSchema = z.object({
  status: z.enum(['pending', 'running', 'passed', 'failed', 'skipped']),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  error: z.string().optional(),
  artifactPath: z.string().optional(),
});

export const PipelineStateSchema = z.object({
  schemaVersion: z.literal('1.0.0').default('1.0.0'),
  projectSlug: z.string().min(1),
  displayName: z.string().min(1),
  currentStage: PipelineStageSchema.default('queued'),
  iteration: z.number().int().min(0).default(0),
  maxIterations: z.number().int().min(1).default(3),
  createdAt: z.string(),
  updatedAt: z.string(),
  stages: z.record(z.string(), StageRecordSchema).default({}),
  artifacts: z.record(z.string(), z.string()).default({}),
  lastQaScore: z.number().min(0).max(100).optional(),
});

export type PipelineStage = z.infer<typeof PipelineStageSchema>;
export type PipelineState = z.infer<typeof PipelineStateSchema>;
