// Smoke: geliştirme sunucusunu aç, API ve sayfaları gerçek veriyle dene, ekran görüntüsü al.
// Kullanım: npm run smoke   (BASE verilirse sunucu açmaz, o adresi dener)
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';

const { chromium, devices } = createRequire(import.meta.url)('playwright');

const PORT = 5179;
let BASE = process.env.BASE;
let server;
if (!BASE) {
  BASE = `http://localhost:${PORT}`;
  server = spawn('node_modules/.bin/vite', ['--port', String(PORT), '--strictPort'], {
    stdio: 'pipe',
  });
  await new Promise((ok, bad) => {
    const t = setTimeout(() => bad(new Error('sunucu açılmadı')), 30000);
    server.stdout.on('data', (d) => {
      if (String(d).includes('Local')) {
        clearTimeout(t);
        ok();
      }
    });
  });
}

const fails = [];
const check = (ok, msg) => {
  console.log(`${ok ? '✓' : '✗'} ${msg}`);
  if (!ok) fails.push(msg);
};

try {
  const get = async (p) => {
    const r = await fetch(BASE + p);
    return { status: r.status, cache: r.headers.get('cache-control'), body: await r.json() };
  };

  const fx = await get('/api/fixtures');
  check(
    fx.status === 200 && fx.body.data.matches.length > 0,
    `fixtures: ${fx.body.data?.matches.length} maç`,
  );
  check(/s-maxage=\d+/.test(fx.cache ?? ''), `fixtures CDN önbellek: ${fx.cache}`);
  const last = [...fx.body.data.matches].reverse().find((m) => m.state === 'post');

  const st = await get('/api/standings');
  const us = st.body.data?.rows.find((r) => r.isUs);
  check(st.status === 200 && !!us, `standings: Beşiktaş ${us?.rank}. sırada`);

  const eu = await get('/api/standings?lig=avrupa');
  const euUs = eu.body.data?.rows.find((r) => r.isUs);
  check(
    eu.status === 200 && eu.body.data.rows.length > 20 && !!euUs,
    `Avrupa tablosu: ${eu.body.data?.season}, Beşiktaş ${euUs?.rank}. (${euUs?.points} puan)`,
  );
  check(
    (fx.body.data.notices ?? []).every((n) => !/anahtar/.test(n)) || fx.body.source === 'ESPN',
    `fikstür uyarıları: ${JSON.stringify(fx.body.data.notices)}`,
  );

  const md = await get(`/api/match?id=${last.id}&league=${last.leagueSlug}`);
  check(
    md.status === 200 && md.body.data.events.length > 0,
    `match ${last.id}: ${md.body.data?.events.length} olay`,
  );

  const bad = await get('/api/match?id=abc');
  check(bad.status === 400, 'match: geçersiz id → 400');

  const lv = await get('/api/live');
  check(
    lv.status === 200 && typeof lv.body.data.active === 'boolean',
    `live: active=${lv.body.data?.active}`,
  );

  const sq = await get('/api/squad');
  const withMin = sq.body.data?.players.filter((p) => (p.minutes ?? 0) > 0).length;
  check(
    sq.status === 200 && sq.body.data.players.length > 15,
    `squad: ${sq.body.data?.players.length} oyuncu, ${withMin} dakikalı`,
  );

  const nat = sq.body.data?.players.map((p) => p.nationality).filter(Boolean);
  check(
    nat.includes('Türkiye') && !nat.includes('Germany') && !nat.includes('Turkey'),
    `kadro ülkeleri Türkçe: ${[...new Set(nat)].slice(0, 6).join(', ')}`,
  );

  const us2 = await get('/api/usage');
  check(
    us2.status === 200 && us2.cache === 'no-store',
    `usage: ${JSON.stringify(us2.body.counts)}`,
  );

  // sayfalar
  mkdirSync('smoke-out', { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

  const pages = [
    ['/', 'ana', '.hero-teams'],
    ['/fikstur', 'fikstur', '.mrow'],
    [`/mac/${last.id}?l=${last.leagueSlug}`, 'mac', '.ev'],
    ['/canli', 'canli', 'h1'],
    ['/kadro', 'kadro', '.squad tbody tr'],
    ['/puan', 'puan', 'tr.us'],
    ['/ayarlar', 'ayarlar', '.theme-card'],
  ];
  for (const [path, name, sel] of pages) {
    await page.goto(BASE + path);
    const ok = await page.waitForSelector(sel, { timeout: 30000 }).then(
      () => true,
      () => false,
    );
    check(ok, `sayfa ${path} → ${sel}`);
    await page.screenshot({ path: `smoke-out/${name}.png`, fullPage: name !== 'fikstur' });
  }
  // maç detayı sekmeleri
  await page.goto(`${BASE}/mac/${last.id}?l=${last.leagueSlug}`);
  await page.getByRole('tab', { name: 'Kadrolar' }).click();
  check((await page.locator('.pitch .pl').count()) === 11, 'maç: saha dizilişinde 11 oyuncu');
  await page.screenshot({ path: 'smoke-out/mac-kadro.png', fullPage: true });
  await page.getByRole('tab', { name: 'İstatistik' }).click();
  check((await page.locator('.stat').count()) > 3, 'maç: istatistik görünür');
  await page.screenshot({ path: 'smoke-out/mac-istatistik.png', fullPage: true });

  // ayarlar: tema ve yazı boyutu uygulanır, sayfa yenilense de kalır
  await page.goto(`${BASE}/ayarlar`);
  await page.getByRole('radio', { name: /Lavanta/ }).click();
  await page.getByRole('button', { name: 'Yazıyı büyüt' }).click();
  await page.reload();
  await page.waitForSelector('.theme-card');
  const applied = await page.evaluate(() => ({
    theme: document.documentElement.dataset.theme,
    scale: getComputedStyle(document.documentElement).getPropertyValue('--scale').trim(),
    px: getComputedStyle(document.documentElement).fontSize,
  }));
  check(
    applied.theme === 'lavanta' && applied.scale === '1.05',
    `ayarlar kalıcı: ${JSON.stringify(applied)}`,
  );
  await page.screenshot({ path: 'smoke-out/ayarlar-lavanta.png', fullPage: true });
  await page.goto(`${BASE}/kadro`);
  await page.waitForSelector('.squad tbody tr');
  const blanks = await page.$$eval(
    '.squad td.num',
    (tds) => tds.filter((td) => td.textContent.trim() === '').length,
  );
  check(blanks === 0, `kadro tablosunda boş hücre yok (${blanks})`);
  await page.screenshot({ path: 'smoke-out/kadro-lavanta.png', fullPage: true });

  check(
    errors.length === 0,
    `konsol hatası yok ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`,
  );
  await browser.close();
} catch (e) {
  fails.push(String(e));
  console.error(e);
} finally {
  server?.kill();
}

console.log(fails.length ? `\n${fails.length} HATA` : '\nSMOKE OK');
process.exit(fails.length ? 1 : 0);
