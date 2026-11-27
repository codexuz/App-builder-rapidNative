import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { loadOrInitPipelineState } from './lib/state';

function parseArgs(args: string[]): { slug: string; name?: string; skipInstall: boolean } {
  let slug = '';
  let name: string | undefined;
  let skipInstall = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--name' && args[i + 1]) {
      name = args[i + 1];
      i++;
    } else if (arg === '--skip-install') {
      skipInstall = true;
    } else if (!arg.startsWith('--') && !slug) {
      slug = arg;
    }
  }

  return { slug, name, skipInstall };
}

function toDisplayName(slug: string): string {
  return slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
}

function toScheme(slug: string): string {
  return slug.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function main(): void {
  const { slug, name, skipInstall } = parseArgs(process.argv.slice(2));

  if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    console.error('Usage: pnpm app:new <app-slug> [--name "Display Name"] [--skip-install]');
    console.error('Example: pnpm app:new pulse-fit --name "PulseFit"');
    process.exit(1);
  }

  const rootDir = process.cwd();
  const templateDir = path.join(rootDir, 'templates', 'expo-base');
  const targetDir = path.join(rootDir, 'apps', slug);

  if (!fs.existsSync(templateDir)) {
    console.error(`Template directory missing: ${templateDir}`);
    process.exit(1);
  }

  if (fs.existsSync(targetDir)) {
    console.error(`App already exists: ${targetDir}`);
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(targetDir), { recursive: true });
  fs.cpSync(templateDir, targetDir, {
    recursive: true,
    filter: (src) => {
      const base = path.basename(src);
      return base !== 'node_modules' && base !== '.expo' && base !== 'dist';
    },
  });

  const displayName = name ?? toDisplayName(slug);
  const scheme = toScheme(slug);
  const bundleId = `com.rapidnative.${scheme}`;

  // Update package.json
  const pkgPath = path.join(targetDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as Record<string, unknown>;
  pkg.name = slug;
  fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');

  // Update app.json
  const appJsonPath = path.join(targetDir, 'app.json');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8')) as {
    expo: Record<string, unknown> & {
      ios?: Record<string, unknown>;
      android?: Record<string, unknown>;
    };
  };
  appJson.expo.name = displayName;
  appJson.expo.slug = slug;
  appJson.expo.scheme = scheme;
  appJson.expo.ios = {
    ...(appJson.expo.ios ?? {}),
    bundleIdentifier: bundleId,
  };
  appJson.expo.android = {
    ...(appJson.expo.android ?? {}),
    package: bundleId,
  };
  fs.writeFileSync(appJsonPath, `${JSON.stringify(appJson, null, 2)}\n`, 'utf8');

  // Promote example manifest to active manifest for Kie.ai
  const exampleManifest = path.join(targetDir, 'assets.manifest.example.json');
  const activeManifest = path.join(targetDir, 'assets.manifest.json');
  if (fs.existsSync(exampleManifest)) {
    fs.renameSync(exampleManifest, activeManifest);
  }

  // Initialize resumable pipeline state directory (.factory/STATE.json)
  loadOrInitPipelineState(targetDir, slug, displayName);

  console.log(`Scaffolded "${displayName}" at apps/${slug}`);

  if (!skipInstall) {
    console.log(`Installing dependencies in apps/${slug}...`);
    execFileSync('pnpm', ['install'], { cwd: targetDir, stdio: 'inherit' });
  }

  console.log('\nNext steps:');
  console.log(`  1. Author .factory/{PRD.md,DESIGN.md,TOKENS.json,SCREENS.json,MOTION.json,ASSETS.json}`);
  console.log(`  2. Compile & validate design: pnpm app:compile ${slug}`);
  console.log(`  3. Generate Kie.ai assets:    pnpm assets:gen ${slug}`);
  console.log(`  4. Verify build:              pnpm app:verify ${slug}`);
  console.log(`  5. Capture QA screenshots:    pnpm app:shot ${slug}`);
}

main();
