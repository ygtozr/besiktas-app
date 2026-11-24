// Ortak tipler. Sunucu ve istemci aynı şekli kullanır.
// Kaynak (ESPN, API-Football...) değişse de bu şekil sabit kalır.

/** other = hazırlık vb. Fikstür listesine girmez. */
export type Competition = 'superlig' | 'cup' | 'europe' | 'other';

export type MatchState = 'pre' | 'in' | 'post' | 'off';

export interface TeamRef {
  id: string;
  name: string;
  short: string;
  isUs: boolean;
}

export interface MatchSummary {
  id: string;
  /** ISO tarih, UTC */
  date: string;
  /** Saat belli mi? Belli değilse yalnız gün göster. */
  timeKnown: boolean;
  competition: Competition;
  competitionName: string;
  /** Kaynağın lig kodu. Detay sorgusu için gerekir. */
  leagueSlug: string;
  home: TeamRef;
  away: TeamRef;
  homeScore: number | null;
  awayScore: number | null;
  state: MatchState;
  /** Örn. "Maç sonu", "67'", "Ertelendi" */
  statusText: string;
  venue?: string;
}

export type EventKind = 'goal' | 'own-goal' | 'penalty' | 'yellow' | 'red' | 'sub' | 'other';

export interface MatchEvent {
  minute: string;
  /** Sıralama için dakika sayısı (45+2 → 45.02) */
  order: number;
  kind: EventKind;
  side: 'home' | 'away';
  player?: string;
  /** Değişiklikte çıkan oyuncu */
  playerOut?: string;
}

export interface LineupPlayer {
  id: string;
  name: string;
  number?: string;
  position?: string;
  subbedIn: boolean;
  subbedOut: boolean;
}

export interface Lineup {
  teamId: string;
  formation?: string;
  starters: LineupPlayer[];
  bench: LineupPlayer[];
}

export interface StatRow {
  key: string;
  label: string;
  home: string;
  away: string;
}

export interface MatchDetail {
  match: MatchSummary;
  events: MatchEvent[];
  lineups: { home?: Lineup; away?: Lineup };
  stats: StatRow[];
}

export type PositionGroup = 'GK' | 'DF' | 'MF' | 'FW' | '?';

export interface Player {
  id: string;
  name: string;
  number?: string;
  position: PositionGroup;
  age?: number;
  nationality?: string;
  appearances: number;
  subIns: number;
  goals: number;
  assists: number;
  /** Hesaplanan dakika. Hesaplanamazsa null. */
  minutes: number | null;
  yellow: number;
  red: number;
}

export interface Squad {
  scope: string;
  players: Player[];
  /** Dakika kaç maçtan hesaplandı */
  minutesFromMatches: number;
}

export interface StandingRow {
  rank: number;
  teamId: string;
  team: string;
  short: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  isUs: boolean;
  /** Türkçe bölge adı: "Şampiyonlar Ligi", "Küme düşme"... */
  zone?: string;
  /** Bölge türü: çizgi stili için */
  zoneKind?: ZoneKind;
}

export type ZoneKind = 'top' | 'mid' | 'low';

export type StandingsLeague = 'superlig' | 'europe';

export interface Standings {
  league: StandingsLeague;
  season: string;
  rows: StandingRow[];
}

export interface Fixtures {
  matches: MatchSummary[];
  /** Kapsanmayan turnuvalar için uyarı */
  notices: string[];
}

export interface LiveState {
  active: boolean;
  detail?: MatchDetail;
  next?: MatchSummary;
  /** İstemci kaç sn sonra tekrar sorsun. null = sorma. */
  pollSeconds: number | null;
}

export interface Usage {
  day: string;
  counts: Record<string, number>;
  since: string;
  note: string;
}

/** Her API yanıtı bu zarfla gelir. */
export interface Envelope<T> {
  data: T;
  source: string;
  fetchedAt: string;
  /** true: kaynak hata verdi, eski kopya döndü */
  stale: boolean;
  demo: boolean;
}
