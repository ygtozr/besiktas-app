import type { Lineup, LineupPlayer, MatchEvent } from '../../shared/types';
import { pitchRows, shortName } from '../lib/formation';

interface Marks {
  goals: number;
  ownGoals: number;
  yellow: boolean;
  red: boolean;
  /** çıktıysa: dakika + giren */
  off?: { minute: string; by?: string };
  /** sonradan girdiyse: dakika */
  on?: string;
}

function marksFor(name: string, events: MatchEvent[], side: 'home' | 'away'): Marks {
  const m: Marks = { goals: 0, ownGoals: 0, yellow: false, red: false };
  for (const e of events) {
    if (e.kind === 'own-goal' && e.player === name) m.ownGoals++;
    if (e.side !== side) continue;
    if ((e.kind === 'goal' || e.kind === 'penalty') && e.player === name) m.goals++;
    if (e.kind === 'yellow' && e.player === name) m.yellow = true;
    if (e.kind === 'red' && e.player === name) m.red = true;
    if (e.kind === 'sub' && e.playerOut === name && !m.off)
      m.off = { minute: e.minute, by: e.player };
    if (e.kind === 'sub' && e.player === name && !m.on) m.on = e.minute;
  }
  return m;
}

function Dot({ p, m }: { p: LineupPlayer; m: Marks }) {
  const label = [
    p.name,
    m.goals ? `${m.goals} gol` : '',
    m.yellow ? 'sarı kart' : '',
    m.red ? 'kırmızı kart' : '',
    m.off ? `${m.off.minute} oyundan çıktı${m.off.by ? `, yerine ${m.off.by}` : ''}` : '',
  ]
    .filter(Boolean)
    .join(', ');
  return (
    <li className={`pl ${m.off ? 'off' : ''}`} aria-label={label}>
      <span className="pl-shirt">
        {p.number ?? ''}
        {m.off && (
          <span className="pl-sub" title={`${m.off.minute} değişti`}>
            ⇄
          </span>
        )}
        {(m.yellow || m.red) && <span className={`pl-card ${m.red ? 'red' : 'yellow'}`} />}
        {m.goals > 0 && <span className="pl-goal">⚽{m.goals > 1 ? <b>{m.goals}</b> : null}</span>}
      </span>
      <span className="pl-name">{shortName(p.name)}</span>
      {m.off && (
        <span className="pl-in">
          {m.off.minute} {m.off.by ? shortName(m.off.by) : ''}
        </span>
      )}
    </li>
  );
}

export function Pitch({
  lineup,
  events,
  side,
}: {
  lineup: Lineup;
  events: MatchEvent[];
  side: 'home' | 'away';
}) {
  const rows = pitchRows(lineup.starters, lineup.formation);
  return (
    <div className="pitch" role="group" aria-label={`Saha dizilişi ${lineup.formation ?? ''}`}>
      <span className="pitch-lines" aria-hidden="true">
        <i className="box top" />
        <i className="mid" />
        <i className="circle" />
        <i className="box bottom" />
      </span>
      {/* hücum yukarıda: satırları ters çiz */}
      {[...rows].reverse().map((row, i) => (
        <ul key={i} className="pitch-row">
          {row.map((p) => (
            <Dot key={p.id} p={p} m={marksFor(p.name, events, side)} />
          ))}
        </ul>
      ))}
    </div>
  );
}

export { marksFor };
