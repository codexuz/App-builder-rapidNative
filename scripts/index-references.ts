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

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.jfif']);

function inferTags(input: string): string[] {
  const lower = input.toLowerCase();
  const tags = new Set<string>();

  const rules: Array<[RegExp, string]> = [
    [/bottom-tab|tab\s*bar|bnb-/, 'navigation-tabbar'],
    [/onboard|welcome|get-started|splash/, 'onboarding'],
    [/auth|sign\s*in|login|password|verif|otp|phone/, 'auth'],
    [/home|dashboard/, 'home-dashboard'],
    [/quiz|test|lesson|practice|review|vocab|listening/, 'learning-exercise'],
    [/talk|voice|speak|record|tutor/, 'voice-ai'],
    [/leaderboard|rank|streak|goal|progress|widget|fito/, 'gamification'],
    [/payment|paywall|subscri|paypal|checkout/, 'monetization'],
    [/pos|scan|product|commerce|cart/, 'commerce-pos'],
    [/chat|message|telegram|thread|social|reply|forward/, 'social-chat'],
    [/weather|forecast/, 'weather-telemetry'],
    [/empty|connectivity|not\s*found|error|no\s*network/, 'empty-error-state'],
    [/setting|profile|account|privacy|terms/, 'profile-settings'],
    [/search|explore|filter/, 'discovery-search'],
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
  const categoryCounts: Record<string, { images: number; archives: number; archiveScreens: number }> = {};

  function walk(dir: string): void {
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

      if (!categoryCounts[category]) {
        categoryCounts[category] = { images: 0, archives: 0, archiveScreens: 0 };
      }

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
          totalIndexedScreens: images.length + totalArchiveScreens,
          categories: categoryCounts,
        },
        images,
        archives,
      },
      null,
      2
    )}\n`,
    'utf8'
  );

  console.log(
    `Indexed ${images.length} loose images + ${totalArchiveScreens} archived screens (${archives.length} zips) -> ${path.relative(rootDir, outPath)}`
  );
}

main();
