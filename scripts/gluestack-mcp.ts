import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const REPO_ROOT = path.resolve(__dirname, '..');
const TEMPLATE_GLUESTACK_DIR = path.join(REPO_ROOT, 'templates', 'expo-base', 'components', 'gluestack');
const DEFAULT_CACHE_UI_DIR = path.join(os.homedir(), '.gluestack', 'cache', 'gluestack-ui', 'src', 'components', 'ui');
const IGNORED_DIRS = new Set(['all-components', 'utils', 'gluestack-ui-provider']);

function getCacheUiDir(): string {
  const envPath = process.env.GLUESTACK_PATH;
  if (envPath) {
    const candidate = path.join(envPath, 'src', 'components', 'ui');
    if (fs.existsSync(candidate)) return candidate;
    if (fs.existsSync(envPath)) return envPath;
  }
  return DEFAULT_CACHE_UI_DIR;
}

function listDirs(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !IGNORED_DIRS.has(d.name))
    .map((d) => d.name)
    .sort();
}

function normalizeName(input: string): string {
  return input
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[_\s]+/g, '-');
}

function extractExports(source: string): string[] {
  const names = new Set<string>();
  const exportBlock = /export\s*\{([^}]+)\}/g;
  let m: RegExpExecArray | null;
  while ((m = exportBlock.exec(source)) !== null) {
    for (const part of m[1].split(',')) {
      const cleaned = part.replace(/^type\s+/, '').trim().split(/\s+as\s+/).pop()?.trim();
      if (cleaned && /^[A-Za-z_][A-Za-z0-9_]*$/.test(cleaned)) names.add(cleaned);
    }
  }
  const named = /export\s+(?:const|function|class|type|interface)\s+([A-Za-z_][A-Za-z0-9_]*)/g;
  while ((m = named.exec(source)) !== null) {
    names.add(m[1]);
  }
  return [...names].sort();
}

function readFirstExisting(paths: string[]): { filePath: string; content: string } | null {
  for (const p of paths) {
    if (fs.existsSync(p) && fs.statSync(p).isFile()) {
      return { filePath: p, content: fs.readFileSync(p, 'utf8') };
    }
  }
  return null;
}

const server = new McpServer({
  name: 'gluestack-ui',
  version: '5.0.0',
});

server.tool(
  'list_components',
  'List all gluestack-ui v5 components available for Expo / React Native apps (both preinstalled in templates/expo-base and installable via gluestack-ui CLI).',
  {
    query: z.string().optional().describe('Optional substring filter (e.g., "modal", "input", "button")'),
    onlyPreinstalled: z.boolean().optional().describe('If true, return only components preinstalled in the default template'),
  },
  async ({ query, onlyPreinstalled }) => {
    const preinstalled = new Set(listDirs(TEMPLATE_GLUESTACK_DIR));
    const cacheDir = getCacheUiDir();
    const allNames = new Set<string>([...preinstalled, ...listDirs(cacheDir)]);

    const q = query ? normalizeName(query) : '';
    const items = [...allNames]
      .sort()
      .filter((name) => (!onlyPreinstalled || preinstalled.has(name)) && (!q || name.includes(q)))
      .map((name) => ({
        name,
        preinstalled: preinstalled.has(name),
        importPath: `@/components/gluestack/${name}`,
        hasDocs: fs.existsSync(path.join(cacheDir, name, 'docs', 'index.mdx')),
        hasExamples: fs.existsSync(path.join(cacheDir, name, 'examples')),
      }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              engine: 'uniwind (Tailwind CSS v4) + gluestack-ui v5',
              total: items.length,
              preinstalledCount: items.filter((i) => i.preinstalled).length,
              components: items,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

server.tool(
  'get_component',
  'Get the TypeScript source code, exported symbols, import path, and dependencies of a gluestack-ui v5 component.',
  {
    componentName: z.string().describe('Component name (e.g., "button", "modal", "actionsheet", "AlertDialog")'),
  },
  async ({ componentName }) => {
    const slug = normalizeName(componentName);
    const cacheDir = getCacheUiDir();
    const templateFile = path.join(TEMPLATE_GLUESTACK_DIR, slug, 'index.tsx');
    const cacheFile = path.join(cacheDir, slug, 'index.tsx');
    const found = readFirstExisting([templateFile, cacheFile]);

    if (!found) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Component "${slug}" not found. Call list_components to see available names.` }],
      };
    }

    const depsFile = readFirstExisting([path.join(cacheDir, slug, 'dependencies.json')]);
    const exportsList = extractExports(found.content);
    const preinstalled = found.filePath === templateFile;

    return {
      content: [
        {
          type: 'text',
          text: [
            `# gluestack-ui component: ${slug}`,
            `- Preinstalled in default template: ${preinstalled ? 'YES' : 'NO (run add_component_to_app or pnpm ui:add <app-slug> ' + slug + ')'}`,
            `- Import path: \`@/components/gluestack/${slug}\``,
            `- Exports: ${exportsList.join(', ') || '(inspect source)'}`,
            depsFile ? `- Dependencies: ${depsFile.content.trim()}` : '',
            '',
            '```tsx',
            found.content,
            '```',
          ]
            .filter(Boolean)
            .join('\n'),
        },
      ],
    };
  }
);

server.tool(
  'get_component_docs',
  'Get the official gluestack-ui v5 MDX documentation and API reference for a component.',
  {
    componentName: z.string().describe('Component name (e.g., "button", "select", "toast")'),
  },
  async ({ componentName }) => {
    const slug = normalizeName(componentName);
    const docPath = path.join(getCacheUiDir(), slug, 'docs', 'index.mdx');
    if (!fs.existsSync(docPath)) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Docs not found for "${slug}" at ${docPath}.` }],
      };
    }
    return {
      content: [{ type: 'text', text: fs.readFileSync(docPath, 'utf8') }],
    };
  }
);

server.tool(
  'get_component_examples',
  'Get official gluestack-ui v5 usage examples for a component.',
  {
    componentName: z.string().describe('Component name (e.g., "button", "modal", "form-control")'),
    maxExamples: z.number().int().min(1).max(10).optional().describe('Max number of example folders to return (default: 4)'),
  },
  async ({ componentName, maxExamples = 4 }) => {
    const slug = normalizeName(componentName);
    const examplesDir = path.join(getCacheUiDir(), slug, 'examples');
    if (!fs.existsSync(examplesDir)) {
      return {
        isError: true,
        content: [{ type: 'text', text: `No examples directory found for "${slug}".` }],
      };
    }

    const dirs = fs
      .readdirSync(examplesDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .slice(0, maxExamples);

    const sections: string[] = [];
    for (const dir of dirs) {
      const exFile = readFirstExisting([
        path.join(examplesDir, dir, 'template.codemod.js'),
        path.join(examplesDir, dir, 'index.tsx'),
        path.join(examplesDir, dir, 'meta.json'),
      ]);
      if (exFile) {
        sections.push(`## Example: ${dir}\n\`\`\`tsx\n${exFile.content}\n\`\`\``);
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: sections.length ? sections.join('\n\n') : `No example code files found inside ${examplesDir}.`,
        },
      ],
    };
  }
);

server.tool(
  'add_component_to_app',
  'Install one or more gluestack-ui v5 components into an Expo app inside apps/<slug>/components/gluestack/.',
  {
    appSlug: z.string().describe('Target app folder name inside apps/ (e.g., "pulse-fit")'),
    components: z.array(z.string()).min(1).describe('Component names to add (e.g., ["table", "tabs", "calendar"])'),
  },
  async ({ appSlug, components }) => {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(appSlug)) {
      return { isError: true, content: [{ type: 'text', text: `Invalid appSlug "${appSlug}".` }] };
    }
    const appDir = path.join(REPO_ROOT, 'apps', appSlug);
    if (!fs.existsSync(appDir)) {
      return { isError: true, content: [{ type: 'text', text: `App directory does not exist: ${appDir}` }] };
    }

    const gluestackBin = path.join(REPO_ROOT, 'node_modules', '.bin', 'gluestack-ui');
    const slugs = components.map(normalizeName);
    const out = execFileSync(
      gluestackBin,
      ['add', ...slugs, '--path', 'components/gluestack', '--use-pnpm', '-y'],
      { cwd: appDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
    );

    return {
      content: [
        {
          type: 'text',
          text: `Added [${slugs.join(', ')}] to apps/${appSlug}/components/gluestack/.\n\n${out.slice(-1000)}`,
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  process.stderr.write(`gluestack-mcp fatal error: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
