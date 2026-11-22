import { Link } from 'react-router';
import { inLiveWindow, nextMatch } from '../../shared/live-window';
import type { Fixtures, Standings } from '../../shared/types';
import { Countdown } from '../components/Countdown';
import { DataNote } from '../components/DataNote';
import { ErrorBox, Loading } from '../components/States';
import { useApi, useRefreshOnFocus } from '../lib/api';
import { longDay, time } from '../lib/format';
import { matchHref, outcome } from '../lib/result';
import { useNow } from '../lib/useNow';

export function Home() {
  const fx = useApi<Fixtures>('/api/fixtures');
  const st = useApi<Standings>('/api/standings');
  useRefreshOnFocus(fx.reload);
  const now = useNow(30_000);

  const matches = fx.data?.data.matches ?? [];
  const next = nextMatch(matches, now);
  const last = [...matches].reverse().find((m) => m.state === 'post');
  const live = matches.find((m) => m.state === 'in' || (m.state === 'pre' && inLiveWindow(m, now)));

  const rows = st.data?.data.rows ?? [];
  const usIdx = rows.findIndex((r) => r.isUs);
  const around = usIdx < 0 ? [] : rows.slice(Math.max(0, usIdx - 1), usIdx + 2);

  return (
    <div className="page home">
      <h1 className="wordmark">
        Siyah<span>Beyaz</span>
      </h1>

      {live && (
        <Link to="/canli" className="live-banner">
          <span className="live-dot">Canlı</span> {live.home.name} – {live.away.name} → takip et
        </Link>
      )}

      <section className="card hero" aria-labelledby="next-h">
        <h2 id="next-h" className="eyebrow">
          Sıradaki maç
        </h2>
        {fx.error && !fx.data && <ErrorBox message={fx.error} onRetry={fx.reload} />}
        {!fx.data && !fx.error && <Loading />}
        {fx.data && !next && <p className="empty">Planlı maç yok.</p>}
        {next && (
          <Link to={matchHref(next)} className="hero-link">
            <div className="hero-comp">{next.competitionName}</div>
            <div className="hero-teams">
              <span className={next.home.isUs ? 'us' : ''}>{next.home.name}</span>
              <span className="vs">–</span>
              <span className={next.away.isUs ? 'us' : ''}>{next.away.name}</span>
            </div>
            {next.timeKnown ? (
              <Countdown to={next.date} />
            ) : (
              <p className="muted">Saat açıklanmadı</p>
            )}
            <div className="hero-meta">
              {longDay(next.date)}
              {next.timeKnown ? ` · ${time(next.date)}` : ''}
              {next.venue ? ` · ${next.venue}` : ''}
            </div>
          </Link>
        )}
      </section>

      <div className="grid2">
        <section className="card" aria-labelledby="last-h">
          <h2 id="last-h" className="eyebrow">
            Son maç
          </h2>
          {last ? (
            <Link to={matchHref(last)} className="last">
              <div className="last-score">
                <span className={last.home.isUs ? 'us' : ''}>{last.home.short}</span>
                <b>
                  {last.homeScore}–{last.awayScore}
                </b>
                <span className={last.away.isUs ? 'us' : ''}>{last.away.short}</span>
              </div>
              <div className="muted small">
                {last.home.name} – {last.away.name}
              </div>
              <div className="muted small">
                {last.competitionName} · {longDay(last.date)}
              </div>
              {outcome(last) && <span className={`badge o-${outcome(last)}`}>{outcome(last)}</span>}
            </Link>
          ) : (
            fx.data && <p className="empty">Sonuç yok.</p>
          )}
        </section>

        <section className="card" aria-labelledby="rank-h">
          <h2 id="rank-h" className="eyebrow">
            Süper Lig
          </h2>
          {st.error && !st.data && <ErrorBox message={st.error} onRetry={st.reload} />}
          {!st.data && !st.error && <Loading />}
          {usIdx >= 0 && (
            <Link to="/puan" className="rank">
              <div className="rank-big">
                {rows[usIdx].rank}
                <small>.</small>
              </div>
              <div className="muted small">
                {rows[usIdx].points} puan · {rows[usIdx].played} maç
              </div>
              <ol className="mini-table">
                {around.map((r) => (
                  <li key={r.teamId} className={r.isUs ? 'us' : ''}>
                    <span>{r.rank}</span>
                    <span>{r.team}</span>
                    <span>{r.points}</span>
                  </li>
                ))}
              </ol>
            </Link>
          )}
        </section>
      </div>

      <DataNote env={fx.data} />
      <p className="disclaimer">
        Bağımsız taraftar uygulaması. Kulüple bağlantısı yoktur, resmî ürün değildir.
      </p>
    </div>
  );
}
