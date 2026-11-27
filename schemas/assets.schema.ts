import { z } from 'zod';

export const AssetItemSchema = z.object({
  key: z.string().min(1),
  filename: z.string().min(1),
  type: z
    .enum(['icon', 'splash', 'hero', 'illustration', 'character', 'background', 'empty-state', 'badge'])
    .default('illustration'),
  prompt: z.string().min(5),
  model: z.string().optional(),
  aspectRatio: z.string().default('1:1'),
  outputFormat: z.enum(['png', 'jpg', 'webp']).default('png'),
  resolution: z.enum(['1K', '2K', '4K']).optional(),
  quality: z.enum(['low', 'medium', 'high']).optional(),
  background: z.enum(['auto', 'transparent', 'opaque']).optional(),
  transparent: z.boolean().optional(),
  provider: z.enum(['gemini', 'kie']).optional(),
  cutoutMode: z.enum(['auto', 'chroma-green', 'chroma-magenta', 'white', 'none']).optional(),
  sourceFile: z.string().optional(),
  copyTo: z.array(z.string()).optional(),
  usedIn: z.array(z.string()).default([]),
  characterRefId: z.string().optional(),
  // Persisted runtime metadata updated by scripts/kie-assets.ts or scripts/cutout-assets.ts
  status: z.enum(['pending', 'approved', 'failed']).default('pending'),
  taskId: z.string().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  generatedAt: z.string().optional(),
  error: z.string().optional(),
});

export const CharacterReferenceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  visualAttributes: z.string().min(10),
  referenceFile: z.string().optional(),
});

export const AssetsManifestSchema = z.object({
  schemaVersion: z.literal('1.0.0').default('1.0.0'),
  defaultModel: z.string().optional(),
  stylePrefix: z.string().optional(),
  characterReferences: z.array(CharacterReferenceSchema).default([]),
  assets: z.array(AssetItemSchema),
});

export type AssetItem = z.infer<typeof AssetItemSchema>;
export type AssetsManifest = z.infer<typeof AssetsManifestSchema>;
