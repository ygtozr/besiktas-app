import type { MatchSummary } from './types.js';

/** Canlı pencere: başlamadan 15 dk önce → başladıktan 150 dk sonra. */
export const WINDOW_BEFORE_MS = 15 * 60 * 1000;
export const WINDOW_AFTER_MS = 150 * 60 * 1000;

export function inLiveWindow(m: MatchSummary, now: number): boolean {
  if (m.state === 'in') return true;
  if (m.state === 'off' || !m.timeKnown) return false;
  const k = Date.parse(m.date);
  return now >= k - WINDOW_BEFORE_MS && now <= k + WINDOW_AFTER_MS;
}

/** Penceredeki maç. Yoksa undefined. */
export function findLiveCandidate(matches: MatchSummary[], now: number): MatchSummary | undefined {
  return matches.find((m) => inLiveWindow(m, now) && m.state !== 'post');
}

/** Sıradaki maç (henüz oynanmamış). */
export function nextMatch(matches: MatchSummary[], now: number): MatchSummary | undefined {
  return matches
    .filter((m) => m.state === 'pre' && Date.parse(m.date) + WINDOW_AFTER_MS > now)
    .sort((a, b) => Date.parse(a.date) - Date.parse(b.date))[0];
}

/** Yakında maç var mı? Fikstür önbelleği kısa tutulur. */
export function isMatchDay(matches: MatchSummary[], now: number): boolean {
  const day = 24 * 60 * 60 * 1000;
  return matches.some((m) => {
    if (m.state === 'in') return true;
    const k = Date.parse(m.date);
    return k - WINDOW_BEFORE_MS <= now + day && now <= k + WINDOW_AFTER_MS + 3 * 60 * 60 * 1000;
  });
}

/** Canlı değilse istemci ne zaman tekrar sorsun (sn). En az 60, en çok 6 saat. */
export function secondsUntilWindow(next: MatchSummary | undefined, now: number): number | null {
  if (!next || !next.timeKnown) return null;
  const s = Math.round((Date.parse(next.date) - WINDOW_BEFORE_MS - now) / 1000);
  return Math.min(Math.max(s, 60), 6 * 60 * 60);
}
