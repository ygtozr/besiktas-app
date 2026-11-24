// Veri kaynağı arayüzü. Bugün ESPN. Yarın API-Football eklenebilir.
import type { Fixtures, MatchDetail, Squad, Standings } from '../shared/types.js';

export interface DataSource {
  name: string;
  fixtures(): Promise<Fixtures>;
  match(id: string, league?: string): Promise<MatchDetail>;
  squad(): Promise<Squad>;
  standings(): Promise<Standings>;
}
