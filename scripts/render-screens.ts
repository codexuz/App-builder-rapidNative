import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import path from 'node:path';
import { ScreensSpecSchema } from '../schemas';
import { getFactoryDir, loadOrInitPipelineState, recordStageStatus } from './lib/state';

interface CaptureTarget {
  id: string;
  route: string;
  scrollOffsets: number[];
}

interface CaptureResultItem {
  id: string;
  route: string;
  theme: 'light' | 'dark';
  file: string;
  consoleErrors: string[];
  pageErrors: string[];
  horizontalOverflowPx: number;
}

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.svg': 'image/svg+xml',
};

function parseFlags(args: string[]): { slug: string; flags: Record<string, string | boolean> } {
  let slug = '';
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith('--')) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else if (!slug) {
      slug = arg;
    }
  }
  return { slug, flags };
}

function discoverRoutesFromAppDir(appDir: string): CaptureTarget[] {
  const tabsDir = path.join(appDir, 'app', '(tabs)');
  const targets: CaptureTarget[] = [];

  if (fs.existsSync(tabsDir)) {
    const files = fs
      .readdirSync(tabsDir)
      .filter((f) => f.endsWith('.tsx') && !f.startsWith('_'))
      .sort();

    for (const file of files) {
      const name = file.replace(/\.tsx$/, '');
      const route = name === 'index' ? '/' : `/${name}`;
      targets.push({
        id: name === 'index' ? 'home' : name,
        route,
        scrollOffsets: name === 'index' ? [0, 420] : [0],
      });
    }
  }

  if (targets.length === 0) {
    targets.push({ id: 'home', route: '/', scrollOffsets: [0] });
  }
  return targets;
}

function resolveTargets(appDir: string, routesFlag?: string): CaptureTarget[] {
  if (routesFlag) {
    return routesFlag
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean)
      .map((route, idx) => ({
        id: route === '/' ? 'home' : route.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '') || `screen-${idx + 1}`,
        route: route.startsWith('/') ? route : `/${route}`,
        scrollOffsets: [0],
      }));
  }

  const screensPath = path.join(getFactoryDir(appDir), 'SCREENS.json');
  if (fs.existsSync(screensPath)) {
    const parsed = ScreensSpecSchema.parse(JSON.parse(fs.readFileSync(screensPath, 'utf8')));
    return parsed.screens
      .filter((s) => s.captureInQa)
      .map((s) => ({
        id: s.id,
        route: s.route,
        scrollOffsets: s.scrollOffsets.length > 0 ? s.scrollOffsets : [0],
      }));
  }

  return discoverRoutesFromAppDir(appDir);
}

function startStaticServer(distDir: string): Promise<{ server: http.Server; port: number }> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const urlPath = (req.url ?? '/').split('?')[0];
      let filePath = path.join(distDir, urlPath === '/' ? 'index.html' : urlPath);
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(distDir, 'index.html');
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        'Content-Type': MIME_TYPES[ext] ?? 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      fs.createReadStream(filePath).pipe(res);
    });

    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address() as AddressInfo;
      resolve({ server, port: addr.port });
    });
  });
}

async function main(): Promise<void> {
  const { slug, flags } = parseFlags(process.argv.slice(2));
  if (!slug) {
    console.error(
      'Usage: pnpm app:shot <app-slug> [--iteration N] [--routes /,/profile] [--dark] [--skip-build] [--viewport 390x844]'
    );
    process.exit(1);
  }

  const rootDir = process.cwd();
  const appDir = path.join(rootDir, 'apps', slug);
  if (!fs.existsSync(appDir)) {
    console.error(`App not found: ${appDir}`);
    process.exit(1);
  }

  const state = loadOrInitPipelineState(appDir, slug);
  const iteration =
    typeof flags.iteration === 'string'
      ? Math.max(1, Number(flags.iteration) || 1)
      : Math.max(1, state.iteration + 1);
  const iterationFolder = `iteration-${String(iteration).padStart(2, '0')}`;
  const outDir = path.join(getFactoryDir(appDir), 'screenshots', iterationFolder);
  fs.mkdirSync(outDir, { recursive: true });

  const [vw, vh] =
    typeof flags.viewport === 'string' && flags.viewport.includes('x')
      ? flags.viewport.split('x').map((n) => Number(n) || 390)
      : [390, 844];

  const includeDark = Boolean(flags.dark);
  const skipBuild = Boolean(flags['skip-build']);
  const distDir = path.join(appDir, 'dist');

  recordStageStatus(appDir, slug, 'screenshots', 'running');

  if (!skipBuild || !fs.existsSync(path.join(distDir, 'index.html'))) {
    console.log(`Exporting Expo Web bundle for "${slug}"...`);
    execFileSync('pnpm', ['exec', 'expo', 'export', '--platform', 'web', '--output-dir', 'dist'], {
      cwd: appDir,
      stdio: 'inherit',
    });
  }

  const targets = resolveTargets(appDir, typeof flags.routes === 'string' ? flags.routes : undefined);
  const themes: Array<'light' | 'dark'> = includeDark ? ['light', 'dark'] : ['light'];

  console.log(
    `Capturing ${targets.length} route(s) x ${themes.length} theme(s) at ${vw}x${vh} into ${path.relative(rootDir, outDir)}...`
  );

  const { server, port } = await startStaticServer(distDir);

  const pyScript = `
import json, os, sys
from playwright.sync_api import sync_playwright

cfg = json.loads(sys.stdin.read())
results = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    for theme in cfg["themes"]:
        ctx = browser.new_context(
            viewport={"width": cfg["width"], "height": cfg["height"]},
            device_scale_factor=2,
            color_scheme=theme,
        )
        page = ctx.new_page()
        for target in cfg["targets"]:
            for offset in target["scrollOffsets"]:
                console_errors = []
                page_errors = []
                def on_pageerror(err, pe=page_errors):
                    pe.append(str(err))
                def on_console(msg, ce=console_errors):
                    if msg.type == "error":
                        ce.append(msg.text)
                page.on("pageerror", on_pageerror)
                page.on("console", on_console)

                url = f"http://127.0.0.1:{cfg['port']}{target['route']}"
                page.goto(url, wait_until="networkidle")
                page.wait_for_timeout(900)

                if offset > 0:
                    page.evaluate("""(y) => {
                      const scrollers = Array.from(document.querySelectorAll('div'))
                        .filter(el => el.scrollHeight > el.clientHeight + 80);
                      if (scrollers[0]) scrollers[0].scrollTop = y;
                      else window.scrollBy(0, y);
                    }""", offset)
                    page.wait_for_timeout(450)

                overflow_px = page.evaluate("""() => {
                  return Math.max(0, Math.round(document.documentElement.scrollWidth - document.documentElement.clientWidth));
                }""")

                suffix = f"_scroll{offset}" if offset > 0 else ""
                filename = f"{target['id']}_{theme}{suffix}.png"
                out_path = os.path.join(cfg["outDir"], filename)
                page.screenshot(path=out_path)
                results.append({
                    "id": target["id"],
                    "route": target["route"],
                    "theme": theme,
                    "file": filename,
                    "consoleErrors": console_errors,
                    "pageErrors": page_errors,
                    "horizontalOverflowPx": overflow_px,
                })
                page.remove_listener("pageerror", on_pageerror)
                page.remove_listener("console", on_console)
        ctx.close()
    browser.close()

print(json.dumps(results))
`;

  try {
    const rawOutput = await runPythonAsync(
      pyScript,
      JSON.stringify({
        port,
        outDir,
        width: vw,
        height: vh,
        themes,
        targets,
      })
    );

    const captures = JSON.parse(rawOutput.trim()) as CaptureResultItem[];
    const manifestPath = path.join(outDir, 'capture-manifest.json');
    const totalErrors = captures.reduce(
      (sum, c) => sum + c.consoleErrors.length + c.pageErrors.length,
      0
    );
    const maxOverflow = captures.reduce((m, c) => Math.max(m, c.horizontalOverflowPx), 0);

    fs.writeFileSync(
      manifestPath,
      `${JSON.stringify(
        {
          slug,
          iteration,
          viewport: `${vw}x${vh}`,
          capturedAt: new Date().toISOString(),
          totalCaptures: captures.length,
          totalRuntimeErrors: totalErrors,
          maxHorizontalOverflowPx: maxOverflow,
          captures,
        },
        null,
        2
      )}\n`,
      'utf8'
    );

    for (const c of captures) {
      const errCount = c.consoleErrors.length + c.pageErrors.length;
      const statusIcon = errCount === 0 && c.horizontalOverflowPx <= 2 ? '✓' : '⚠';
      console.log(
        `  ${statusIcon} ${c.file} (route=${c.route}, errors=${errCount}, overflow=${c.horizontalOverflowPx}px)`
      );
    }

    recordStageStatus(appDir, slug, 'screenshots', 'passed', {
      artifactPath: path.relative(rootDir, outDir),
    });

    console.log(`\nSaved ${captures.length} screenshot(s) to ${path.relative(rootDir, outDir)}`);
  } finally {
    server.close();
  }
}

function runPythonAsync(script: string, stdinData: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn('python3', ['-c', script], { stdio: ['pipe', 'pipe', 'pipe'] });
    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];

    child.stdout.on('data', (chunk: Buffer) => stdoutChunks.push(chunk));
    child.stderr.on('data', (chunk: Buffer) => stderrChunks.push(chunk));
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(Buffer.concat(stderrChunks).toString('utf8') || `python3 exited with code ${code}`));
      } else {
        resolve(Buffer.concat(stdoutChunks).toString('utf8'));
      }
    });

    child.stdin.write(stdinData);
    child.stdin.end();
  });
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
