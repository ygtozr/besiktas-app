import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import future from './fixtures/schedule-future.json';
import summary from './fixtures/summary.json';
import { clearCache } from '../server/cache';
import { setFetcher } from '../server/espn/client';
import { handleLive } from '../server/handlers/live';
import type { Envelope, LiveState } from '../shared/types';

const calls: string[] = [];

beforeEach(() => {
  clearCache();
  calls.length = 0;
  setFetcher(async (url) => {
    calls.push(url);
    if (url.includes('/summary')) return summary;
    if (url.includes('fixture=true')) return future;
    return { events: [] };
  });
  vi.spyOn(console, 'info').mockImplementation(() => {});
});

afterEach(() => {
  setFetcher(null);
  vi.restoreAllMocks();
});

describe('/api/live', () => {
  it('maç penceresi dışında maç detayı istemez', async () => {
    const res = await handleLive(Date.parse('2026-11-24T12:00:00Z'));
    const body = (await res.json()) as Envelope<LiveState>;
    expect(body.data.active).toBe(false);
    expect(body.data.next?.away.name).toBe("Hapoel Be'er");
    expect(body.data.pollSeconds).toBeGreaterThan(0);
    expect(calls.some((u) => u.includes('/summary'))).toBe(false);
  });

  it('pencere içinde maç detayını ister', async () => {
    // 26 Kasım 17:45Z maçı, 10 dk sonra
    const res = await handleLive(Date.parse('2026-11-26T17:55:00Z'));
    expect(res.status).toBe(200);
    expect(calls.some((u) => u.includes('/summary?event=401915506'))).toBe(true);
  });
});
