import type { StandingsLeague } from '../../shared/types.js';
import { getStandings } from '../espn/source.js';
import { envelope, fail, json } from '../http.js';
import { TTL } from '../ttl.js';

export async function handleStandings(req?: Request): Promise<Response> {
  const lig = req ? new URL(req.url).searchParams.get('lig') : null;
  const league: StandingsLeague = lig === 'avrupa' ? 'europe' : 'superlig';
  try {
    return json(envelope(await getStandings(league), 'ESPN'), TTL.standings);
  } catch (e) {
    return fail(e);
  }
}
