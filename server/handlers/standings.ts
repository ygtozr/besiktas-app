import { getStandings } from '../espn/source.js';
import { envelope, fail, json } from '../http.js';
import { TTL } from '../ttl.js';

export async function handleStandings(): Promise<Response> {
  try {
    return json(envelope(await getStandings(), 'ESPN'), TTL.standings);
  } catch (e) {
    return fail(e);
  }
}
