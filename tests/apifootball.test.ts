import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import list from './fixtures/af-fixtures.json';
import detail from './fixtures/af-detail.json';
import summary from './fixtures/schedule-future.json';
import { clearCache } from '../server/cache';
import { seasonYear, setAfFetcher } from '../server/apifootball/client';
import {
  normalizeAfDetail,
  normalizeAfFixtures,
  roundTr,
  type AfFixture,
  type AfResponse,
} from '../server/apifootball/normalize';
import { getFixtures, getMatch } from '../server/data';
import { setFetcher } from '../server/espn/client';

describe('API-Football dönüşümü', () => {
  const ms = normalizeAfFixtures(list as AfResponse<AfFixture>);

  it('kupa maçları tarih sırasıyla, kimlik önekli', () => {
    expect(ms.map((m) => m.id)).toEqual(['af-1300000', 'af-1300001']);
    expect(ms[0]).toMatchObject({
      competition: 'cup',
      competitionName: 'Türkiye Kupası · Grup 2. maç',
      leagueSlug: 'af.206',
      homeScore: 1,
      awayScore: 3,
      state: 'post',
    });
    expect(ms[0].away).toMatchObject({ name: 'Beşiktaş', isUs: true });
    expect(ms[1]).toMatchObject({ state: 'pre', homeScore: null, venue: 'Tüpraş Stadyumu' });
  });

  it('tur adları', () => {
    expect(roundTr('Quarter-finals')).toBe('Çeyrek final');
    expect(roundTr('Final')).toBe('Final');
    expect(roundTr('Round of 16')).toBe('Son 16');
    expect(roundTr('5th Round')).toBe('5. tur');
  });

  const d = normalizeAfDetail((detail as AfResponse<AfFixture>).response[0]);

  it('olaylar: gol türleri, kaçan penaltı yok, ikinci sarı = kırmızı', () => {
    const kinds = d.events.map((e) => `${e.minute} ${e.kind} ${e.side}`);
    expect(kinds).toEqual([
      "12' goal away",
      "30' yellow home",
      "45+2' penalty home",
      "60' sub away",
      "70' sub away",
      "75' own-goal home",
      "88' goal away",
      "90+3' red home",
    ]);
  });

  it('golde asist API-Football’dan doğrudan', () => {
    expect(d.events[0]).toMatchObject({ kind: 'goal', player: 'Forvet Bir', assist: 'Orta Bir' });
    expect(d.events.find((e) => e.kind === 'penalty')?.assist).toBeUndefined();
  });

  it('değişiklik: sahadaki oyuncu çıkan sayılır (alan sırası ne olursa olsun)', () => {
    const subs = d.events.filter((e) => e.kind === 'sub');
    expect(subs[0]).toMatchObject({ player: 'Yedek Bir', playerOut: 'Forvet Bir' });
    expect(subs[1]).toMatchObject({ player: 'Yedek İki', playerOut: 'Orta Bir' });
  });

  it('kadro ve istatistik', () => {
    expect(d.lineups.away?.formation).toBe('4-2-3-1');
    expect(d.lineups.away?.bench.find((p) => p.name === 'Yedek Bir')?.subbedIn).toBe(true);
    expect(d.lineups.away?.starters.find((p) => p.name === 'Forvet Bir')?.subbedOut).toBe(true);
    expect(d.stats.find((s) => s.key === 'Ball Possession')).toMatchObject({
      home: '%41',
      away: '%59',
    });
    expect(d.stats.find((s) => s.key === 'Red Cards')).toMatchObject({ home: '0', away: '0' });
  });

  it('sezon yılı Temmuz’da döner', () => {
    expect(seasonYear(new Date('2026-11-24T00:00:00Z'))).toBe(2026);
    expect(seasonYear(new Date('2027-03-01T00:00:00Z'))).toBe(2026);
    expect(seasonYear(new Date('2027-07-01T00:00:00Z'))).toBe(2027);
  });
});

describe('kaynak birleştirme', () => {
  const afCalls: string[] = [];
  beforeEach(() => {
    clearCache();
    afCalls.length = 0;
    vi.spyOn(console, 'info').mockImplementation(() => {});
    setFetcher(async (url) => (url.includes('fixture=true') ? summary : { events: [] }));
    setAfFetcher(async (path) => {
      afCalls.push(path);
      return path.includes('?id=') ? detail : list;
    });
  });
  afterEach(() => {
    setFetcher(null);
    setAfFetcher(null);
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('anahtar yoksa kupa istenmez, uyarı döner', async () => {
    vi.stubEnv('API_FOOTBALL_KEY', '');
    const r = await getFixtures();
    expect(afCalls).toHaveLength(0);
    expect(r.source).toBe('ESPN');
    expect(r.value.notices[0]).toMatch(/API-Football anahtarı/);
    expect(r.value.matches.some((m) => m.competition === 'cup')).toBe(false);
  });

  it('anahtar varsa kupa maçları listeye girer', async () => {
    vi.stubEnv('API_FOOTBALL_KEY', 'test');
    const r = await getFixtures();
    expect(r.source).toBe('ESPN + API-Football');
    expect(r.value.notices).toEqual([]);
    expect(r.value.matches.filter((m) => m.competition === 'cup')).toHaveLength(2);
    expect(afCalls[0]).toMatch(/league=206&season=\d{4}/);
  });

  it('kupa maç detayı API-Football’dan', async () => {
    vi.stubEnv('API_FOOTBALL_KEY', 'test');
    const r = await getMatch('af-1300000');
    expect(r.source).toBe('API-Football');
    expect(afCalls).toEqual(['/fixtures?id=1300000']);
    expect(r.value.match.awayScore).toBe(3);
  });

  it('kupa kaynağı hata verirse lig verisi yine gelir', async () => {
    vi.stubEnv('API_FOOTBALL_KEY', 'test');
    setAfFetcher(async () => {
      throw new Error('API-Football: Your account is suspended');
    });
    const r = await getFixtures();
    expect(r.value.matches.length).toBeGreaterThan(0);
    expect(r.value.notices[0]).toMatch(/alınamadı.*suspended/);
  });
});

describe('kota koruması', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('günlük sınır dolunca ağa çıkmaz', async () => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    const net = vi.spyOn(globalThis, 'fetch');
    vi.stubEnv('API_FOOTBALL_KEY', 'test');
    vi.stubEnv('API_FOOTBALL_DAILY_LIMIT', '1');
    const { countRequest } = await import('../server/counter');
    const { afGet, QuotaReached } = await import('../server/apifootball/client');
    await countRequest('api-football', '/fixtures');
    await expect(afGet('/fixtures?id=1')).rejects.toBeInstanceOf(QuotaReached);
    expect(net).not.toHaveBeenCalled();
  });
});
