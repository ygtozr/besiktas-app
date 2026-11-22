import { useState } from 'react';
import type { Lineup, LineupPlayer, MatchSummary } from '../../shared/types';

function Row({ p }: { p: LineupPlayer }) {
  return (
    <li className="lu-row">
      <span className="lu-num">{p.number ?? ''}</span>
      <span className="lu-name">{p.name}</span>
      <span className="lu-pos">{p.position && p.position !== 'SUB' ? p.position : ''}</span>
      <span className="lu-flag">
        {p.subbedIn && <span title="Oyuna girdi">↑</span>}
        {p.subbedOut && <span title="Oyundan çıktı">↓</span>}
      </span>
    </li>
  );
}

export function Lineups({ m, home, away }: { m: MatchSummary; home?: Lineup; away?: Lineup }) {
  const [side, setSide] = useState<'home' | 'away'>(m.home.isUs ? 'home' : 'away');
  if (!home && !away) return <p className="empty">Kadrolar henüz açıklanmadı.</p>;
  const lu = side === 'home' ? home : away;
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
          <ul className="lineup">
            {lu.starters.map((p) => (
              <Row key={p.id} p={p} />
            ))}
          </ul>
          <h3 className="sub-h">Yedekler</h3>
          <ul className="lineup bench">
            {lu.bench.map((p) => (
              <Row key={p.id} p={p} />
            ))}
          </ul>
        </>
      ) : (
        <p className="empty">Bu takımın kadrosu yok.</p>
      )}
    </div>
  );
}
