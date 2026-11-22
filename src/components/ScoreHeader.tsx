import type { MatchSummary } from '../../shared/types';
import { longDay, time } from '../lib/format';

export function ScoreHeader({ m }: { m: MatchSummary }) {
  const played = m.state === 'post' || m.state === 'in';
  return (
    <header className="score-head">
      <div className="sh-comp">{m.competitionName}</div>
      <div className="sh-row">
        <div className={`sh-team ${m.home.isUs ? 'us' : ''}`}>{m.home.name}</div>
        <div className="sh-score" aria-live={m.state === 'in' ? 'polite' : undefined}>
          {played ? (
            <>
              {m.homeScore}
              <i>–</i>
              {m.awayScore}
            </>
          ) : (
            <span className="sh-time">{m.timeKnown ? time(m.date) : '—'}</span>
          )}
        </div>
        <div className={`sh-team ${m.away.isUs ? 'us' : ''}`}>{m.away.name}</div>
      </div>
      <div className="sh-status">
        {m.state === 'in' ? <span className="live-dot">{m.statusText}</span> : m.statusText}
      </div>
      <div className="sh-meta">
        {longDay(m.date)}
        {m.venue ? ` · ${m.venue}` : ''}
      </div>
    </header>
  );
}
