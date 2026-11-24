// Tarih ve saat: hep İstanbul saati.
const TZ = 'Europe/Istanbul';

const fmt = (o: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('tr-TR', { timeZone: TZ, ...o });

const dayFmt = fmt({ day: 'numeric', month: 'short', weekday: 'short' });
const longDayFmt = fmt({ day: 'numeric', month: 'long', weekday: 'long' });
const timeFmt = fmt({ hour: '2-digit', minute: '2-digit' });
const monthFmt = fmt({ month: 'long', year: 'numeric' });
const clockFmt = fmt({ hour: '2-digit', minute: '2-digit', second: '2-digit' });

export const shortDay = (iso: string) => dayFmt.format(new Date(iso));
export const longDay = (iso: string) => longDayFmt.format(new Date(iso));
export const time = (iso: string) => timeFmt.format(new Date(iso));
export const month = (iso: string) => monthFmt.format(new Date(iso));
export const clock = (iso: string) => clockFmt.format(new Date(iso));

/** "3 dk önce", "2 sa önce" */
export function ago(iso: string, now = Date.now()): string {
  const s = Math.max(0, Math.round((now - Date.parse(iso)) / 1000));
  if (s < 60) return 'az önce';
  if (s < 3600) return `${Math.floor(s / 60)} dk önce`;
  if (s < 86400) return `${Math.floor(s / 3600)} sa önce`;
  return `${Math.floor(s / 86400)} gün önce`;
}
