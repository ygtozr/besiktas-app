import type { Envelope, LiveState } from '../../shared/types.js';
import { getFixtures, getMatch } from '../espn/source.js';
import { fail, json } from '../http.js';
import { findLiveCandidate, nextMatch, secondsUntilWindow } from '../../shared/live-window.js';
import { TTL } from '../ttl.js';

/**
 * Canlı maç. Yalnız maç penceresinde ESPN'e sorar.
 * Pencere dışında fikstür önbelleğinden cevap verir: dış istek yok.
 */
export async function handleLive(now = Date.now()): Promise<Response> {
  try {
    const fx = await getFixtures();
    const matches = fx.value.matches;
    const cand = findLiveCandidate(matches, now);

    if (!cand) {
      const next = nextMatch(matches, now);
      const poll = secondsUntilWindow(next, now);
      const body: Envelope<LiveState> = {
        data: { active: false, next, pollSeconds: poll },
        source: 'ESPN',
        fetchedAt: fx.fetchedAt.toISOString(),
        stale: fx.stale,
        demo: false,
      };
      return json(body, Math.min(poll ?? 600, 600));
    }

    const r = await getMatch(cand.id, cand.leagueSlug, TTL.live);
    const d = r.value;
    const active = d.match.state !== 'post' && d.match.state !== 'off';
    const body: Envelope<LiveState> = {
      data: {
        active,
        detail: d,
        next: active ? undefined : nextMatch(matches, now),
        pollSeconds: active ? TTL.live : null,
      },
      source: 'ESPN',
      fetchedAt: r.fetchedAt.toISOString(),
      stale: r.stale,
      demo: false,
    };
    return json(body, active ? 60 : 300);
  } catch (e) {
    return fail(e);
  }
}
