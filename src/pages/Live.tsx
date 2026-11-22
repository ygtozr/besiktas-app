import { useEffect } from 'react';
import { Link } from 'react-router';
import type { LiveState } from '../../shared/types';
import { Countdown } from '../components/Countdown';
import { DataNote } from '../components/DataNote';
import { EventList } from '../components/EventList';
import { ScoreHeader } from '../components/ScoreHeader';
import { StatBars } from '../components/StatBars';
import { ErrorBox, Loading } from '../components/States';
import { useApi, useRefreshOnFocus } from '../lib/api';
import { clock, longDay, time } from '../lib/format';
import { matchHref } from '../lib/result';

export function Live() {
  const { data, error, reload, loading } = useApi<LiveState>('/api/live');
  useRefreshOnFocus(reload);
  const poll = data?.data.pollSeconds ?? null;

  // Sunucu ne derse o: canlıda 2 dk, değilse maç penceresi açılınca.
  useEffect(() => {
    if (poll === null) return;
    const t = setTimeout(() => {
      if (document.visibilityState === 'visible') reload();
    }, poll * 1000);
    return () => clearTimeout(t);
  }, [poll, data, reload]);

  if (error && !data)
    return (
      <div className="page">
        <ErrorBox message={error} onRetry={reload} />
      </div>
    );
  if (!data)
    return (
      <div className="page">
        <Loading />
      </div>
    );
  const s = data.data;

  if (s.detail && s.active) {
    const d = s.detail;
    return (
      <div className="page">
        <h1 className="page-h">
          <span className="live-dot">Canlı</span>
        </h1>
        <ScoreHeader m={d.match} />
        <p className="muted small center">
          Son güncelleme {clock(data.fetchedAt)} ·{' '}
          {poll ? `${Math.round(poll / 60)} dk'da bir yenilenir` : ''}
          {loading ? ' · yenileniyor…' : ''}
        </p>
        <h2 className="sub-h">Olay akışı</h2>
        <EventList events={d.events} newestFirst />
        <h2 className="sub-h">İstatistik</h2>
        <StatBars stats={d.stats} />
        <Link to={matchHref(d.match)} className="btn block">
          Kadrolar ve tüm detay
        </Link>
        <DataNote env={data} />
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page-h">Canlı</h1>
      {s.detail && (
        <>
          <p className="muted">Maç bitti.</p>
          <ScoreHeader m={s.detail.match} />
          <Link to={matchHref(s.detail.match)} className="btn block">
            Maç detayı
          </Link>
        </>
      )}
      {!s.detail && <p className="empty">Şu an canlı maç yok.</p>}
      {s.next && (
        <section className="card hero">
          <h2 className="eyebrow">Sıradaki maç</h2>
          <div className="hero-teams">
            <span className={s.next.home.isUs ? 'us' : ''}>{s.next.home.name}</span>
            <span className="vs">–</span>
            <span className={s.next.away.isUs ? 'us' : ''}>{s.next.away.name}</span>
          </div>
          {s.next.timeKnown && <Countdown to={s.next.date} />}
          <div className="hero-meta">
            {longDay(s.next.date)}
            {s.next.timeKnown ? ` · ${time(s.next.date)}` : ''}
          </div>
        </section>
      )}
      <p className="muted small">Canlı takip maçtan 15 dk önce kendiliğinden açılır.</p>
      <DataNote env={data} />
    </div>
  );
}
