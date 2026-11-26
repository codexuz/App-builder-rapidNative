import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function main(): void {
  const args = process.argv.slice(2);
  const targetArg = args.find((a) => !a.startsWith('--'));
  const skipWebExport = args.includes('--typecheck-only');

  if (!targetArg) {
    console.error('Usage: pnpm app:verify <app-slug|template> [--typecheck-only]');
    process.exit(1);
  }

  const rootDir = process.cwd();
  const appDir =
    targetArg === 'template'
      ? path.join(rootDir, 'templates', 'expo-base')
      : path.join(rootDir, 'apps', targetArg);

  if (!fs.existsSync(appDir)) {
    console.error(`Directory not found: ${appDir}`);
    process.exit(1);
  }

  if (!fs.existsSync(path.join(appDir, 'node_modules'))) {
    console.log(`Installing dependencies in ${path.relative(rootDir, appDir)}...`);
    execFileSync('pnpm', ['install'], { cwd: appDir, stdio: 'inherit' });
  }

  console.log(`\n[1/2] Type-checking ${path.relative(rootDir, appDir)}...`);
  execFileSync('pnpm', ['exec', 'tsc', '--noEmit'], { cwd: appDir, stdio: 'inherit' });
  console.log('✓ TypeScript passed');

  if (!skipWebExport) {
    const outDir = path.join(appDir, '.expo-verify-web');
    fs.rmSync(outDir, { recursive: true, force: true });
    console.log(`\n[2/2] Verifying Expo Web Metro bundle...`);
    try {
      execFileSync(
        'pnpm',
        ['exec', 'expo', 'export', '--platform', 'web', '--output-dir', '.expo-verify-web'],
        { cwd: appDir, stdio: 'inherit' }
      );
      console.log('✓ Expo Web bundle succeeded');
    } finally {
      fs.rmSync(outDir, { recursive: true, force: true });
    }
  }

  console.log(`\nAll checks passed for "${targetArg}".`);
}

main();
