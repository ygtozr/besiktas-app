// Asisti gole bağla. Kaynak (ESPN) yalnız "oyuncu bu maçta N asist yaptı" diyor,
// hangi gole yaptığını söylemiyor. Burada yalnız KESİN olanı bağlarız:
// tüm geçerli eşleşmeler aynı sonucu veriyorsa. Tahmin yok.
import type { Lineup, MatchEvent } from '../shared/types.js';

export interface Unplaced {
  side: 'home' | 'away';
  names: string[];
}

type Side = 'home' | 'away';
const INF = 1e9;

/** Oyuncunun sahada olduğu aralık (dakika). Hiç girmediyse undefined. */
function intervals(lu: Lineup, events: MatchEvent[], side: Side): Map<string, [number, number]> {
  const out = new Map<string, [number, number]>();
  for (const p of lu.starters) out.set(p.name, [0, INF]);
  for (const e of events) {
    if (e.side !== side) continue;
    const t = Math.floor(e.order);
    if (e.kind === 'sub') {
      if (e.playerOut) {
        const iv = out.get(e.playerOut);
        if (iv) iv[1] = t;
      }
      if (e.player) out.set(e.player, [t, INF]);
    } else if (e.kind === 'red' && e.player) {
      const iv = out.get(e.player);
      if (iv) iv[1] = t;
    }
  }
  return out;
}

const NONE = '';

export function placeAssists(
  events: MatchEvent[],
  lineups: { home?: Lineup; away?: Lineup },
  counts: { home: Map<string, number>; away: Map<string, number> },
): { events: MatchEvent[]; unplaced: Unplaced[] } {
  const result = events.map((e) => ({ ...e }));
  const unplaced: Unplaced[] = [];

  for (const side of ['home', 'away'] as const) {
    const assisters: string[] = [];
    for (const [name, n] of counts[side]) for (let i = 0; i < n; i++) assisters.push(name);
    if (assisters.length === 0) continue;

    const goals = result.filter((e) => e.side === side && e.kind === 'goal');
    const lu = lineups[side];
    const names = [...new Set(assisters)];
    if (!lu || assisters.length > goals.length) {
      unplaced.push({ side, names });
      continue;
    }
    const iv = intervals(lu, result, side);
    const can = (name: string, g: MatchEvent) => {
      const r = iv.get(name);
      const t = Math.floor(g.order);
      return !!r && r[0] <= t && t <= r[1] && name !== g.player;
    };

    // tüm geçerli eşleşmeleri say (küçük küme: elle tarama yeter)
    const solutions = new Set<string>();
    const slot: string[] = goals.map(() => NONE);
    const sorted = [...assisters].sort();
    const walk = (i: number, minGoal: number) => {
      if (solutions.size > 500) return;
      if (i === sorted.length) {
        solutions.add(slot.join('|'));
        return;
      }
      // aynı ad üst üste: simetriyi kır (aynı adlı asistleri artan gol sırasıyla koy)
      const from = i > 0 && sorted[i] === sorted[i - 1] ? minGoal : 0;
      for (let g = from; g < goals.length; g++) {
        if (slot[g] !== NONE || !can(sorted[i], goals[g])) continue;
        slot[g] = sorted[i];
        walk(i + 1, g + 1);
        slot[g] = NONE;
      }
    };
    walk(0, 0);

    if (solutions.size === 0) {
      unplaced.push({ side, names });
      continue;
    }
    const sols = [...solutions].map((s) => s.split('|'));
    const left = new Map<string, number>();
    for (const a of assisters) left.set(a, (left.get(a) ?? 0) + 1);
    goals.forEach((g, i) => {
      const v = sols[0][i];
      if (v !== NONE && sols.every((s) => s[i] === v)) {
        g.assist = v;
        left.set(v, (left.get(v) ?? 0) - 1);
      }
    });
    const rest = [...left].filter(([, n]) => n > 0).map(([name]) => name);
    if (rest.length) unplaced.push({ side, names: rest });
  }
  return { events: result, unplaced };
}
