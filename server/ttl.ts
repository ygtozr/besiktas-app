// Önbellek süreleri (saniye).
export const TTL = {
  fixtures: 6 * 60 * 60,
  /** Maç günü fikstür sık yenilenir: skor bayat kalmasın */
  fixturesMatchDay: 5 * 60,
  standings: 60 * 60,
  squad: 24 * 60 * 60,
  live: 2 * 60,
  matchPre: 60 * 60,
  matchPost: 7 * 24 * 60 * 60,
  usage: 0,
} as const;

/** Kaynak hata verirse eski kopya en çok bu kadar yaşar. */
export const MAX_STALE = 3 * 24 * 60 * 60;
