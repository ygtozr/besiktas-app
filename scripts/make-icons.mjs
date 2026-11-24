// public/icon.svg → PNG ikonlar. Playwright gerekir.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

// Playwright proje bağımlılığı değil: makinedeki kurulumu kullan.
const { chromium } = createRequire(import.meta.url)('playwright');

const svg = readFileSync('public/icon.svg', 'utf8');
const out = [
  ['public/icon-192.png', 192, 0],
  ['public/icon-512.png', 512, 0],
  ['public/icon-maskable-512.png', 512, 0.12],
  ['public/apple-touch-icon.png', 180, 0.06],
];
const browser = await chromium.launch();
const page = await browser.newPage();
for (const [file, size, pad] of out) {
  const inner = Math.round(size * (1 - pad * 2));
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<body style="margin:0;background:#0a0a0a;display:grid;place-items:center;width:${size}px;height:${size}px">` +
      `<div style="width:${inner}px;height:${inner}px">${svg.replace('<svg ', `<svg width="${inner}" height="${inner}" `)}</div></body>`,
  );
  await page.screenshot({ path: file });
  console.log('yazıldı', file);
}
await browser.close();
