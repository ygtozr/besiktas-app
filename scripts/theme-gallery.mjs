// Her temanın ana sayfa görüntüsünü al, tek bir karşılaştırma görseli yap.
// Kullanım: node scripts/theme-gallery.mjs  → smoke-out/temalar/
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const { chromium } = createRequire(import.meta.url)('playwright');
const PORT = 5181;
const BASE = `http://localhost:${PORT}`;
const OUT = 'smoke-out/temalar';
mkdirSync(OUT, { recursive: true });

const src = readFileSync('src/settings/themes.ts', 'utf8');
const themes = [...src.matchAll(/theme\('([a-z]+)', '([^']+)'/g)].map((m) => ({
  id: m[1],
  name: m[2],
}));
const page0 = process.argv[2] ?? '/';

const server = spawn('node_modules/.bin/vite', ['--port', String(PORT), '--strictPort'], {
  stdio: 'pipe',
});
server.stderr.on('data', (d) => process.stderr.write(d));
await new Promise((ok) => server.stdout.on('data', (d) => String(d).includes('Local') && ok()));
console.log('sunucu hazır', themes.length, 'tema');

const browser = await chromium.launch();
try {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.goto(BASE + page0);
  await page.waitForSelector('.hero-teams, .mrow, tr.us', { timeout: 30000 });
  for (const t of themes) {
    await page.evaluate(
      (id) =>
        localStorage.setItem('ayarlar-v1', JSON.stringify({ theme: id, font: 'auto', scale: 1 })),
      t.id,
    );
    await page.reload();
    await page.waitForSelector('.hero-teams, .mrow, tr.us', { timeout: 30000 });
    await Promise.race([page.evaluate(() => document.fonts.ready), page.waitForTimeout(3000)]);
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${OUT}/${t.id}.png` });
    console.log('✓', t.name);
  }
  // galeri
  const cells = themes
    .map(
      (t, i) =>
        `<figure><img src="data:image/png;base64,${readFileSync(`${OUT}/${t.id}.png`).toString('base64')}"><figcaption>${i + 1}. ${t.name}</figcaption></figure>`,
    )
    .join('');
  const g = await browser.newPage({
    viewport: { width: 1640, height: 1000 },
    deviceScaleFactor: 1,
  });
  await g.setContent(
    `<style>body{margin:0;padding:24px;background:#e9e9ee;font:600 22px system-ui}
     main{display:grid;grid-template-columns:repeat(6,1fr);gap:20px}
     figure{margin:0}img{width:100%;border-radius:22px;box-shadow:0 6px 24px rgba(0,0,0,.18)}
     figcaption{text-align:center;margin-top:8px;color:#222}</style><main>${cells}</main>`,
  );
  await g.waitForTimeout(500);
  await g.screenshot({ path: `${OUT}/galeri.png`, fullPage: true });
  console.log('galeri yazıldı');
} finally {
  await browser.close();
  server.kill();
}
process.exit(0);
