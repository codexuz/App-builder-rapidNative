import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function main(): void {
  const [target, ...components] = process.argv.slice(2);
  if (!target || components.length === 0) {
    console.error('Usage: pnpm ui:add <app-slug|template> <component1> [component2 ...]');
    console.error('Example: pnpm ui:add pulse-fit tabs table calendar');
    process.exit(1);
  }

  const rootDir = process.cwd();
  const targetDir =
    target === 'template'
      ? path.join(rootDir, 'templates', 'expo-base')
      : path.join(rootDir, 'apps', target);

  if (!fs.existsSync(targetDir)) {
    console.error(`Target directory not found: ${targetDir}`);
    process.exit(1);
  }

  const gluestackBin = path.join(rootDir, 'node_modules', '.bin', 'gluestack-ui');
  execFileSync(
    gluestackBin,
    ['add', ...components, '--path', 'components/gluestack', '--use-pnpm', '-y'],
    { cwd: targetDir, stdio: 'inherit' }
  );
}

main();
