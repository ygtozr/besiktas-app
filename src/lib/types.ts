export type Organization = "lig" | "avrupa" | "kupa";
export type MatchStatus =
  "scheduled" | "finished" | "postponed" | "cancelled" | "tbd";

export interface Match {
  id: string;
  opponent: string;
  organization: Organization;
  competition: string;
  date: string;
  venue: string;
  home: boolean;
  status: MatchStatus;
  score?: { besiktas: number; opponent: number };
}

export interface Standing {
  position: number;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface Player {
  id: string;
  name: string;
  number: number;
  position: "Kaleci" | "Defans" | "Orta saha" | "Forvet";
  birthDate: string;
  nationality: string;
  photoUrl?: string;
  appearances: number | null;
  starts: number | null;
  minutes: number | null;
  goals: number | null;
  assists: number | null;
  yellowCards: number | null;
  redCards: number | null;
}

export interface FootballData {
  source: "demo" | "api-football";
  updatedAt: string;
  stale: boolean;
  matches: Match[];
  standings: Standing[];
  players: Player[];
}

export interface FootballDataProvider {
  getData(): Promise<FootballData>;
}
