import { describe, expect, it } from 'vitest';
import summary from './fixtures/summary.json';
import { normalizeSummary, type RawSummary } from '../server/espn/normalize';
import { depth, lateral, pitchRows, shortName } from '../src/lib/formation';
import type { LineupPlayer } from '../shared/types';

const d = normalizeSummary(summary as unknown as RawSummary);
const names = (rows: LineupPlayer[][]) => rows.map((r) => r.map((p) => p.name));

describe('saha dizilişi', () => {
  it('Beşiktaş 4-1-4-1: satır sayıları ve soldan sağa sıra', () => {
    const lu = d.lineups.away!;
    const rows = pitchRows(lu.starters, lu.formation);
    expect(rows.map((r) => r.length)).toEqual([1, 4, 1, 4, 1]);
    expect(names(rows)[1]).toEqual([
      'Ridvan Yilmaz',
      'Tiago Djaló',
      'Emmanuel Agbadou',
      'Amir Murillo',
    ]);
    expect(names(rows)[3]).toEqual([
      'Ernest Poku',
      'Junior Olaitan',
      'Wilfred Ndidi',
      'Leandro Trossard',
    ]);
    expect(names(rows)[4]).toEqual(['Dusan Vlahovic']);
  });

  it('Konyaspor 4-4-2', () => {
    const lu = d.lineups.home!;
    expect(pitchRows(lu.starters, lu.formation).map((r) => r.length)).toEqual([1, 4, 4, 2]);
  });

  it('diziliş tutmazsa derinliğe göre gruplar', () => {
    const p = (name: string, position: string): LineupPlayer => ({
      id: name,
      name,
      position,
      subbedIn: false,
      subbedOut: false,
    });
    const rows = pitchRows([p('K', 'G'), p('D', 'CD'), p('F', 'F')], '4-4-2');
    expect(names(rows)).toEqual([['K'], ['D'], ['F']]);
  });

  it('API-Football ızgarası öncelikli', () => {
    const p = (name: string, grid: string): LineupPlayer => ({
      id: name,
      name,
      grid,
      subbedIn: false,
      subbedOut: false,
    });
    const rows = pitchRows([p('F', '3:1'), p('K', '1:1'), p('D2', '2:2'), p('D1', '2:1')]);
    expect(names(rows)).toEqual([['K'], ['D1', 'D2'], ['F']]);
  });

  it('kodlar', () => {
    expect(depth('G')).toBe(0);
    expect(depth('CD-L')).toBe(1);
    expect(depth('DM')).toBe(2);
    expect(depth('LM')).toBe(3);
    expect(depth('CF-R')).toBe(5);
    expect(lateral('LB')).toBe(0);
    expect(lateral('CM-L')).toBe(1);
    expect(lateral('F')).toBe(2);
    expect(lateral('RM')).toBe(4);
    expect(shortName('Dusan Vlahovic')).toBe('Vlahovic');
    expect(shortName('Oh Hyeon-Gyu')).toBe('Hyeon-Gyu');
  });
});
