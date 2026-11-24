import type { Envelope } from '../shared/types.js';
import type { CacheResult } from './cache.js';

/** JSON yanıt. sMaxAge > 0 ise CDN önbelleğe alır. */
export function json(body: unknown, sMaxAge: number, status = 200): Response {
  const cache =
    sMaxAge > 0
      ? `public, max-age=0, s-maxage=${sMaxAge}, stale-while-revalidate=${sMaxAge}`
      : 'no-store';
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': cache },
  });
}

export function envelope<T>(r: CacheResult<T>, source: string): Envelope<T> {
  return {
    data: r.value,
    source,
    fetchedAt: r.fetchedAt.toISOString(),
    stale: r.stale,
    demo: false,
  };
}

export function fail(err: unknown): Response {
  console.error(JSON.stringify({ evt: 'handler_error', error: String(err) }));
  return json({ error: 'Veri kaynağına ulaşılamadı.' }, 0, 502);
}
