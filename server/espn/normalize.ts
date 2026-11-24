// ESPN ham verisi → ortak tipler. Saf fonksiyon. Ağ yok, test kolay.

import { club, competitionBySlugPrefix } from '../../config/club.js';
import { teamNames } from '../../config/team-names.js';
import { countryTr } from '../country-tr.js';
import type {
  Competition,
  EventKind,
  Lineup,
  LineupPlayer,
  MatchDetail,
  MatchEvent,
  MatchState,
  MatchSummary,
  Player,
  PositionGroup,
  StandingRow,
  Standings,
  StatRow,
  StandingsLeague,
  TeamRef,
  ZoneKind,
} from '../../shared/types.js';

/* ---------- ham ESPN şekilleri (yalnız kullandığımız alanlar) ---------- */

type Score = string | { value?: number; displayValue?: string } | undefined;

interface RawTeam {
  id: string;
  displayName: string;
  shortDisplayName?: string;
  abbreviation?: string;
}

interface RawCompetitor {
  id?: string;
  homeAway: 'home' | 'away';
  team: RawTeam;
  score?: Score;
}

interface RawStatus {
  displayClock?: string;
  type: { name: string; state: 'pre' | 'in' | 'post'; completed?: boolean; shortDetail?: string };
}

interface RawCompetition {
  date: string;
  timeValid?: boolean;
  venue?: { fullName?: string };
  status: RawStatus;
  competitors: RawCompetitor[];
}

export interface RawEvent {
  id: string;
  date: string;
  timeValid?: boolean;
  league?: { slug?: string; name?: string };
  season?: { displayName?: string };
  competitions: RawCompetition[];
}

export interface RawSchedule {
  events?: RawEvent[];
}

interface RawKeyEvent {
  type: { type?: string; text?: string };
  clock?: { displayValue?: string };
  team?: { id?: string };
  scoringPlay?: boolean;
  participants?: { athlete: { id?: string; displayName: string } }[];
}

interface RawRosterEntry {
  starter?: boolean;
  jersey?: string;
  subbedIn?: boolean;
  subbedOut?: boolean;
  athlete: { id: string; displayName: string };
  position?: { abbreviation?: string };
}

interface RawRoster {
  homeAway: 'home' | 'away';
  team: RawTeam;
  formation?: string;
  roster?: RawRosterEntry[];
}

export interface RawSummary {
  header: {
    id: string;
    league?: { slug?: string; name?: string };
    competitions: (RawCompetition & { id?: string })[];
  };
  gameInfo?: { venue?: { fullName?: string } };
  boxscore?: {
    teams?: {
      team: RawTeam;
      homeAway?: 'home' | 'away';
      statistics?: { name: string; displayValue: string }[];
    }[];
  };
  rosters?: RawRoster[];
  keyEvents?: RawKeyEvent[];
}

interface RawStat {
  name: string;
  displayValue?: string;
  value?: number;
}

export interface RawTeamRoster {
  season?: { displayName?: string };
  athletes?: {
    id: string;
    displayName: string;
    jersey?: string;
    age?: number;
    citizenship?: string;
    position?: { abbreviation?: string; name?: string };
    statistics?: { splits?: { categories?: { stats: RawStat[] }[] } };
  }[];
}

export interface RawStandings {
  children?: {
    standings: {
      seasonDisplayName?: string;
      entries: {
        team: RawTeam;
        note?: { description?: string };
        stats: RawStat[];
      }[];
    };
  }[];
}

/* ---------- yardımcı ---------- */

const US = club.espn.teamId;
const names = teamNames;

/** "2026-27 Turkish Super Lig" → "2026-27 Süper Lig" */
export function seasonName(raw: string | undefined): string {
  return (raw ?? '')
    .replace(/Turkish Super Lig/i, 'Süper Lig')
    .replace(/UEFA Champions League/i, 'Şampiyonlar Ligi')
    .replace(/UEFA Europa Conference League|UEFA Conference League/i, 'Konferans Ligi')
    .replace(/UEFA Europa League/i, 'Avrupa Ligi')
    .trim();
}

/** ESPN bölge notu → Türkçe ad + tür. */
export function zoneOf(desc: string | undefined): { zone?: string; zoneKind?: ZoneKind } {
  if (!desc) return {};
  const d = desc.toLowerCase();
  const q = d.includes('qualif') && !d.includes('qualifies');
  if (d.includes('relegat')) return { zone: 'Küme düşme', zoneKind: 'low' };
  if (d.includes('eliminat')) return { zone: 'Elendi', zoneKind: 'low' };
  if (d.includes('round of 16')) return { zone: 'Son 16 turu', zoneKind: 'top' };
  if (d.includes('play-off') || d.includes('playoff'))
    return { zone: 'Play-off turu', zoneKind: 'mid' };
  if (d.includes('champions'))
    return { zone: q ? 'Şampiyonlar Ligi ön eleme' : 'Şampiyonlar Ligi', zoneKind: 'top' };
  if (d.includes('europa'))
    return { zone: q ? 'Avrupa Ligi ön eleme' : 'Avrupa Ligi', zoneKind: 'mid' };
  if (d.includes('conference'))
    return { zone: q ? 'Konferans Ligi ön eleme' : 'Konferans Ligi', zoneKind: 'mid' };
  return { zone: desc, zoneKind: 'mid' };
}

export function teamName(raw: string): string {
  return names[raw] ?? raw;
}

function team(t: RawTeam): TeamRef {
  return {
    id: t.id,
    name: teamName(t.displayName),
    short: t.abbreviation ?? t.displayName.slice(0, 3).toUpperCase(),
    isUs: t.id === US,
  };
}

function scoreOf(s: Score): number | null {
  if (s === undefined || s === null) return null;
  if (typeof s === 'string') return s === '' ? null : Number(s);
  if (typeof s.value === 'number') return s.value;
  if (s.displayValue !== undefined) return Number(s.displayValue);
  return null;
}

export function competitionOf(slug: string | undefined): Competition {
  if (!slug) return 'other';
  const map = competitionBySlugPrefix;
  // uzun önek önce: "tur.1" > "tur."
  const key = Object.keys(map)
    .sort((a, b) => b.length - a.length)
    .find((p) => slug === p || slug.startsWith(p));
  return key ? map[key] : 'other';
}

const EURO: Record<string, string> = {
  'uefa.champions': 'Şampiyonlar Ligi',
  'uefa.europa': 'Avrupa Ligi',
  'uefa.europa.conf': 'Konferans Ligi',
};

export function competitionName(slug: string, comp: Competition, fallback?: string): string {
  if (comp === 'other') return slug === 'club.friendly' ? 'Hazırlık' : (fallback ?? 'Diğer');
  if (comp === 'superlig') return 'Süper Lig';
  if (comp === 'cup') return 'Türkiye Kupası';
  const base = slug.replace(/_qual$/, '');
  const name = EURO[base] ?? 'Avrupa';
  return slug.endsWith('_qual') ? `${name} Ön Eleme` : name;
}

function stateOf(st: RawStatus): MatchState {
  const n = st.type.name;
  if (/POSTPONED|CANCELED|CANCELLED|SUSPENDED|ABANDONED/.test(n)) return 'off';
  return st.type.state;
}

function statusText(st: RawStatus, state: MatchState): string {
  const n = st.type.name;
  if (state === 'off') return /POSTPONED/.test(n) ? 'Ertelendi' : 'İptal';
  if (state === 'pre') return '';
  if (state === 'post') {
    if (/PEN/.test(n)) return 'Penaltılar';
    if (/AET|EXTRA/.test(n)) return 'Uzatma sonu';
    return 'Maç sonu';
  }
  if (/HALFTIME/.test(n)) return 'Devre arası';
  return st.displayClock ?? 'Canlı';
}

function summaryFrom(
  id: string,
  slug: string,
  c: RawCompetition,
  timeValid: boolean | undefined,
  venue?: string,
  leagueName?: string,
): MatchSummary | undefined {
  const comp = competitionOf(slug);
  const home = c.competitors.find((x) => x.homeAway === 'home');
  const away = c.competitors.find((x) => x.homeAway === 'away');
  if (!home || !away) return undefined;
  const state = stateOf(c.status);
  const showScore = state === 'in' || state === 'post';
  return {
    id,
    date: new Date(c.date).toISOString(),
    timeKnown: timeValid !== false && c.timeValid !== false,
    competition: comp,
    competitionName: competitionName(slug, comp, leagueName),
    leagueSlug: slug,
    home: team(home.team),
    away: team(away.team),
    homeScore: showScore ? scoreOf(home.score) : null,
    awayScore: showScore ? scoreOf(away.score) : null,
    state,
    statusText: statusText(c.status, state),
    venue: venue ?? c.venue?.fullName,
  };
}

/* ---------- fikstür ---------- */

export function normalizeSchedule(...schedules: RawSchedule[]): MatchSummary[] {
  const byId = new Map<string, MatchSummary>();
  for (const s of schedules) {
    for (const e of s.events ?? []) {
      const c = e.competitions[0];
      if (!c) continue;
      const m = summaryFrom(e.id, e.league?.slug ?? '', c, e.timeValid);
      // hazırlık maçları listeye girmez
      if (m && m.competition !== 'other') byId.set(m.id, m);
    }
  }
  return [...byId.values()].sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
}

/* ---------- maç detayı ---------- */

export function minuteOrder(display: string | undefined): number {
  if (!display) return 0;
  const m = display.match(/(\d+)'?(?:\s*\+\s*(\d+))?/);
  if (!m) return 0;
  return Number(m[1]) + (m[2] ? Number(m[2]) / 100 : 0);
}

function eventKind(e: RawKeyEvent): EventKind | undefined {
  const t = (e.type.type ?? e.type.text ?? '').toLowerCase();
  if (t.includes('own')) return 'own-goal';
  if (t.includes('penalty') && (e.scoringPlay || t.includes('scored'))) return 'penalty';
  if (t.includes('penalty')) return undefined; // kaçan penaltı: şimdilik gösterme
  if (t.startsWith('goal') || e.scoringPlay) return 'goal';
  if (t.includes('red')) return 'red';
  if (t.includes('yellow')) return 'yellow';
  if (t.includes('substitution')) return 'sub';
  return undefined;
}

export function normalizeEvents(raw: RawKeyEvent[] | undefined, homeId: string): MatchEvent[] {
  const out: MatchEvent[] = [];
  for (const e of raw ?? []) {
    const kind = eventKind(e);
    if (!kind) continue;
    const p = e.participants ?? [];
    const minute = e.clock?.displayValue ?? '';
    // kendi kalesine golde takım = golü yazan değil, kazanan taraf olabilir; ESPN team'i olduğu gibi al
    out.push({
      minute,
      order: minuteOrder(minute),
      kind,
      side: e.team?.id === homeId ? 'home' : 'away',
      player: p[0]?.athlete.displayName,
      playerOut: kind === 'sub' ? p[1]?.athlete.displayName : undefined,
    });
  }
  return out.sort((a, b) => a.order - b.order);
}

function lineupPlayer(r: RawRosterEntry): LineupPlayer {
  return {
    id: r.athlete.id,
    name: r.athlete.displayName,
    number: r.jersey,
    position: r.position?.abbreviation,
    subbedIn: !!r.subbedIn,
    subbedOut: !!r.subbedOut,
  };
}

function lineup(r: RawRoster): Lineup | undefined {
  const list = r.roster ?? [];
  if (list.length === 0) return undefined;
  return {
    teamId: r.team.id,
    formation: r.formation,
    starters: list.filter((x) => x.starter).map(lineupPlayer),
    bench: list.filter((x) => !x.starter).map(lineupPlayer),
  };
}

const STAT_LABELS: [string, string, (v: string) => string][] = [
  ['possessionPct', 'Topa sahip olma', (v) => `%${Math.round(Number(v))}`],
  ['totalShots', 'Şut', (v) => v],
  ['shotsOnTarget', 'İsabetli şut', (v) => v],
  ['wonCorners', 'Korner', (v) => v],
  ['totalPasses', 'Pas', (v) => v],
  ['passPct', 'Pas isabeti', (v) => `%${Math.round(Number(v) * 100)}`],
  ['foulsCommitted', 'Faul', (v) => v],
  ['offsides', 'Ofsayt', (v) => v],
  ['saves', 'Kurtarış', (v) => v],
  ['yellowCards', 'Sarı kart', (v) => v],
  ['redCards', 'Kırmızı kart', (v) => v],
];

export function normalizeStats(box: RawSummary['boxscore'], homeId: string): StatRow[] {
  const teams = box?.teams ?? [];
  const h = teams.find((t) => t.homeAway === 'home' || t.team.id === homeId);
  const a = teams.find((t) => t !== h);
  if (!h?.statistics?.length || !a?.statistics?.length) return [];
  const get = (t: typeof h, k: string) => t.statistics?.find((s) => s.name === k)?.displayValue;
  const rows: StatRow[] = [];
  for (const [key, label, fmt] of STAT_LABELS) {
    const hv = get(h, key);
    const av = get(a, key);
    if (hv === undefined || av === undefined) continue;
    rows.push({ key, label, home: fmt(hv), away: fmt(av) });
  }
  return rows;
}

export function normalizeSummary(raw: RawSummary): MatchDetail {
  const c = raw.header.competitions[0];
  const slug = raw.header.league?.slug ?? '';
  const match = summaryFrom(
    raw.header.id,
    slug,
    c,
    c.timeValid,
    raw.gameInfo?.venue?.fullName,
    raw.header.league?.name,
  );
  if (!match) throw new Error(`Maç verisi eksik: ${raw.header.id}`);
  const homeId = match.home.id;
  const rosters = raw.rosters ?? [];
  const hr = rosters.find((r) => r.homeAway === 'home');
  const ar = rosters.find((r) => r.homeAway === 'away');
  return {
    match,
    events: normalizeEvents(raw.keyEvents, homeId),
    lineups: { home: hr && lineup(hr), away: ar && lineup(ar) },
    stats: normalizeStats(raw.boxscore, homeId),
  };
}

/* ---------- oyuncu dakikası ---------- */

const FULL = 90;

/**
 * Bir maçta oyuncuların oynadığı dakika.
 * İlk 11: 0'dan çıkışa ya da 90'a. Yedek: girişten çıkışa ya da 90'a.
 * Uzatmalar sayılmaz. Kırmızı kart çıkış sayılır.
 */
export function minutesInMatch(d: MatchDetail, teamId: string): Map<string, number> {
  const side = d.match.home.id === teamId ? 'home' : 'away';
  const lu = d.lineups[side];
  const out = new Map<string, number>();
  if (!lu) return out;
  const byName = new Map<string, LineupPlayer>();
  for (const p of [...lu.starters, ...lu.bench]) byName.set(p.name, p);

  const inAt = new Map<string, number>();
  const outAt = new Map<string, number>();
  for (const e of d.events) {
    if (e.side !== side) continue;
    const min = Math.min(Math.floor(e.order), FULL);
    if (e.kind === 'sub') {
      if (e.player) inAt.set(e.player, min);
      if (e.playerOut) outAt.set(e.playerOut, min);
    } else if (e.kind === 'red' && e.player) {
      outAt.set(e.player, min);
    }
  }

  for (const p of lu.starters) {
    out.set(p.id, outAt.get(p.name) ?? FULL);
  }
  for (const p of lu.bench) {
    const start = inAt.get(p.name);
    if (start === undefined) continue;
    out.set(p.id, Math.max(1, (outAt.get(p.name) ?? FULL) - start));
  }
  return out;
}

/* ---------- kadro ---------- */

function posGroup(abbr: string | undefined): PositionGroup {
  switch ((abbr ?? '').toUpperCase()) {
    case 'G':
    case 'GK':
      return 'GK';
    case 'D':
    case 'DF':
      return 'DF';
    case 'M':
    case 'MF':
      return 'MF';
    case 'F':
    case 'FW':
      return 'FW';
    default:
      return '?';
  }
}

function stat(cats: { stats: RawStat[] }[] | undefined, name: string): number {
  for (const c of cats ?? []) {
    const s = c.stats.find((x) => x.name === name);
    if (s) return Number(s.value ?? s.displayValue ?? 0) || 0;
  }
  return 0;
}

export function normalizeRoster(raw: RawTeamRoster, minutes?: Map<string, number>): Player[] {
  const order: Record<PositionGroup, number> = { GK: 0, DF: 1, MF: 2, FW: 3, '?': 4 };
  return (raw.athletes ?? [])
    .map((a): Player => {
      const cats = a.statistics?.splits?.categories;
      return {
        id: a.id,
        name: a.displayName,
        number: a.jersey,
        position: posGroup(a.position?.abbreviation),
        age: a.age,
        nationality: countryTr(a.citizenship),
        appearances: stat(cats, 'appearances'),
        subIns: stat(cats, 'subIns'),
        goals: stat(cats, 'totalGoals'),
        assists: stat(cats, 'goalAssists'),
        minutes: minutes ? (minutes.get(a.id) ?? 0) : null,
        yellow: stat(cats, 'yellowCards'),
        red: stat(cats, 'redCards'),
      };
    })
    .sort(
      (x, y) =>
        order[x.position] - order[y.position] ||
        Number(x.number ?? 99) - Number(y.number ?? 99) ||
        x.name.localeCompare(y.name, 'tr'),
    );
}

/* ---------- puan durumu ---------- */

export function normalizeStandings(
  raw: RawStandings,
  league: StandingsLeague = 'superlig',
): Standings {
  const s = raw.children?.[0]?.standings;
  const rows: StandingRow[] = (s?.entries ?? []).map((e) => {
    const v = (k: string) => {
      const st = e.stats.find((x) => x.name === k);
      return Number(st?.value ?? st?.displayValue ?? 0) || 0;
    };
    return {
      rank: v('rank'),
      teamId: e.team.id,
      team: teamName(e.team.displayName),
      short: e.team.abbreviation ?? '',
      played: v('gamesPlayed'),
      won: v('wins'),
      drawn: v('ties'),
      lost: v('losses'),
      gf: v('pointsFor'),
      ga: v('pointsAgainst'),
      gd: v('pointDifferential'),
      points: v('points'),
      isUs: e.team.id === US,
      ...zoneOf(e.note?.description),
    };
  });
  rows.sort((a, b) => a.rank - b.rank);
  return { league, season: seasonName(s?.seasonDisplayName), rows };
}
