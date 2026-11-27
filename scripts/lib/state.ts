import fs from 'node:fs';
import path from 'node:path';
import {
  PipelineStateSchema,
  type PipelineStage,
  type PipelineState,
} from '../../schemas';

export function getFactoryDir(appDir: string): string {
  return path.join(appDir, '.factory');
}

export function getStatePath(appDir: string): string {
  return path.join(getFactoryDir(appDir), 'STATE.json');
}

export function loadOrInitPipelineState(
  appDir: string,
  slug: string,
  displayName?: string
): PipelineState {
  const statePath = getStatePath(appDir);
  if (fs.existsSync(statePath)) {
    const raw = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    return PipelineStateSchema.parse(raw);
  }

  const now = new Date().toISOString();
  const state: PipelineState = PipelineStateSchema.parse({
    schemaVersion: '1.0.0',
    projectSlug: slug,
    displayName: displayName ?? slug,
    currentStage: 'queued',
    iteration: 0,
    maxIterations: 3,
    createdAt: now,
    updatedAt: now,
    stages: {},
    artifacts: {},
  });

  savePipelineState(appDir, state);
  return state;
}

export function savePipelineState(appDir: string, state: PipelineState): void {
  const statePath = getStatePath(appDir);
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  const next: PipelineState = {
    ...state,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(statePath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
}

export function recordStageStatus(
  appDir: string,
  slug: string,
  stage: PipelineStage,
  status: 'running' | 'passed' | 'failed' | 'skipped',
  extra: { artifactPath?: string; error?: string; lastQaScore?: number; incrementIteration?: boolean } = {}
): PipelineState {
  const state = loadOrInitPipelineState(appDir, slug);
  const now = new Date().toISOString();
  const prevStage = state.stages[stage];

  state.currentStage = status === 'failed' ? toFailureStage(stage) : stage;
  state.stages[stage] = {
    status,
    startedAt: prevStage?.startedAt ?? now,
    completedAt: status === 'running' ? undefined : now,
    artifactPath: extra.artifactPath ?? prevStage?.artifactPath,
    error: extra.error,
  };

  if (extra.artifactPath) {
    state.artifacts[stage] = extra.artifactPath;
  }
  if (extra.lastQaScore !== undefined) {
    state.lastQaScore = extra.lastQaScore;
  }
  if (extra.incrementIteration) {
    state.iteration += 1;
  }

  savePipelineState(appDir, state);
  return state;
}

function toFailureStage(stage: PipelineStage): PipelineStage {
  switch (stage) {
    case 'product':
      return 'failed_product';
    case 'design':
    case 'ux':
      return 'failed_design';
    case 'compile':
      return 'failed_compilation';
    case 'assets':
      return 'failed_assets';
    case 'build':
      return 'failed_build';
    case 'technical_qa':
      return 'failed_technical_qa';
    case 'screenshots':
      return 'failed_screenshot';
    case 'visual_qa':
      return 'failed_visual_qa';
    default:
      return stage;
  }
}
