import type { StatRow } from '../../shared/types';

const num = (s: string) => Number(s.replace('%', '')) || 0;

export function StatBars({ stats }: { stats: StatRow[] }) {
  if (stats.length === 0) return <p className="empty">İstatistik yok.</p>;
  return (
    <ul className="stats">
      {stats.map((s) => {
        const h = num(s.home);
        const a = num(s.away);
        const total = h + a || 1;
        return (
          <li key={s.key} className="stat">
            <div className="stat-top">
              <span className={h > a ? 'lead' : ''}>{s.home}</span>
              <span className="stat-lbl">{s.label}</span>
              <span className={a > h ? 'lead' : ''}>{s.away}</span>
            </div>
            <div className="stat-bar" aria-hidden="true">
              <span className="h" style={{ width: `${(h / total) * 100}%` }} />
              <span className="a" style={{ width: `${(a / total) * 100}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
