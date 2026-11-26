import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { loadRootEnv } from './lib/env';

function main(): void {
  loadRootEnv();
  const [mode, slug, extra] = process.argv.slice(2);

  if (!mode || !slug) {
    console.error('Usage:');
    console.error('  pnpm app:web <app-slug>');
    console.error('  pnpm app:phone <app-slug>');
    console.error('  pnpm app:build <app-slug> [ios|android|all]');
    process.exit(1);
  }

  const appDir = path.join(process.cwd(), 'apps', slug);
  if (!fs.existsSync(appDir)) {
    console.error(`App not found: ${appDir}`);
    process.exit(1);
  }

  let cmd = 'pnpm';
  let args: string[] = [];

  if (mode === 'web') {
    args = ['exec', 'expo', 'start', '--web'];
  } else if (mode === 'phone') {
    args = ['exec', 'expo', 'start', '--tunnel'];
  } else if (mode === 'build') {
    const platform = extra && ['ios', 'android', 'all'].includes(extra) ? extra : 'all';
    cmd = 'npx';
    args = ['--yes', 'eas-cli', 'build', '--platform', platform, '--profile', 'preview'];
  } else {
    console.error(`Unknown mode: ${mode}`);
    process.exit(1);
  }

  const child = spawn(cmd, args, { cwd: appDir, stdio: 'inherit' });
  child.on('exit', (code) => process.exit(code ?? 0));
}

main();
