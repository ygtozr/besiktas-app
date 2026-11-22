import { getSquad } from '../espn/source.js';
import { envelope, fail, json } from '../http.js';
import { TTL } from '../ttl.js';

export async function handleSquad(): Promise<Response> {
  try {
    return json(envelope(await getSquad(), 'ESPN'), TTL.squad);
  } catch (e) {
    return fail(e);
  }
}
