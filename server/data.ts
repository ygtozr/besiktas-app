// Kaynakları birleştirir: lig + Avrupa ESPN'den, Türkiye Kupası API-Football'dan.
import { club } from '../config/club.js';
import { isMatchDay } from '../shared/live-window.js';
import type { Fixtures, MatchDetail, MatchSummary } from '../shared/types.js';
import { cached, type CacheResult } from './cache.js';
import {
  NotConfigured,
  QuotaReached,
  afConfigured,
  afGet,
  seasonYear,
} from './apifootball/client.js';
import {
  AF_PREFIX,
  normalizeAfDetail,
  normalizeAfFixtures,
  type AfFixture,
  type AfResponse,
} from './apifootball/normalize.js';
import {
  fixturesTtl,
  getFixtures as getEspnFixtures,
  getMatch as getEspnMatch,
  matchTtl,
} from './espn/source.js';
import { TTL } from './ttl.js';

const CUP = club.apiFootball.leagues.turkishCup;
const TEAM = club.apiFootball.teamId;

/** API-Football kotası dar: fikstür maç günü bile en az 30 dk önbellekte. */
const CUP_TTL_MATCHDAY = 30 * 60;
/** Kupa canlı maçı: 3 dk (ücretsiz planda günlük 100 istek). */
export const CUP_LIVE_TTL = 3 * 60;

export interface Merged<T> extends CacheResult<T> {
  source: string;
}

function cupFixtures(now = Date.now()) {
  return cached(
    'cup:fixtures',
    (m: MatchSummary[]) => (isMatchDay(m, now) ? CUP_TTL_MATCHDAY : TTL.fixtures),
    async () =>
      normalizeAfFixtures(
        await afGet<AfResponse<AfFixture>>(
          `/fixtures?team=${TEAM}&league=${CUP}&season=${seasonYear()}`,
        ),
      ),
  );
}

function cupNotice(err: unknown): string {
  if (err instanceof NotConfigured)
    return 'Türkiye Kupası maçları için sunucuya API-Football anahtarı eklenmeli. Şu an kupa maçları listede yok.';
  if (err instanceof QuotaReached)
    return 'Türkiye Kupası: günlük istek sınırı doldu. Yarın yeniden denenecek.';
  const msg = err instanceof Error ? err.message.slice(0, 140) : 'bilinmeyen hata';
  return `Türkiye Kupası verisi alınamadı (${msg}). Kupa maçları listede yok.`;
}

export async function getFixtures(): Promise<Merged<Fixtures>> {
  const [espn, cup] = await Promise.allSettled([
    getEspnFixtures(),
    afConfigured() ? cupFixtures() : Promise.reject(new NotConfigured()),
  ]);
  if (espn.status === 'rejected') throw espn.reason;
  const notices: string[] = [];
  let matches = espn.value.value.matches;
  let fetchedAt = espn.value.fetchedAt;
  let stale = espn.value.stale;
  let source = 'ESPN';
  if (cup.status === 'fulfilled') {
    matches = [...matches, ...cup.value.value].sort(
      (a, b) => Date.parse(a.date) - Date.parse(b.date),
    );
    if (cup.value.fetchedAt < fetchedAt) fetchedAt = cup.value.fetchedAt;
    stale ||= cup.value.stale;
    source = 'ESPN + API-Football';
    if (cup.value.stale)
      notices.push('Türkiye Kupası verisi gecikmeli: son kayıtlı kopya gösteriliyor.');
  } else {
    notices.push(cupNotice(cup.reason));
  }
  return { value: { matches, notices }, fetchedAt, stale, source };
}

export function cdnTtl(f: Fixtures): number {
  return fixturesTtl(f);
}

export async function getMatch(
  id: string,
  league = 'all',
  live = false,
): Promise<Merged<MatchDetail>> {
  if (id.startsWith(AF_PREFIX)) {
    const n = id.slice(AF_PREFIX.length);
    const r = await cached(
      `match:${id}`,
      live
        ? CUP_LIVE_TTL
        : (d: MatchDetail) => (d.match.state === 'in' ? CUP_LIVE_TTL : matchTtl(d)),
      async () => {
        const body = await afGet<AfResponse<AfFixture>>(`/fixtures?id=${n}`);
        const f = body.response[0];
        if (!f) throw new Error(`Maç bulunamadı: ${id}`);
        return normalizeAfDetail(f);
      },
    );
    return { ...r, source: 'API-Football' };
  }
  const r = await getEspnMatch(id, league, live ? TTL.live : undefined);
  return { ...r, source: 'ESPN' };
}

export function matchCdnTtl(d: MatchDetail): number {
  if (d.match.id.startsWith(AF_PREFIX) && d.match.state === 'in') return CUP_LIVE_TTL;
  return matchTtl(d);
}
