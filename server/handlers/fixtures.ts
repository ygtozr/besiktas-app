import { cdnTtl, getFixtures } from '../data.js';
import { fail, json } from '../http.js';

export async function handleFixtures(): Promise<Response> {
  try {
    const r = await getFixtures();
    return json(
      {
        data: r.value,
        source: r.source,
        fetchedAt: r.fetchedAt.toISOString(),
        stale: r.stale,
        demo: false,
      },
      cdnTtl(r.value),
    );
  } catch (e) {
    return fail(e);
  }
}
