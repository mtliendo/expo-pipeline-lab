/**
 * Generate docs/architecture.{excalidraw,svg,png} with the Excalidraw SDK.
 *
 * Isolated from the Expo app: run `npm install && npm run generate` here.
 *
 * convertToExcalidrawElements / exportToSvg live in browser-oriented packages,
 * so this script bundles them with esbuild and runs the export in headless Chrome.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import * as esbuild from 'esbuild';
import { chromium } from 'playwright-core';
import { skeletons } from './scene.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const docsDir = resolve(scriptDir, '../../docs');
const distDir = resolve(scriptDir, 'dist');

mkdirSync(distDir, { recursive: true });
mkdirSync(docsDir, { recursive: true });

const bundlePath = resolve(distDir, 'browser-export.js');
await esbuild.build({
  absWorkingDir: scriptDir,
  entryPoints: ['browser-export.mjs'],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  outfile: bundlePath,
  define: { 'process.env.NODE_ENV': '"production"' },
  tsconfigRaw: '{}',
  logLevel: 'warning',
});

const html = `<!doctype html>
<html>
  <head><meta charset="utf-8" /></head>
  <body>
    <script src="./browser-export.js"></script>
  </body>
</html>`;
const htmlPath = resolve(distDir, 'index.html');
writeFileSync(htmlPath, html);

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome-stable',
  headless: true,
});

try {
  const page = await browser.newPage();
  page.on('pageerror', (error) => {
    console.error('browser pageerror:', error.message);
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log(`browser ${msg.type()}:`, msg.text());
    }
  });
  await page.goto(`file://${htmlPath}`);
  const result = await page.evaluate(async (input) => {
    try {
      return await window.exportArchitecture(input);
    } catch (error) {
      return {
        error: error?.message ?? String(error),
        stack: error?.stack ?? '',
      };
    }
  }, skeletons);

  if (result.error) {
    throw new Error(`browser export failed: ${result.error}\n${result.stack}`);
  }

  const scene = {
    type: 'excalidraw',
    version: 2,
    source: 'https://excalidraw.com',
    elements: result.elements,
    appState: {
      viewBackgroundColor: '#ffffff',
      gridSize: 20,
    },
    files: {},
  };

  const excalidrawPath = resolve(docsDir, 'architecture.excalidraw');
  writeFileSync(excalidrawPath, `${JSON.stringify(scene, null, 2)}\n`);

  const svgPath = resolve(docsDir, 'architecture.svg');
  writeFileSync(svgPath, result.svg);

  const pngPath = resolve(docsDir, 'architecture.png');
  const png = new Resvg(result.svg, {
    background: '#ffffff',
    fitTo: { mode: 'width', value: 2200 },
    font: { loadSystemFonts: true },
  }).render();
  writeFileSync(pngPath, png.asPng());

  console.log(`Wrote ${excalidrawPath}`);
  console.log(`Wrote ${svgPath}`);
  console.log(`Wrote ${pngPath}`);
} finally {
  await browser.close();
}
