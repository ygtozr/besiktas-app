// Kulüp ayarı. ID'ler 22.11.2026'da kaynaklardan doğrulandı.
// Yenilemek için: npm run discover
// apiFootball: yedek kaynak. Ücretsiz plan güncel sezonu açmıyor.
import type { Competition } from '../shared/types.js';

export const club = {
  displayName: 'Beşiktaş',
  timezone: 'Europe/Istanbul',
  espn: {
    teamId: '1895',
    leagues: {
      superLig: 'tur.1',
      /** Fikstürde Avrupa maçı yoksa puan durumu için */
      europeFallback: 'uefa.europa',
    },
    competitionBySlugPrefix: {
      'tur.1': 'superlig',
      'tur.': 'cup',
      'uefa.': 'europe',
    },
  },
  apiFootball: {
    teamId: 549,
    leagues: {
      superLig: 203,
      turkishCup: 206,
      superCup: 551,
    },
  },
} as const;

export const competitionBySlugPrefix: Record<string, Competition> =
  club.espn.competitionBySlugPrefix;
