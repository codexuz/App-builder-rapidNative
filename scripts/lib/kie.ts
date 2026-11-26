import fs from 'node:fs';
import path from 'node:path';

const KIE_BASE_URL = 'https://api.kie.ai';

export interface KieCreateTaskResponse {
  code: number;
  msg: string;
  data?: {
    taskId: string;
  };
}

export type KieTaskState = 'waiting' | 'queuing' | 'generating' | 'success' | 'fail';

export interface KieRecordInfoResponse {
  code: number;
  msg: string;
  data?: {
    taskId: string;
    model: string;
    state: KieTaskState;
    resultJson?: string;
    failCode?: string;
    failMsg?: string;
    progress?: number;
    creditsConsumed?: number;
  };
}

export interface KieImageOptions {
  prompt: string;
  model?: string;
  aspectRatio?: string;
  outputFormat?: 'png' | 'jpg' | 'webp';
  resolution?: '1K' | '2K' | '4K';
  quality?: 'low' | 'medium' | 'high';
  background?: 'auto' | 'transparent' | 'opaque';
  extraInput?: Record<string, unknown>;
}

export interface KieGenerationResult {
  taskId: string;
  model: string;
  urls: string[];
  creditsConsumed?: number;
}

export class KieClient {
  private readonly apiKey: string;
  private readonly defaultModel: string;

  constructor(apiKey?: string, defaultModel?: string) {
    const resolvedKey = apiKey ?? process.env.KIE_API_KEY ?? '';
    if (!resolvedKey || resolvedKey === 'your_kie_api_key_here') {
      throw new Error(
        'Missing KIE_API_KEY. Copy .env.example to .env and add your key from https://kie.ai/api-key'
      );
    }
    this.apiKey = resolvedKey;
    this.defaultModel =
      defaultModel ??
      process.env.KIE_DEFAULT_IMAGE_MODEL ??
      'gpt-image-2-6/flare-text-to-image';
  }

  async createTask(model: string, input: Record<string, unknown>): Promise<string> {
    const res = await fetch(`${KIE_BASE_URL}/api/v1/jobs/createTask`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, input }),
    });

    if (!res.ok) {
      throw new Error(`Kie.ai HTTP error ${res.status}: ${await res.text()}`);
    }

    const payload = (await res.json()) as KieCreateTaskResponse;
    // Kie.ai returns API errors inside HTTP 200 with a non-200 `code` field.
    if (payload.code !== 200 || !payload.data?.taskId) {
      throw new Error(`Kie.ai createTask failed (code=${payload.code}): ${payload.msg}`);
    }
    return payload.data.taskId;
  }

  async pollTask(
    taskId: string,
    options: { timeoutMs?: number; initialDelayMs?: number } = {}
  ): Promise<KieGenerationResult> {
    const timeoutMs = options.timeoutMs ?? 5 * 60 * 1000;
    const deadline = Date.now() + timeoutMs;
    let delayMs = options.initialDelayMs ?? 2500;

    while (Date.now() < deadline) {
      const res = await fetch(
        `${KIE_BASE_URL}/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error(`Kie.ai poll HTTP error ${res.status}: ${await res.text()}`);
      }

      const payload = (await res.json()) as KieRecordInfoResponse;
      if (payload.code !== 200 || !payload.data) {
        throw new Error(`Kie.ai recordInfo failed (code=${payload.code}): ${payload.msg}`);
      }

      const { state, failCode, failMsg, resultJson, model, creditsConsumed } = payload.data;

      if (state === 'fail') {
        throw new Error(`Kie.ai task ${taskId} failed (${failCode ?? 'unknown'}): ${failMsg ?? 'no details'}`);
      }

      if (state === 'success') {
        const urls = extractResultUrls(resultJson);
        if (urls.length === 0) {
          throw new Error(`Kie.ai task ${taskId} succeeded but returned no result URLs.`);
        }
        return { taskId, model, urls, creditsConsumed };
      }

      await sleep(delayMs);
      delayMs = Math.min(Math.round(delayMs * 1.35), 8000);
    }

    throw new Error(`Kie.ai task ${taskId} timed out after ${Math.round(timeoutMs / 1000)}s`);
  }

  async generateImage(options: KieImageOptions): Promise<KieGenerationResult> {
    const model = options.model ?? this.defaultModel;
    const input: Record<string, unknown> = {
      prompt: options.prompt,
      aspect_ratio: options.aspectRatio ?? '1:1',
      output_format: options.outputFormat ?? 'png',
      ...(options.extraInput ?? {}),
    };

    // Include GPT Image parameters only when targeting GPT Image models
    if (model.startsWith('gpt-image')) {
      input.resolution = options.resolution ?? '1K';
      input.quality = options.quality ?? 'medium';
      if (options.background) {
        input.background = options.background;
      }
    }

    const taskId = await this.createTask(model, input);
    return this.pollTask(taskId);
  }

  async downloadFile(url: string, outputPath: string): Promise<void> {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to download asset (${res.status}) from ${url}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, Buffer.from(arrayBuffer));
  }
}

function extractResultUrls(resultJson?: string): string[] {
  if (!resultJson) return [];
  try {
    const parsed = JSON.parse(resultJson) as {
      resultUrls?: unknown;
      urls?: unknown;
      url?: unknown;
    };
    if (Array.isArray(parsed.resultUrls)) {
      return parsed.resultUrls.filter((u): u is string => typeof u === 'string');
    }
    if (Array.isArray(parsed.urls)) {
      return parsed.urls.filter((u): u is string => typeof u === 'string');
    }
    if (typeof parsed.url === 'string') {
      return [parsed.url];
    }
    return [];
  } catch {
    return [];
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
