import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cached, clearCache } from '../server/cache';
import { MemoryCounter, dayKey } from '../server/counter';
import {
  findLiveCandidate,
  inLiveWindow,
  nextMatch,
  secondsUntilWindow,
} from '../shared/live-window';
import type { MatchSummary } from '../shared/types';

const T0 = Date.parse('2026-11-30T18:00:00Z');

function match(p: Partial<MatchSummary>): MatchSummary {
  const team = { id: '1', name: 'A', short: 'A', isUs: false };
  return {
    id: '1',
    date: new Date(T0).toISOString(),
    timeKnown: true,
    competition: 'superlig',
    competitionName: 'Süper Lig',
    leagueSlug: 'tur.1',
    home: team,
    away: { ...team, id: '2' },
    homeScore: null,
    awayScore: null,
    state: 'pre',
    statusText: '',
    ...p,
  };
}

describe('canlı pencere', () => {
  const min = 60 * 1000;
  it('15 dk önce açılır, 150 dk sonra kapanır', () => {
    const m = match({});
    expect(inLiveWindow(m, T0 - 16 * min)).toBe(false);
    expect(inLiveWindow(m, T0 - 15 * min)).toBe(true);
    expect(inLiveWindow(m, T0 + 150 * min)).toBe(true);
    expect(inLiveWindow(m, T0 + 151 * min)).toBe(false);
  });

  it('saat belli değilse pencere yok', () => {
    expect(inLiveWindow(match({ timeKnown: false }), T0)).toBe(false);
  });

  it('bitmiş maç aday değil', () => {
    expect(findLiveCandidate([match({ state: 'post' })], T0 + 100 * min)).toBeUndefined();
    expect(findLiveCandidate([match({})], T0 + 10 * min)?.id).toBe('1');
  });

  it('sıradaki maç ve bekleme süresi', () => {
    const later = match({ id: '2', date: new Date(T0 + 7 * 86400000).toISOString() });
    const n = nextMatch([later, match({})], T0 - 86400000);
    expect(n?.id).toBe('1');
    expect(secondsUntilWindow(n, T0 - 86400000)).toBe(6 * 60 * 60); // üst sınır
    expect(secondsUntilWindow(n, T0 - 20 * min)).toBe(5 * 60);
    expect(secondsUntilWindow(undefined, T0)).toBeNull();
  });
});

describe('önbellek', () => {
  beforeEach(() => clearCache());
  afterEach(() => vi.restoreAllMocks());

  it('süre dolmadan tekrar yüklemez', async () => {
    let now = 0;
    const load = vi.fn(async () => 'v');
    await cached('k', 60, load, () => now);
    now = 59_000;
    await cached('k', 60, load, () => now);
    expect(load).toHaveBeenCalledTimes(1);
    now = 61_000;
    await cached('k', 60, load, () => now);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('aynı anda gelen istekler tek yükleme', async () => {
    const load = vi.fn(async () => 'v');
    await Promise.all([cached('k', 60, load), cached('k', 60, load), cached('k', 60, load)]);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('kaynak çökerse eski kopya, stale işaretli', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    let now = 0;
    await cached(
      'k',
      60,
      async () => 'eski',
      () => now,
    );
    now = 120_000;
    const r = await cached(
      'k',
      60,
      async () => {
        throw new Error('down');
      },
      () => now,
    );
    expect(r).toMatchObject({ value: 'eski', stale: true });
  });

  it('eski kopya yoksa hata', async () => {
    await expect(
      cached('yok', 60, async () => {
        throw new Error('down');
      }),
    ).rejects.toThrow('down');
  });
});

describe('sayaç', () => {
  it('gün bazında sayar, eski günü atar', async () => {
    const c = new MemoryCounter();
    await c.incr('2026-11-21', 'espn');
    expect(await c.incr('2026-11-22', 'espn')).toBe(1);
    expect(await c.incr('2026-11-22', 'espn')).toBe(2);
    expect(await c.snapshot('2026-11-21')).toEqual({});
    expect(await c.snapshot('2026-11-22')).toEqual({ espn: 2 });
  });

  it('İstanbul saatine göre gün', () => {
    // UTC 22:30 = İstanbul 01:30 ertesi gün
    expect(dayKey(new Date('2026-11-22T22:30:00Z'))).toBe('2026-11-23');
  });
});
