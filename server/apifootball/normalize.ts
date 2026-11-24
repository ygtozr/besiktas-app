// API-Football ham verisi → ortak tipler. Saf fonksiyon.
import { club } from '../../config/club.js';
import type {
  EventKind,
  Lineup,
  LineupPlayer,
  MatchDetail,
  MatchEvent,
  MatchState,
  MatchSummary,
  StatRow,
  TeamRef,
} from '../../shared/types.js';
import { minuteOrder, teamName } from '../espn/normalize.js';

const US = club.apiFootball.teamId;
export const AF_PREFIX = 'af-';
export const afSlug = (league: number) => `af.${league}`;

/* ---------- ham şekiller ---------- */

interface AfTeam {
  id: number;
  name: string;
}

export interface AfFixture {
  fixture: {
    id: number;
    date: string;
    venue?: { name?: string | null };
    status: { short: string; elapsed?: number | null; extra?: number | null };
  };
  league: { id: number; name?: string; round?: string };
  teams: { home: AfTeam; away: AfTeam };
  goals: { home: number | null; away: number | null };
  events?: AfEvent[];
  lineups?: AfLineup[];
  statistics?: { team: AfTeam; statistics: { type: string; value: number | string | null }[] }[];
}

interface AfEvent {
  time: { elapsed: number; extra?: number | null };
  team: AfTeam;
  player: { id?: number | null; name?: string | null };
  assist: { id?: number | null; name?: string | null };
  type: string;
  detail: string;
}

interface AfLineupPlayer {
  player: { id: number; name: string; number?: number | null; pos?: string | null };
}

interface AfLineup {
  team: AfTeam;
  formation?: string | null;
  startXI: AfLineupPlayer[];
  substitutes: AfLineupPlayer[];
}

export interface AfResponse<T> {
  response: T[];
}

/* ---------- yardımcı ---------- */

function team(t: AfTeam): TeamRef {
  const name = teamName(t.name);
  return {
    id: `${AF_PREFIX}${t.id}`,
    name,
    short: name
      .replace(/[^A-Za-zÇĞİÖŞÜçğıöşü]/g, '')
      .slice(0, 3)
      .toLocaleUpperCase('tr'),
    isUs: t.id === US,
  };
}

const PRE = new Set(['TBD', 'NS']);
const LIVE = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE', 'INT', 'SUSP']);
const POST = new Set(['FT', 'AET', 'PEN']);

function state(short: string): MatchState {
  if (PRE.has(short)) return 'pre';
  if (LIVE.has(short)) return 'in';
  if (POST.has(short)) return 'post';
  return 'off';
}

function statusText(f: AfFixture['fixture']['status'], st: MatchState): string {
  switch (st) {
    case 'pre':
      return '';
    case 'off':
      return f.short === 'PST' ? 'Ertelendi' : 'İptal';
    case 'post':
      return f.short === 'PEN' ? 'Penaltılar' : f.short === 'AET' ? 'Uzatma sonu' : 'Maç sonu';
    default:
      if (f.short === 'HT') return 'Devre arası';
      if (f.short === 'BT') return 'Uzatma arası';
      if (f.short === 'P') return 'Penaltılar';
      return f.elapsed ? `${f.elapsed}'${f.extra ? `+${f.extra}'` : ''}` : 'Canlı';
  }
}

/** "Quarter-finals" → "Çeyrek final" vb. Bilinmeyen tur olduğu gibi kalır. */
export function roundTr(r: string | undefined): string | undefined {
  if (!r) return undefined;
  let m: RegExpMatchArray | null;
  if (/^final$/i.test(r)) return 'Final';
  if (/semi-?finals?/i.test(r)) return 'Yarı final';
  if (/quarter-?finals?/i.test(r)) return 'Çeyrek final';
  if (/round of 16|8th finals/i.test(r)) return 'Son 16';
  if (/play-?offs?/i.test(r)) return 'Play-off';
  if ((m = r.match(/group stage\s*-\s*(\d+)/i))) return `Grup ${m[1]}. maç`;
  if ((m = r.match(/group\s+([a-z])\b/i))) return `${m[1].toUpperCase()} Grubu`;
  if ((m = r.match(/^(\d+)(?:st|nd|rd|th) round/i))) return `${m[1]}. tur`;
  return r;
}

export function normalizeAfFixture(f: AfFixture): MatchSummary {
  const st = state(f.fixture.status.short);
  const played = st === 'in' || st === 'post';
  const round = roundTr(f.league.round);
  return {
    id: `${AF_PREFIX}${f.fixture.id}`,
    date: new Date(f.fixture.date).toISOString(),
    timeKnown: f.fixture.status.short !== 'TBD',
    competition: 'cup',
    competitionName: round ? `Türkiye Kupası · ${round}` : 'Türkiye Kupası',
    leagueSlug: afSlug(f.league.id),
    home: team(f.teams.home),
    away: team(f.teams.away),
    homeScore: played ? f.goals.home : null,
    awayScore: played ? f.goals.away : null,
    state: st,
    statusText: statusText(f.fixture.status, st),
    venue: f.fixture.venue?.name ?? undefined,
  };
}

export function normalizeAfFixtures(r: AfResponse<AfFixture>): MatchSummary[] {
  return r.response.map(normalizeAfFixture).sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
}

/* ---------- maç detayı ---------- */

function eventKind(e: AfEvent): EventKind | undefined {
  const d = e.detail.toLowerCase();
  if (e.type === 'Goal') {
    if (d.includes('missed')) return undefined;
    if (d.includes('own')) return 'own-goal';
    if (d.includes('penalty')) return 'penalty';
    return 'goal';
  }
  if (e.type === 'Card') return d.includes('yellow') && !d.includes('second') ? 'yellow' : 'red';
  if (e.type.toLowerCase() === 'subst') return 'sub';
  return undefined;
}

/**
 * Değişiklikte "player" ve "assist" alanlarından hangisinin çıkan olduğu
 * kaynakta tutarsız olabilir. O an sahada olan oyuncu = çıkan.
 */
export function normalizeAfEvents(
  raw: AfEvent[],
  homeId: number,
  lineups: AfLineup[],
): MatchEvent[] {
  const onPitch = new Set<number>();
  for (const l of lineups) for (const p of l.startXI) onPitch.add(p.player.id);
  const sorted = [...raw].sort(
    (a, b) =>
      a.time.elapsed + (a.time.extra ?? 0) / 100 - (b.time.elapsed + (b.time.extra ?? 0) / 100),
  );
  const out: MatchEvent[] = [];
  for (const e of sorted) {
    const kind = eventKind(e);
    if (!kind) continue;
    const minute = `${e.time.elapsed}${e.time.extra ? `+${e.time.extra}` : ''}'`;
    const side = e.team.id === homeId ? 'home' : 'away';
    if (kind === 'sub') {
      const a = e.player;
      const b = e.assist;
      const aOn = a.id != null && onPitch.has(a.id);
      const [goingOut, comingIn] = aOn || !(b.id != null && onPitch.has(b.id)) ? [a, b] : [b, a];
      if (goingOut.id != null) onPitch.delete(goingOut.id);
      if (comingIn.id != null) onPitch.add(comingIn.id);
      out.push({
        minute,
        order: minuteOrder(minute),
        kind,
        side,
        player: comingIn.name ?? undefined,
        playerOut: goingOut.name ?? undefined,
      });
      continue;
    }
    out.push({
      minute,
      order: minuteOrder(minute),
      kind,
      side,
      player: e.player.name ?? undefined,
    });
  }
  return out;
}

function lineup(l: AfLineup, events: MatchEvent[], side: 'home' | 'away'): Lineup {
  const ins = new Set(
    events.filter((e) => e.kind === 'sub' && e.side === side).map((e) => e.player),
  );
  const outs = new Set(
    events.filter((e) => e.kind === 'sub' && e.side === side).map((e) => e.playerOut),
  );
  const p = (x: AfLineupPlayer): LineupPlayer => ({
    id: String(x.player.id),
    name: x.player.name,
    number: x.player.number != null ? String(x.player.number) : undefined,
    position: x.player.pos ?? undefined,
    subbedIn: ins.has(x.player.name),
    subbedOut: outs.has(x.player.name),
  });
  return {
    teamId: `${AF_PREFIX}${l.team.id}`,
    formation: l.formation ?? undefined,
    starters: l.startXI.map(p),
    bench: l.substitutes.map(p),
  };
}

const STAT: [string, string][] = [
  ['Ball Possession', 'Topa sahip olma'],
  ['Total Shots', 'Şut'],
  ['Shots on Goal', 'İsabetli şut'],
  ['Corner Kicks', 'Korner'],
  ['Total passes', 'Pas'],
  ['Passes %', 'Pas isabeti'],
  ['Fouls', 'Faul'],
  ['Offsides', 'Ofsayt'],
  ['Goalkeeper Saves', 'Kurtarış'],
  ['Yellow Cards', 'Sarı kart'],
  ['Red Cards', 'Kırmızı kart'],
];

function statVal(v: number | string | null | undefined): string {
  if (v === null || v === undefined || v === '') return '0';
  const s = String(v);
  return s.endsWith('%') ? `%${s.slice(0, -1)}` : s;
}

export function normalizeAfDetail(f: AfFixture): MatchDetail {
  const match = normalizeAfFixture(f);
  const homeId = f.teams.home.id;
  const lineups = f.lineups ?? [];
  const events = normalizeAfEvents(f.events ?? [], homeId, lineups);
  const hl = lineups.find((l) => l.team.id === homeId);
  const al = lineups.find((l) => l.team.id !== homeId);
  const hs = f.statistics?.find((s) => s.team.id === homeId)?.statistics;
  const as = f.statistics?.find((s) => s.team.id !== homeId)?.statistics;
  const stats: StatRow[] = [];
  if (hs && as) {
    for (const [type, label] of STAT) {
      const h = hs.find((s) => s.type === type);
      const a = as.find((s) => s.type === type);
      if (!h && !a) continue;
      stats.push({ key: type, label, home: statVal(h?.value), away: statVal(a?.value) });
    }
  }
  return {
    match,
    events,
    lineups: { home: hl && lineup(hl, events, 'home'), away: al && lineup(al, events, 'away') },
    stats,
  };
}
