import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));

function run(script, args) {
  const result = spawnSync(process.execPath, [join(repositoryRoot, script), ...args], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    stdio: 'inherit',
  });

  if (result.status !== 0) process.exit(result.status ?? 1);
}

run('node_modules/vitepress/bin/vitepress.js', ['build', 'docs']);
run('node_modules/vite/bin/vite.js', [
  'build',
  '--config',
  'examples/plain-vue/vite.preview.config.js',
]);

const expectedPages = [
  'docs/.vitepress/dist/index.html',
  'docs/.vitepress/dist/installation.html',
  'docs/.vitepress/dist/plain-vue/index.html',
];

for (const page of expectedPages) {
  if (!existsSync(join(repositoryRoot, page))) {
    throw new Error(`Documentation build did not create ${page}`);
  }
}
