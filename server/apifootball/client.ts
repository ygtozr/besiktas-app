// API-Football istemcisi. Anahtar yalnız sunucuda: API_FOOTBALL_KEY ortam değişkeni.
// Günlük kota korunur: API_FOOTBALL_DAILY_LIMIT (varsayılan 90, ücretsiz plan 100).
import { countRequest, counter, dayKey } from '../counter.js';

const BASE = 'https://v3.football.api-sports.io';

export class NotConfigured extends Error {}
export class QuotaReached extends Error {}

export type AfFetcher = (path: string) => Promise<unknown>;

export function afConfigured(): boolean {
  return !!process.env.API_FOOTBALL_KEY;
}

function dailyLimit(): number {
  const n = Number(process.env.API_FOOTBALL_DAILY_LIMIT);
  return Number.isFinite(n) && n > 0 ? n : 90;
}

interface AfEnvelope {
  errors?: Record<string, string> | string[];
  response?: unknown[];
}

async function httpGet(path: string): Promise<unknown> {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) throw new NotConfigured('API_FOOTBALL_KEY yok');
  const used = (await counter.snapshot(dayKey()))['api-football'] ?? 0;
  if (used >= dailyLimit()) throw new QuotaReached(`Günlük sınır doldu (${used})`);
  await countRequest('api-football', path.split('?')[0]);
  const res = await fetch(BASE + path, {
    headers: { 'x-apisports-key': key, accept: 'application/json' },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`API-Football ${res.status}`);
  const body = (await res.json()) as AfEnvelope;
  const errs = Array.isArray(body.errors) ? body.errors : Object.values(body.errors ?? {});
  // anahtar asla mesaja girmez; yalnız API'nin hata metni
  if (errs.length) throw new Error(`API-Football: ${errs.join('; ')}`);
  return body;
}

let fetcher: AfFetcher = httpGet;

export function setAfFetcher(f: AfFetcher | null): void {
  fetcher = f ?? httpGet;
}

export function afGet<T>(path: string): Promise<T> {
  return fetcher(path) as Promise<T>;
}

/** Sezon yılı: Temmuz ve sonrası yeni sezon. 2026-27 → 2026 */
export function seasonYear(now = new Date()): number {
  const y = now.getUTCFullYear();
  return now.getUTCMonth() >= 6 ? y : y - 1;
}
