import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, delimiter, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const npmCli = realpathSync(join(dirname(process.execPath), 'npm'));
const temporaryRoot = mkdtempSync(join(tmpdir(), 'component-playground-consumer-'));
const packageDirectory = join(temporaryRoot, 'package');
const consumerDirectory = join(temporaryRoot, 'consumer');
const commandEnvironment = {
  ...process.env,
  PATH: [dirname(process.execPath), process.env.PATH].filter(Boolean).join(delimiter),
  npm_config_cache: join(temporaryRoot, 'npm-cache'),
};

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    env: commandEnvironment,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (result.status !== 0) {
    const details = [result.stdout, result.stderr].filter(Boolean).join('\n');
    throw new Error(`${command} ${args.join(' ')} failed\n${details}`);
  }

  return result.stdout.trim();
}

function runNpm(args, cwd) {
  return run(process.execPath, [npmCli, ...args], cwd);
}

try {
  mkdirSync(packageDirectory, { recursive: true });
  cpSync(join(repositoryRoot, 'examples/plain-vue'), consumerDirectory, { recursive: true });

  let tarball;

  if (process.env.TARBALL) {
    tarball = realpathSync(process.env.TARBALL);
  } else {
    const packOutput = runNpm(
      ['pack', '--ignore-scripts', '--json', '--pack-destination', packageDirectory],
      repositoryRoot,
    );
    const [{ filename }] = JSON.parse(packOutput);
    tarball = join(packageDirectory, filename);
  }

  runNpm(
    ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', tarball],
    consumerDirectory,
  );

  const installedPackage = join(
    consumerDirectory,
    'node_modules',
    '@tanaab',
    'component-playground',
  );
  const installedMetadata = JSON.parse(
    readFileSync(join(installedPackage, 'package.json'), 'utf8'),
  );
  const expectedEntries = [
    installedMetadata.exports['.'].import,
    installedMetadata.exports['./style.css'],
    installedMetadata.exports['./vitepress'].import,
    installedMetadata.exports['./vitepress.css'],
  ];

  for (const entry of expectedEntries) {
    const installedEntry = join(installedPackage, entry);
    if (!existsSync(installedEntry)) throw new Error(`Packed package is missing ${entry}`);
  }

  const mainEntry = readFileSync(
    join(installedPackage, installedMetadata.exports['.'].import),
    'utf8',
  );
  if (/from\s+["']vitepress["']/.test(mainEntry)) {
    throw new Error('Plain Vue entry unexpectedly imports VitePress');
  }

  runNpm(['run', 'build'], consumerDirectory);

  const output = join(consumerDirectory, 'dist/index.html');
  if (!existsSync(output)) throw new Error(`Consumer build did not create ${output}`);

  process.stdout.write(`Packed consumer built successfully with ${basename(tarball)}\n`);
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
