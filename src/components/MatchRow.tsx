import { Link } from 'react-router';
import type { MatchSummary } from '../../shared/types';
import { shortDay, time } from '../lib/format';
import { matchHref, outcome } from '../lib/result';

export function MatchRow({ m, id }: { m: MatchSummary; id?: string }) {
  const o = outcome(m);
  const played = m.state === 'post' || m.state === 'in';
  return (
    <Link to={matchHref(m)} className={`mrow ${m.state}`} id={id}>
      <div className="mrow-meta">
        <span>{shortDay(m.date)}</span>
        <span className="mrow-comp">{m.competitionName}</span>
      </div>
      <div className="mrow-body">
        <span className={`mrow-team home ${m.home.isUs ? 'us' : ''}`}>{m.home.name}</span>
        <span className="mrow-score">
          {played ? (
            <>
              {m.homeScore}
              <i>–</i>
              {m.awayScore}
            </>
          ) : m.state === 'off' ? (
            m.statusText
          ) : m.timeKnown ? (
            time(m.date)
          ) : (
            'Saat ?'
          )}
        </span>
        <span className={`mrow-team away ${m.away.isUs ? 'us' : ''}`}>{m.away.name}</span>
      </div>
      <div className="mrow-tail">
        {m.state === 'in' ? (
          <span className="live-dot">{m.statusText}</span>
        ) : o ? (
          <span
            className={`badge o-${o}`}
            aria-label={{ G: 'Galibiyet', B: 'Beraberlik', M: 'Mağlubiyet' }[o]}
          >
            {o}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
