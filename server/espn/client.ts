// ESPN istemcisi. Her dış istek sayaçtan geçer.
import { countRequest } from '../counter.js';

const SITE = 'https://site.api.espn.com/apis/site/v2/sports/soccer';
const V2 = 'https://site.api.espn.com/apis/v2/sports/soccer';

export type Fetcher = (url: string) => Promise<unknown>;

async function httpGet(url: string): Promise<unknown> {
  const path = new URL(url).pathname;
  await countRequest('espn', path);
  const res = await fetch(url, {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`ESPN ${res.status} ${path}`);
  return res.json();
}

let fetcher: Fetcher = httpGet;

/** Testte sahte fetcher koy. */
export function setFetcher(f: Fetcher | null): void {
  fetcher = f ?? httpGet;
}

export const espnUrl = {
  pastSchedule: (team: string) => `${SITE}/all/teams/${team}/schedule`,
  futureSchedule: (team: string) => `${SITE}/all/teams/${team}/schedule?fixture=true`,
  summary: (league: string, id: string) =>
    `${SITE}/${encodeURIComponent(league)}/summary?event=${encodeURIComponent(id)}`,
  roster: (league: string, team: string) => `${SITE}/${league}/teams/${team}/roster`,
  standings: (league: string) => `${V2}/${league}/standings`,
};

export function espnGet<T>(url: string): Promise<T> {
  return fetcher(url) as Promise<T>;
}
