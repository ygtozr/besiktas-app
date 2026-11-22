// Basit bellek önbelleği. Kaynak hata verirse eski kopyayı döndürür.
// Asıl kalıcı önbellek: CDN (s-maxage başlığı). Bu katman sıcak sunucuda tekrar isteği önler.

import { MAX_STALE } from './ttl.js';

interface Entry<T> {
  value: T;
  fetchedAt: number;
  ttl: number;
}

export interface CacheResult<T> {
  value: T;
  fetchedAt: Date;
  stale: boolean;
}

const store = new Map<string, Entry<unknown>>();
const inflight = new Map<string, Promise<CacheResult<unknown>>>();

export function clearCache(): void {
  store.clear();
  inflight.clear();
}

/**
 * key için taze kopya varsa onu ver. Yoksa load() çağır.
 * ttl bir fonksiyon olabilir: değere bakıp süre seçer (örn. maç bitti mi).
 */
export async function cached<T>(
  key: string,
  ttl: number | ((value: T) => number),
  load: () => Promise<T>,
  now: () => number = Date.now,
): Promise<CacheResult<T>> {
  const hit = store.get(key) as Entry<T> | undefined;
  if (hit && now() - hit.fetchedAt < hit.ttl * 1000) {
    return { value: hit.value, fetchedAt: new Date(hit.fetchedAt), stale: false };
  }

  const running = inflight.get(key) as Promise<CacheResult<T>> | undefined;
  if (running) return running;

  const p = (async (): Promise<CacheResult<T>> => {
    try {
      const value = await load();
      const t = typeof ttl === 'function' ? ttl(value) : ttl;
      const fetchedAt = now();
      store.set(key, { value, fetchedAt, ttl: t });
      return { value, fetchedAt: new Date(fetchedAt), stale: false };
    } catch (err) {
      if (hit && now() - hit.fetchedAt < MAX_STALE * 1000) {
        console.warn(JSON.stringify({ evt: 'stale_served', key, error: String(err) }));
        return { value: hit.value, fetchedAt: new Date(hit.fetchedAt), stale: true };
      }
      throw err;
    } finally {
      inflight.delete(key);
    }
  })();
  inflight.set(key, p);
  return p;
}
