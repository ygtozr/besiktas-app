import { getFixtures, fixturesTtl } from '../espn/source.js';
import { envelope, fail, json } from '../http.js';

export async function handleFixtures(): Promise<Response> {
  try {
    const r = await getFixtures();
    return json(envelope(r, 'ESPN'), fixturesTtl(r.value));
  } catch (e) {
    return fail(e);
  }
}
