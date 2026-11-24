// İlk 11'i saha dizilişine yerleştir. Saf fonksiyon: test edilebilir.
import type { LineupPlayer } from '../../shared/types';

/** Pozisyon kodu → derinlik (0 kaleci … 5 forvet). */
export function depth(code = ''): number {
  const c = code.toUpperCase();
  if (c === 'G' || c === 'GK') return 0;
  if (/^(CD|CB|SW)/.test(c) || ['LB', 'RB', 'D', 'DF', 'LWB', 'RWB', 'WB'].includes(c)) return 1;
  if (/^(DM|CDM)/.test(c)) return 2;
  if (/^(AM|CAM)/.test(c) || ['LW', 'RW'].includes(c)) return 4;
  if (/^(F|CF|ST|FW|LF|RF|SS)/.test(c)) return 5;
  return 3; // CM, LM, RM, M, MF ve bilinmeyen
}

/** Pozisyon kodu → yan konum (0 sol … 4 sağ). */
export function lateral(code = ''): number {
  const c = code.toUpperCase();
  if (c.endsWith('-L')) return 1;
  if (c.endsWith('-R')) return 3;
  if (/^L(B|M|W|WB|F|CB|CM)?$/.test(c)) return 0;
  if (/^R(B|M|W|WB|F|CB|CM)?$/.test(c)) return 4;
  return 2;
}

/**
 * Satırlar: [kaleci], [defans], ... [forvet]. Her satır soldan sağa.
 * Önce API-Football ızgarası ("satır:sütun"), yoksa diziliş + pozisyon kodu.
 */
export function pitchRows(starters: LineupPlayer[], formation?: string): LineupPlayer[][] {
  if (starters.length > 0 && starters.every((p) => p.grid && /^\d+:\d+$/.test(p.grid))) {
    const rows = new Map<number, LineupPlayer[]>();
    for (const p of starters) {
      const [r] = p.grid!.split(':').map(Number);
      rows.set(r, [...(rows.get(r) ?? []), p]);
    }
    return [...rows.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([, ps]) =>
        ps.sort((a, b) => Number(a.grid!.split(':')[1]) - Number(b.grid!.split(':')[1])),
      );
  }

  const byDepth = [...starters].sort(
    (a, b) => depth(a.position) - depth(b.position) || lateral(a.position) - lateral(b.position),
  );
  const gk = byDepth.filter((p) => depth(p.position) === 0);
  const field = byDepth.filter((p) => depth(p.position) !== 0);
  const counts = (formation ?? '')
    .split('-')
    .map(Number)
    .filter((n) => n > 0);
  let lines: LineupPlayer[][];
  if (counts.length > 0 && counts.reduce((a, b) => a + b, 0) === field.length) {
    lines = [];
    let i = 0;
    for (const n of counts) {
      lines.push(field.slice(i, i + n));
      i += n;
    }
  } else {
    const g = new Map<number, LineupPlayer[]>();
    for (const p of field) g.set(depth(p.position), [...(g.get(depth(p.position)) ?? []), p]);
    lines = [...g.entries()].sort((a, b) => a[0] - b[0]).map(([, ps]) => ps);
  }
  const sortLat = (ps: LineupPlayer[]) =>
    [...ps].sort((a, b) => lateral(a.position) - lateral(b.position));
  return [gk, ...lines.map(sortLat)].filter((r) => r.length > 0);
}

/** Sahada kısa ad: soyadı (çok kısaysa tam ad). */
export function shortName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return name;
  const last = parts.at(-1)!;
  return last.length <= 2 ? parts.slice(-2).join(' ') : last;
}
