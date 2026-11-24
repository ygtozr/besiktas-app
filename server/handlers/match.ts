import { getMatch, matchCdnTtl } from '../data.js';
import { fail, json } from '../http.js';

const ID = /^(af-)?\d{1,12}$/;
const SLUG = /^[a-z0-9._]{1,40}$/;

export async function handleMatch(req: Request): Promise<Response> {
  const u = new URL(req.url);
  const id = u.searchParams.get('id') ?? '';
  const league = u.searchParams.get('league') ?? 'all';
  if (!ID.test(id) || !SLUG.test(league)) return json({ error: 'Geçersiz maç.' }, 0, 400);
  try {
    const r = await getMatch(id, league);
    return json(
      {
        data: r.value,
        source: r.source,
        fetchedAt: r.fetchedAt.toISOString(),
        stale: r.stale,
        demo: false,
      },
      matchCdnTtl(r.value),
    );
  } catch (e) {
    return fail(e);
  }
}
