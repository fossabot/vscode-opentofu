/**
 * Copyright (c) The OpenTofu Authors
 * SPDX-License-Identifier: MPL-2.0
 * Copyright (c) 2024 HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

/* eslint-disable no-undef */
const esbuild = require('esbuild');
const glob = require('glob');
const path = require('path');
const polyfill = require('@esbuild-plugins/node-globals-polyfill');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
  name: 'esbuild-problem-matcher',

  setup(build) {
    build.onStart(() => {
      console.log('[watch] build started');
    });
    build.onEnd((result) => {
      result.errors.forEach(({ text, location }) => {
        console.error(`✘ [ERROR] ${text}`);
        console.error(`    ${location.file}:${location.line}:${location.column}:`);
      });
      console.log('[watch] build finished');
    });
  },
};

/**
 * For web extension, all tests, including the test runner, need to be bundled into
 * a single module that has a exported `run` function .
 * This plugin bundles implements a virtual file extensionTests.ts that bundles all these together.
 * @type {import('esbuild').Plugin}
 */
const testBundlePlugin = {
  name: 'testBundlePlugin',
  setup(build) {
    build.onResolve({ filter: /[/\\]extensionTests\.ts$/ }, (args) => {
      if (args.kind === 'entry-point') {
        return { path: path.resolve(args.path) };
      }
    });
    build.onLoad({ filter: /[/\\]extensionTests\.ts$/ }, async () => {
      const testsRoot = path.join(__dirname, 'src/web/test/suite');
      const files = await glob.glob('*.test.{ts,tsx}', { cwd: testsRoot, posix: true });
      return {
        contents: `export { run } from './mochaTestRunner.ts';` + files.map((f) => `import('./${f}');`).join(''),
        watchDirs: files.map((f) => path.dirname(path.resolve(testsRoot, f))),
        watchFiles: files.map((f) => path.resolve(testsRoot, f)),
      };
    });
  },
};

async function main() {
  const defaults = {
    bundle: true,
    format: 'cjs',
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    external: ['vscode'],
    logLevel: 'silent',
  };

  const desktop = {
    entryPoints: ['src/extension.ts'],
    outfile: 'dist/extension.js',
    platform: 'node',
    plugins: [
      /* add to the end of plugins array */
      esbuildProblemMatcherPlugin,
    ],
    ...defaults,
  };

  const web = {
    entryPoints: ['src/web/extension.ts'],
    outdir: 'dist/web',
    platform: 'browser',
    // Node.js global to browser globalThis
    define: {
      global: 'globalThis',
    },
    plugins: [
      polyfill.NodeGlobalsPolyfillPlugin({
        process: true,
        buffer: true,
      }),
      testBundlePlugin,
      esbuildProblemMatcherPlugin /* add to the end of plugins array */,
    ],
    ...defaults,
  };

  const contexts = [await esbuild.context(desktop), await esbuild.context(web)];

  try {
    const promises = [];
    if (watch) {
      // Watch
      for (const context of contexts) {
        promises.push(context.watch());
      }
      return await Promise.all(promises);
    }

    // Build once
    for (const context of contexts) {
      promises.push(context.rebuild());
    }
    await Promise.all(promises);
    for (const context of contexts) {
      await context.dispose();
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
