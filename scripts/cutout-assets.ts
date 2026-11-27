import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { AssetsManifestSchema } from '../schemas/assets.schema.js';
import { inspectImageFile } from './lib/image-meta.js';

const ROOT = process.cwd();
const EXTRACTOR = path.join(ROOT, 'scripts', 'extract-cutout.py');

function runExtractor(opts: {
  input: string;
  output: string;
  mode?: string;
  bgColor?: string;
  tolerance?: string;
  feather?: string;
  pad?: string;
  maxSize?: string;
  preview?: string;
}) {
  const args = [EXTRACTOR, opts.input, opts.output];
  if (opts.mode) args.push('--mode', opts.mode);
  if (opts.bgColor) args.push('--bg-color', opts.bgColor);
  if (opts.tolerance) args.push('--tolerance', opts.tolerance);
  if (opts.feather) args.push('--feather', opts.feather);
  if (opts.pad) args.push('--pad', opts.pad);
  if (opts.maxSize) args.push('--max-size', opts.maxSize);
  if (opts.preview) args.push('--preview', opts.preview);

  const stdout = execFileSync('python3', args, { encoding: 'utf8' }).trim();
  console.log(stdout);
}

function getFlag(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  if (idx !== -1 && idx + 1 < args.length) return args[idx + 1];
  return undefined;
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(
      [
        'Usage:',
        '  pnpm assets:cutout <input> <output.png> [--mode auto|chroma-green|chroma-magenta|white|solid] [--max-size 512] [--preview qa.png]',
        '  pnpm assets:cutout --app <slug> [--max-size 512]   # Extracts all transparent assets in apps/<slug>/.factory/ASSETS.json',
      ].join('\n'),
    );
    process.exit(0);
  }

  const appSlug = getFlag(args, '--app');
  const mode = getFlag(args, '--mode');
  const bgColor = getFlag(args, '--bg-color');
  const tolerance = getFlag(args, '--tolerance');
  const feather = getFlag(args, '--feather');
  const pad = getFlag(args, '--pad');
  const maxSize = getFlag(args, '--max-size') ?? '512';
  const preview = getFlag(args, '--preview');

  if (appSlug) {
    const appDir = path.join(ROOT, 'apps', appSlug);
    const manifestPath = path.join(appDir, '.factory', 'ASSETS.json');
    if (!fs.existsSync(manifestPath)) {
      console.error(`Manifest not found: ${manifestPath}`);
      process.exit(1);
    }
    const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const manifest = AssetsManifestSchema.parse(raw);

    let processed = 0;
    for (const item of manifest.assets) {
      const wantsCutout =
        item.transparent === true ||
        item.background === 'transparent' ||
        (item.cutoutMode && item.cutoutMode !== 'none');
      if (!wantsCutout) continue;

      const outPath = path.join(appDir, 'assets', 'generated', item.filename);
      const rawCandidate = item.sourceFile
        ? path.resolve(appDir, item.sourceFile)
        : outPath;

      if (!fs.existsSync(rawCandidate)) {
        console.warn(`Skipping ${item.key}: source file not found (${rawCandidate})`);
        continue;
      }

      runExtractor({
        input: rawCandidate,
        output: outPath,
        mode: mode ?? (item.cutoutMode && item.cutoutMode !== 'none' ? item.cutoutMode : 'auto'),
        bgColor,
        tolerance,
        feather,
        pad,
        maxSize,
      });

      const meta = inspectImageFile(outPath);
      if (meta) {
        item.width = meta.width;
        item.height = meta.height;
      }
      item.status = 'approved';
      item.generatedAt = new Date().toISOString();
      processed++;
    }

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
    console.log(`Processed ${processed} transparent cutout asset(s) for ${appSlug}.`);
    return;
  }

  const positional = args.filter((a, i) => {
    if (a.startsWith('--')) return false;
    if (i > 0 && args[i - 1].startsWith('--')) return false;
    return true;
  });

  if (positional.length < 2) {
    console.error('Provide <input> <output.png> or --app <slug>.');
    process.exit(1);
  }

  runExtractor({
    input: path.resolve(positional[0]),
    output: path.resolve(positional[1]),
    mode,
    bgColor,
    tolerance,
    feather,
    pad,
    maxSize,
    preview: preview ? path.resolve(preview) : undefined,
  });
}

main();
