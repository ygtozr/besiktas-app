import { club } from '../../config/club.js';
import type {
  Fixtures,
  MatchDetail,
  Squad,
  Standings,
  StandingsLeague,
} from '../../shared/types.js';
import { cached } from '../cache.js';
import { isMatchDay } from '../../shared/live-window.js';
import type { DataSource } from '../source.js';
import { TTL } from '../ttl.js';
import { espnGet, espnUrl } from './client.js';
import {
  minutesInMatch,
  normalizeRoster,
  normalizeSchedule,
  normalizeStandings,
  seasonName,
  normalizeSummary,
  type RawSchedule,
  type RawStandings,
  type RawSummary,
  type RawTeamRoster,
} from './normalize.js';

const TEAM = club.espn.teamId;
const LEAGUE = club.espn.leagues.superLig;

/** Maç detayı: durumuna göre önbellek süresi. */
export function matchTtl(d: MatchDetail): number {
  if (d.match.state === 'post') return TTL.matchPost;
  if (d.match.state === 'in') return TTL.live;
  return TTL.matchPre;
}

export function fixturesTtl(f: Fixtures, now = Date.now()): number {
  return isMatchDay(f.matches, now) ? TTL.fixturesMatchDay : TTL.fixtures;
}

async function loadFixtures(): Promise<Fixtures> {
  const [past, future] = await Promise.all([
    espnGet<RawSchedule>(espnUrl.pastSchedule(TEAM)),
    espnGet<RawSchedule>(espnUrl.futureSchedule(TEAM)),
  ]);
  const matches = normalizeSchedule(past, future);
  return { matches, notices: [] };
}

async function loadMatch(id: string, league: string): Promise<MatchDetail> {
  return normalizeSummary(await espnGet<RawSummary>(espnUrl.summary(league, id)));
}

export function getFixtures() {
  return cached('fixtures', (f: Fixtures) => fixturesTtl(f), loadFixtures);
}

export function getMatch(id: string, league = 'all', ttlOverride?: number) {
  return cached(`match:${id}`, ttlOverride ?? matchTtl, () => loadMatch(id, league));
}

/** Biten lig maçlarından dakika topla. Biten maç 7 gün önbellekte, tekrar istek az. */
async function leagueMinutes(): Promise<{ minutes: Map<string, number>; count: number }> {
  const { value } = await getFixtures();
  const done = value.matches.filter((m) => m.state === 'post' && m.leagueSlug === LEAGUE);
  const minutes = new Map<string, number>();
  let count = 0;
  // 4'erli grup: ESPN'i boğma
  for (let i = 0; i < done.length; i += 4) {
    const chunk = done.slice(i, i + 4);
    const details = await Promise.allSettled(chunk.map((m) => getMatch(m.id, m.leagueSlug)));
    for (const r of details) {
      if (r.status !== 'fulfilled') continue;
      count++;
      for (const [pid, min] of minutesInMatch(r.value.value, TEAM)) {
        minutes.set(pid, (minutes.get(pid) ?? 0) + min);
      }
    }
  }
  return { minutes, count };
}

async function loadSquad(): Promise<Squad> {
  const [roster, mins] = await Promise.all([
    espnGet<RawTeamRoster>(espnUrl.roster(LEAGUE, TEAM)),
    leagueMinutes().catch(() => undefined),
  ]);
  return {
    scope: `${seasonName(roster.season?.displayName) || 'Sezon'} · Süper Lig istatistikleri`,
    players: normalizeRoster(roster, mins?.minutes),
    minutesFromMatches: mins?.count ?? 0,
  };
}

/** Bu sezonun Avrupa turnuvası: fikstürdeki son Avrupa maçından (ön eleme hariç). */
export async function europeSlug(): Promise<string> {
  const { value } = await getFixtures();
  const euro = value.matches.filter(
    (m) => m.competition === 'europe' && !m.leagueSlug.endsWith('_qual'),
  );
  return euro.at(-1)?.leagueSlug ?? club.espn.leagues.europeFallback;
}

async function loadStandings(league: StandingsLeague): Promise<Standings> {
  const slug = league === 'europe' ? await europeSlug() : LEAGUE;
  return normalizeStandings(await espnGet<RawStandings>(espnUrl.standings(slug)), league);
}

export const espnSource: DataSource = {
  name: 'ESPN',
  fixtures: async () => (await getFixtures()).value,
  match: async (id, league) => (await getMatch(id, league)).value,
  squad: async () => (await getSquad()).value,
  standings: async () => (await getStandings()).value,
};

export function getSquad() {
  return cached('squad', TTL.squad, loadSquad);
}

export function getStandings(league: StandingsLeague = 'superlig') {
  return cached(`standings:${league}`, TTL.standings, () => loadStandings(league));
}
