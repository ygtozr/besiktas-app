import type { MatchSummary } from '../../shared/types';

export type Outcome = 'G' | 'B' | 'M';

/** Bizim açımızdan sonuç: Galibiyet / Beraberlik / Mağlubiyet */
export function outcome(m: MatchSummary): Outcome | undefined {
  if (m.state !== 'post' || m.homeScore === null || m.awayScore === null) return undefined;
  const us = m.home.isUs ? m.homeScore : m.awayScore;
  const them = m.home.isUs ? m.awayScore : m.homeScore;
  return us > them ? 'G' : us < them ? 'M' : 'B';
}

export const matchHref = (m: Pick<MatchSummary, 'id' | 'leagueSlug'>) =>
  `/mac/${m.id}?l=${encodeURIComponent(m.leagueSlug)}`;
