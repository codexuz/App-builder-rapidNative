import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { inspectImageFile } from './lib/image-meta';

interface LooseImageRef {
  path: string;
  category: string;
  filename: string;
  format: string;
  width: number;
  height: number;
  tags: string[];
}

interface ArchiveRef {
  path: string;
  category: string;
  filename: string;
  screenCount: number;
  tags: string[];
  sampleScreens: string[];
  allScreens: string[];
}

interface FlowKeyframeRef {
  frame: number;
  path: string;
  deltaFromPrevKeyframe?: number;
  stepDelta?: number;
}

interface FlowSequenceRef {
  flowId: string;
  path: string;
  category: string;
  frameCount: number;
  format: string;
  width: number;
  height: number;
  tags: string[];
  keyframeCount: number;
  keyframes: FlowKeyframeRef[];
}

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.jfif']);

function inferTags(input: string): string[] {
  const lower = input.toLowerCase();
  const tags = new Set<string>();

  const rules: Array<[RegExp, string]> = [
    [/bottom-tab|tab\s*bar|bnb-/, 'navigation-tabbar'],
    [/onboard|welcome|get-started|splash|fluency\s*level|choose-language/, 'onboarding'],
    [/auth|sign\s*in|login|register|password|verif|otp|phone|create\s*new\s*account/, 'auth'],
    [/home|dashboard|asosiy/, 'home-dashboard'],
    [/quiz|test|lesson|practice|review|vocab|listening|reading|writing|course|learna|speak\s*up|bahasaku|duolingo|dolingo|ibrat|missiya|ielts|englify|jolingo|phrasebook|word\s*cards|darslar/, 'learning-exercise'],
    [/talk|voice|speak|record|tutor|vaysaqi/, 'voice-ai'],
    [/leaderboard|rank|streak|goal|progress|widget|fito|achievement|certificate|kunlik|o'yin|yuzma|jang|medallar/, 'gamification'],
    [/payment|paywall|subscri|paypal|checkout|apple\s*pay|confirm\s*plan/, 'monetization'],
    [/pos|scan|product|commerce|cart/, 'commerce-pos'],
    [/chat|message|telegram|thread|social|reply|forward/, 'social-chat'],
    [/weather|forecast/, 'weather-telemetry'],
    [/empty|connectivity|not\s*found|error|no\s*network/, 'empty-error-state'],
    [/setting|profile|account|privacy|terms|logout/, 'profile-settings'],
    [/search|explore|filter|country/, 'discovery-search'],
    [/flow-/, 'flow-sequence'],
  ];

  for (const [regex, tag] of rules) {
    if (regex.test(lower)) tags.add(tag);
  }
  return Array.from(tags);
}

function listZipImages(zipPath: string): string[] {
  try {
    const out = execFileSync(
      'python3',
      [
        '-c',
        `import json, os, sys, zipfile
with zipfile.ZipFile(sys.argv[1]) as zf:
    names = [n for n in zf.namelist() if not n.endswith('/') and '__MACOSX' not in n and os.path.splitext(n)[1].lower() in ('.png','.jpg','.jpeg','.webp','.jfif')]
print(json.dumps(names))`,
        zipPath,
      ],
      { encoding: 'utf8', maxBuffer: 5 * 1024 * 1024 }
    );
    return JSON.parse(out.trim()) as string[];
  } catch {
    return [];
  }
}

function main(): void {
  const rootDir = process.cwd();
  const refsRoot = path.join(rootDir, 'app uis');
  if (!fs.existsSync(refsRoot)) {
    console.error(`Reference directory not found: ${refsRoot}`);
    process.exit(1);
  }

  const images: LooseImageRef[] = [];
  const archives: ArchiveRef[] = [];
  const flows: FlowSequenceRef[] = [];
  const skipFlowDirs = new Set<string>();
  const categoryCounts: Record<
    string,
    { images: number; archives: number; archiveScreens: number; flowSequences: number; flowFrames: number }
  > = {};

  function ensureCategory(category: string): void {
    if (!categoryCounts[category]) {
      categoryCounts[category] = {
        images: 0,
        archives: 0,
        archiveScreens: 0,
        flowSequences: 0,
        flowFrames: 0,
      };
    }
  }

  function registerManifestFlows(dir: string): void {
    const manifestPath = path.join(dir, 'flow-manifest.json');
    if (!fs.existsSync(manifestPath)) return;
    try {
      const parsed = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as {
        flows?: Array<{
          flowId: string;
          frameCount: number;
          format?: string;
          width?: number;
          height?: number;
          keyframeCount?: number;
          keyframes?: FlowKeyframeRef[];
        }>;
      };
      const relDir = path.relative(refsRoot, dir).replace(/\\/g, '/');
      const category = relDir.includes('/') ? relDir.split('/')[0] : relDir || 'general';
      ensureCategory(category);

      for (const f of parsed.flows ?? []) {
        const flowDir = path.join(dir, f.flowId);
        if (!fs.existsSync(flowDir)) continue;
        skipFlowDirs.add(flowDir);
        const relFlowPath = path.relative(rootDir, flowDir).replace(/\\/g, '/');
        const keyframes = f.keyframes ?? [];
        flows.push({
          flowId: f.flowId,
          path: relFlowPath,
          category,
          frameCount: f.frameCount,
          format: f.format ?? 'webp',
          width: f.width ?? 0,
          height: f.height ?? 0,
          tags: Array.from(new Set([...inferTags(relDir), ...inferTags(f.flowId), 'flow-sequence'])),
          keyframeCount: f.keyframeCount ?? keyframes.length,
          keyframes,
        });
        categoryCounts[category].flowSequences += 1;
        categoryCounts[category].flowFrames += f.frameCount;
      }
    } catch {
      // Fall back to regular file walk if manifest cannot be parsed.
    }
  }

  function walk(dir: string): void {
    if (skipFlowDirs.has(dir)) return;
    registerManifestFlows(dir);

    const entries = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }

      const relPath = path.relative(rootDir, fullPath).replace(/\\/g, '/');
      const relFromRefs = path.relative(refsRoot, fullPath).replace(/\\/g, '/');
      const category = relFromRefs.includes('/') ? relFromRefs.split('/')[0] : 'general';
      const ext = path.extname(entry.name).toLowerCase();

      ensureCategory(category);

      if (IMAGE_EXTS.has(ext)) {
        const meta = inspectImageFile(fullPath);
        images.push({
          path: relPath,
          category,
          filename: entry.name,
          format: meta.format,
          width: meta.width,
          height: meta.height,
          tags: inferTags(relFromRefs),
        });
        categoryCounts[category].images += 1;
      } else if (ext === '.zip') {
        const screens = listZipImages(fullPath);
        const tagSet = new Set<string>(inferTags(relFromRefs));
        for (const s of screens) {
          for (const t of inferTags(s)) tagSet.add(t);
        }
        archives.push({
          path: relPath,
          category,
          filename: entry.name,
          screenCount: screens.length,
          tags: Array.from(tagSet),
          sampleScreens: screens.slice(0, 8),
          allScreens: screens,
        });
        categoryCounts[category].archives += 1;
        categoryCounts[category].archiveScreens += screens.length;
      }
    }
  }

  walk(refsRoot);

  const totalArchiveScreens = archives.reduce((sum, a) => sum + a.screenCount, 0);
  const totalFlowFrames = flows.reduce((sum, f) => sum + f.frameCount, 0);
  const totalFlowKeyframes = flows.reduce((sum, f) => sum + f.keyframeCount, 0);
  const outPath = path.join(rootDir, 'knowledge', 'design-references', 'index.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(
    outPath,
    `${JSON.stringify(
      {
        schemaVersion: '1.0.0',
        generatedAt: new Date().toISOString(),
        sourceDirectory: 'app uis',
        summary: {
          looseImages: images.length,
          zipArchives: archives.length,
          archivedScreens: totalArchiveScreens,
          flowSequences: flows.length,
          flowFrames: totalFlowFrames,
          flowKeyframes: totalFlowKeyframes,
          totalIndexedScreens: images.length + totalArchiveScreens + totalFlowFrames,
          categories: categoryCounts,
        },
        images,
        flows,
        archives,
      },
      null,
      2
    )}\n`,
    'utf8'
  );

  console.log(
    `Indexed ${images.length} loose images + ${totalFlowFrames} flow frames (${flows.length} sequences, ${totalFlowKeyframes} keyframes) + ${totalArchiveScreens} archived screens (${archives.length} zips) -> ${path.relative(rootDir, outPath)}`
  );
}

main();
