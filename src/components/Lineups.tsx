import { useState } from 'react';
import type { Lineup, LineupPlayer, MatchEvent, MatchSummary } from '../../shared/types';
import { Pitch, marksFor } from './Pitch';

function BenchRow({
  p,
  events,
  side,
}: {
  p: LineupPlayer;
  events: MatchEvent[];
  side: 'home' | 'away';
}) {
  const sub = events.find((e) => e.side === side && e.kind === 'sub' && e.player === p.name);
  const m = marksFor(p.name, events, side);
  return (
    <li className={`lu-row ${sub ? 'came-on' : ''}`}>
      <span className="lu-num">{p.number ?? '–'}</span>
      <span className="lu-name">
        {p.name}
        {sub && (
          <small className="lu-sub">
            ⇄ {sub.minute} {sub.playerOut ? `${sub.playerOut} yerine` : 'oyuna girdi'}
          </small>
        )}
      </span>
      <span className="lu-pos">
        {m.goals > 0 && `⚽${m.goals > 1 ? m.goals : ''}`}
        {(m.yellow || m.red) && <span className={`mini-card ${m.red ? 'red' : 'yellow'}`} />}
      </span>
      <span className="lu-flag">{sub ? '↑' : ''}</span>
    </li>
  );
}

export function Lineups({
  m,
  home,
  away,
  events,
}: {
  m: MatchSummary;
  home?: Lineup;
  away?: Lineup;
  events: MatchEvent[];
}) {
  const [side, setSide] = useState<'home' | 'away'>(m.home.isUs ? 'home' : 'away');
  if (!home && !away) return <p className="empty">Kadrolar henüz açıklanmadı.</p>;
  const lu = side === 'home' ? home : away;
  // oyuna girenler önce, girme sırasıyla
  const bench = lu
    ? [...lu.bench].sort((a, b) => {
        const ia = events.findIndex(
          (e) => e.kind === 'sub' && e.side === side && e.player === a.name,
        );
        const ib = events.findIndex(
          (e) => e.kind === 'sub' && e.side === side && e.player === b.name,
        );
        return (ia < 0 ? 1e9 : ia) - (ib < 0 ? 1e9 : ib);
      })
    : [];
  return (
    <div>
      <div className="seg" role="tablist" aria-label="Takım seç">
        {(['home', 'away'] as const).map((s) => (
          <button
            key={s}
            role="tab"
            aria-selected={side === s}
            className={side === s ? 'on' : ''}
            onClick={() => setSide(s)}
          >
            {m[s].name}
          </button>
        ))}
      </div>
      {lu ? (
        <>
          <h3 className="sub-h">
            İlk 11 {lu.formation && <span className="muted">· {lu.formation}</span>}
          </h3>
          <Pitch lineup={lu} events={events} side={side} />
          <p className="legend-line">
            <span>⇄ oyundan çıktı (dakika · giren)</span>
            <span>⚽ gol</span>
            <span>
              <span className="mini-card yellow" /> <span className="mini-card red" /> kart
            </span>
          </p>
          <h3 className="sub-h">Yedekler</h3>
          <ul className="lineup bench">
            {bench.map((p) => (
              <BenchRow key={p.id} p={p} events={events} side={side} />
            ))}
          </ul>
        </>
      ) : (
        <p className="empty">Bu takımın kadrosu yok.</p>
      )}
    </div>
  );
}
