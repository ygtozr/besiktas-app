import { useNow } from '../lib/useNow';

export function Countdown({ to }: { to: string }) {
  const now = useNow(1000);
  const diff = Math.max(0, Date.parse(to) - now);
  const s = Math.floor(diff / 1000);
  const parts = [
    { v: Math.floor(s / 86400), l: 'gün' },
    { v: Math.floor((s % 86400) / 3600), l: 'saat' },
    { v: Math.floor((s % 3600) / 60), l: 'dk' },
    { v: s % 60, l: 'sn' },
  ];
  return (
    <div className="countdown" role="timer" aria-label="Maça kalan süre">
      {parts.map((p) => (
        <div key={p.l} className="cd-cell">
          <span className="cd-num">{String(p.v).padStart(2, '0')}</span>
          <span className="cd-lbl">{p.l}</span>
        </div>
      ))}
    </div>
  );
}
