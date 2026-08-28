import type { Match, MatchStatus } from "./types";

const zone = "Europe/Istanbul";

export function formatDate(value: string, includeTime = true) {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: zone,
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(value));
}

export function monthKey(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: zone,
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export const organizationLabels = {
  lig: "Lig",
  avrupa: "Avrupa",
  kupa: "Türkiye Kupası",
} as const;
export const statusLabels: Record<MatchStatus, string> = {
  scheduled: "Planlandı",
  finished: "Tamamlandı",
  postponed: "Ertelendi",
  cancelled: "İptal edildi",
  tbd: "Saat kesinleşmedi",
};

export function resultLetter(match: Match) {
  if (!match.score) return "–";
  return match.score.besiktas > match.score.opponent
    ? "G"
    : match.score.besiktas === match.score.opponent
      ? "B"
      : "M";
}

export function displayValue(value: number | null) {
  return value === null
    ? "Bilinmiyor"
    : new Intl.NumberFormat("tr-TR").format(value);
}
