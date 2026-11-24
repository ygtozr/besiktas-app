import { describe, expect, it } from 'vitest';
import summary from './fixtures/summary.json';
import { placeAssists } from '../server/assists';
import { normalizeSummary, type RawSummary } from '../server/espn/normalize';
import type { Lineup, MatchEvent } from '../shared/types';

const lu = (starters: string[], bench: string[] = []): Lineup => ({
  teamId: '1',
  starters: starters.map((n) => ({ id: n, name: n, subbedIn: false, subbedOut: false })),
  bench: bench.map((n) => ({ id: n, name: n, subbedIn: false, subbedOut: false })),
});
const goal = (min: number, player: string): MatchEvent => ({
  minute: `${min}'`,
  order: min,
  kind: 'goal',
  side: 'home',
  player,
});
const sub = (min: number, inn: string, out: string): MatchEvent => ({
  minute: `${min}'`,
  order: min,
  kind: 'sub',
  side: 'home',
  player: inn,
  playerOut: out,
});
const counts = (o: Record<string, number>) => ({
  home: new Map(Object.entries(o)),
  away: new Map(),
});

describe('asist yerleştirme', () => {
  it('tek asistçi, tek gol: kesin', () => {
    const r = placeAssists([goal(10, 'A')], { home: lu(['A', 'B']) }, counts({ B: 1 }));
    expect(r.events[0].assist).toBe('B');
    expect(r.unplaced).toEqual([]);
  });

  it('asistçi sayısı gol sayısına eşit ve tek kişi: hepsi onun', () => {
    const r = placeAssists(
      [goal(10, 'A'), goal(50, 'C')],
      { home: lu(['A', 'B', 'C']) },
      counts({ B: 2 }),
    );
    expect(r.events.map((e) => e.assist)).toEqual(['B', 'B']);
  });

  it('oyundan çıkan oyuncu sonraki gole asist yapamaz', () => {
    // B 30'da çıktı → yalnız 10' golüne asist yapabilir
    const r = placeAssists(
      [goal(10, 'A'), sub(30, 'D', 'B'), goal(60, 'A')],
      { home: lu(['A', 'B'], ['D']) },
      counts({ B: 1 }),
    );
    expect(r.events[0].assist).toBe('B');
    expect(r.events[2].assist).toBeUndefined();
  });

  it('belirsizse tahmin yok, listede kalır', () => {
    const r = placeAssists(
      [goal(10, 'A'), goal(60, 'A')],
      { home: lu(['A', 'B']) },
      counts({ B: 1 }),
    );
    expect(r.events.every((e) => !e.assist)).toBe(true);
    expect(r.unplaced).toEqual([{ side: 'home', names: ['B'] }]);
  });

  it('golcü kendi golüne asist yapamaz', () => {
    const r = placeAssists(
      [goal(10, 'A'), goal(20, 'B')],
      { home: lu(['A', 'B']) },
      counts({ B: 1 }),
    );
    expect(r.events[0].assist).toBe('B');
  });
});

describe('ESPN maçında asist', () => {
  const d = normalizeSummary(summary as unknown as RawSummary);

  it('Konyaspor golleri: tek asistçi Deniz Turuc, kesin', () => {
    const home = d.events.filter((e) => e.side === 'home' && e.kind === 'goal');
    expect(home.map((e) => e.assist)).toEqual(['Deniz Turuc', 'Deniz Turuc']);
  });

  it('Beşiktaş: 4 gol, 3 asistçi, eşleşme belirsiz → ayrı listelenir', () => {
    const away = d.events.filter((e) => e.side === 'away' && e.kind === 'goal');
    expect(away.every((e) => !e.assist)).toBe(true);
    expect(d.assistsUnplaced).toEqual([
      {
        side: 'away',
        names: expect.arrayContaining(['Amir Murillo', 'Wilfred Ndidi', 'Ernest Poku']),
      },
    ]);
  });
});
