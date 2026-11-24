// Günlük dış istek sayacı.
// Bellekte tutar ve her isteği log'a yazar (Vercel loglarında görünür).
// Sunucu uyuyunca bellek sıfırlanır. Kalıcı sayaç için CounterStore'u Redis ile değiştir.

export interface CounterStore {
  incr(day: string, source: string): Promise<number>;
  snapshot(day: string): Promise<Record<string, number>>;
}

export class MemoryCounter implements CounterStore {
  private days = new Map<string, Map<string, number>>();

  async incr(day: string, source: string): Promise<number> {
    // eski günleri at
    for (const d of this.days.keys()) if (d !== day) this.days.delete(d);
    const m = this.days.get(day) ?? new Map<string, number>();
    const n = (m.get(source) ?? 0) + 1;
    m.set(source, n);
    this.days.set(day, m);
    return n;
  }

  async snapshot(day: string): Promise<Record<string, number>> {
    return Object.fromEntries(this.days.get(day) ?? []);
  }
}

/** Türkiye saatine göre gün: 2026-11-22 */
export function dayKey(now = new Date(), timeZone = 'Europe/Istanbul'): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone }).format(now);
}

export const counter: CounterStore = new MemoryCounter();
export const counterSince = new Date().toISOString();

export async function countRequest(source: string, path: string): Promise<number> {
  const day = dayKey();
  const n = await counter.incr(day, source);
  console.info(JSON.stringify({ evt: 'upstream_request', source, path, day, count: n }));
  return n;
}
