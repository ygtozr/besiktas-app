import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import type { MatchDetail } from '../../shared/types';
import { DataNote } from '../components/DataNote';
import { EventList } from '../components/EventList';
import { Lineups } from '../components/Lineups';
import { ScoreHeader } from '../components/ScoreHeader';
import { StatBars } from '../components/StatBars';
import { ErrorBox, Loading } from '../components/States';
import { useApi } from '../lib/api';

type Tab = 'events' | 'lineups' | 'stats';

export function Match() {
  const { id = '' } = useParams();
  const [qs] = useSearchParams();
  const league = qs.get('l') ?? 'all';
  const { data, error, reload } = useApi<MatchDetail>(
    `/api/match?id=${encodeURIComponent(id)}&league=${encodeURIComponent(league)}`,
  );
  const [tab, setTab] = useState<Tab>('events');

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
  const d = data.data;

  return (
    <div className="page">
      <Link to="/fikstur" className="back">
        ← Fikstür
      </Link>
      <ScoreHeader m={d.match} />
      {d.match.state === 'in' && (
        <Link to="/canli" className="live-banner">
          <span className="live-dot">Canlı</span> Otomatik yenilenen takip →
        </Link>
      )}
      <div className="seg" role="tablist" aria-label="Maç bölümleri">
        {(
          [
            ['events', 'Olaylar'],
            ['lineups', 'Kadrolar'],
            ['stats', 'İstatistik'],
          ] as const
        ).map(([k, l]) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            className={tab === k ? 'on' : ''}
            onClick={() => setTab(k)}
          >
            {l}
          </button>
        ))}
      </div>
      <div role="tabpanel">
        {tab === 'events' &&
          (d.match.state === 'pre' ? (
            <p className="empty">Maç başlamadı.</p>
          ) : (
            <EventList events={d.events} />
          ))}
        {tab === 'lineups' && <Lineups m={d.match} home={d.lineups.home} away={d.lineups.away} />}
        {tab === 'stats' && <StatBars stats={d.stats} />}
      </div>
      <DataNote env={data} />
    </div>
  );
}
