import { describe, expect, it } from 'vitest';
import past from './fixtures/schedule-past.json';
import future from './fixtures/schedule-future.json';
import summary from './fixtures/summary.json';
import roster from './fixtures/roster.json';
import standings from './fixtures/standings.json';
import {
  competitionOf,
  minuteOrder,
  minutesInMatch,
  normalizeRoster,
  normalizeSchedule,
  normalizeStandings,
  normalizeSummary,
  seasonName,
  zoneOf,
  type RawSchedule,
  type RawStandings,
  type RawSummary,
  type RawTeamRoster,
} from '../server/espn/normalize';

describe('fikstür', () => {
  const list = normalizeSchedule(past as RawSchedule, future as RawSchedule);

  it('tarih sırası, hazırlık maçı yok', () => {
    const dates = list.map((m) => Date.parse(m.date));
    expect(dates).toEqual([...dates].sort((a, b) => a - b));
    expect(list.every((m) => m.competition !== 'other')).toBe(true);
  });

  it('Konya deplasmanı 2-4', () => {
    const m = list.find((x) => x.id === '401888246')!;
    expect(m.home.name).toBe('Konyaspor');
    expect(m.away.name).toBe('Beşiktaş');
    expect(m.away.isUs).toBe(true);
    expect([m.homeScore, m.awayScore]).toEqual([2, 4]);
    expect(m.state).toBe('post');
    expect(m.competition).toBe('superlig');
    expect(m.venue).toContain('Konya');
  });

  it('oynanmamış maçta skor yok', () => {
    const m = list.find((x) => x.state === 'pre')!;
    expect(m.homeScore).toBeNull();
    expect(m.awayScore).toBeNull();
  });

  it('Avrupa maçı ayrılır', () => {
    expect(
      list.some((m) => m.competition === 'europe' && m.competitionName === 'Avrupa Ligi'),
    ).toBe(true);
  });

  it('turnuva eşleme', () => {
    expect(competitionOf('tur.1')).toBe('superlig');
    expect(competitionOf('tur.cup')).toBe('cup');
    expect(competitionOf('uefa.europa_qual')).toBe('europe');
    expect(competitionOf('club.friendly')).toBe('other');
  });
});

describe('maç detayı', () => {
  const d = normalizeSummary(summary as unknown as RawSummary);

  it('skor ve takımlar', () => {
    expect(d.match.home.name).toBe('Konyaspor');
    expect([d.match.homeScore, d.match.awayScore]).toEqual([2, 4]);
  });

  it('goller doğru tarafta', () => {
    const goals = d.events.filter((e) => e.kind === 'goal');
    expect(goals.filter((g) => g.side === 'away')).toHaveLength(4);
    expect(goals.filter((g) => g.side === 'home')).toHaveLength(2);
    expect(goals[0]).toMatchObject({ minute: "10'", player: 'Dusan Vlahovic', side: 'away' });
  });

  it('değişiklikte giren ve çıkan', () => {
    const sub = d.events.find((e) => e.kind === 'sub' && e.side === 'away')!;
    expect(sub.player).toBe('Fabio Miretti');
    expect(sub.playerOut).toBe('Junior Olaitan');
  });

  it('ilk 11 ve diziliş', () => {
    expect(d.lineups.away?.starters).toHaveLength(11);
    expect(d.lineups.away?.formation).toBe('4-1-4-1');
    expect(d.lineups.home?.starters).toHaveLength(11);
  });

  it('istatistik Türkçe', () => {
    const pos = d.stats.find((s) => s.key === 'possessionPct')!;
    expect(pos.label).toBe('Topa sahip olma');
    expect(pos.home).toMatch(/^%\d+$/);
  });

  it('dakika hesabı', () => {
    const mins = minutesInMatch(d, '1895');
    const by = (name: string) => {
      const all = [...d.lineups.away!.starters, ...d.lineups.away!.bench];
      return mins.get(all.find((p) => p.name === name)!.id);
    };
    expect(by('Alexander Nübel')).toBe(90);
    expect(by('Junior Olaitan')).toBe(66); // 66'da çıktı
    expect(by('Fabio Miretti')).toBe(24); // 66'da girdi
    expect(by('Dusan Vlahovic')).toBe(89);
  });

  it('uzatma dakikası sırası', () => {
    expect(minuteOrder("45'+2'")).toBeCloseTo(45.02);
    expect(minuteOrder("90'")).toBe(90);
    expect(minuteOrder(undefined)).toBe(0);
  });
});

describe('kadro', () => {
  it('mevkiye göre sıralı, istatistik dolu', () => {
    const list = normalizeRoster(roster as unknown as RawTeamRoster, new Map());
    expect(list.length).toBeGreaterThan(0);
    expect(list[0].position).toBe('GK');
    expect(list.every((p) => typeof p.goals === 'number' && p.minutes === 0)).toBe(true);
  });

  it('dakika yoksa null', () => {
    const list = normalizeRoster(roster as unknown as RawTeamRoster);
    expect(list.every((p) => p.minutes === null)).toBe(true);
  });
});

describe('puan durumu', () => {
  const s = normalizeStandings(standings as unknown as RawStandings);

  it('18 takım, sıralı, Beşiktaş işaretli', () => {
    expect(s.rows).toHaveLength(18);
    expect(s.rows.map((r) => r.rank)).toEqual(Array.from({ length: 18 }, (_, i) => i + 1));
    const us = s.rows.filter((r) => r.isUs);
    expect(us).toHaveLength(1);
    expect(us[0].team).toBe('Beşiktaş');
  });

  it('bölge adları Türkçe', () => {
    expect(s.season).toBe('2026-27 Süper Lig');
    expect(s.rows[0].zone).toBe('Şampiyonlar Ligi');
    expect(s.rows[0].zoneKind).toBe('top');
    expect(s.rows.at(-1)).toMatchObject({ zone: 'Küme düşme', zoneKind: 'low' });
  });

  it('Avrupa notları', () => {
    expect(zoneOf('Qualifies for round of 16')).toEqual({ zone: 'Son 16 turu', zoneKind: 'top' });
    expect(zoneOf('Knockout round play-offs').zone).toBe('Play-off turu');
    expect(zoneOf('Eliminated').zoneKind).toBe('low');
    expect(zoneOf('Europa League qualifying').zone).toBe('Avrupa Ligi ön eleme');
    expect(seasonName('2026-27 UEFA Europa League')).toBe('2026-27 Avrupa Ligi');
  });
});
