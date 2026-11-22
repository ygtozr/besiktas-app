import { useEffect, useMemo, useRef, useState } from 'react';
import { nextMatch } from '../../shared/live-window';
import type { Competition, Fixtures as FixturesT, MatchSummary } from '../../shared/types';
import { DataNote } from '../components/DataNote';
import { PageTop } from '../components/PageTop';
import { MatchRow } from '../components/MatchRow';
import { ErrorBox, Loading, Notice } from '../components/States';
import { useApi } from '../lib/api';
import { month } from '../lib/format';
import { useNow } from '../lib/useNow';

type Filter = 'all' | Exclude<Competition, 'other'>;

const FILTERS: { k: Filter; l: string }[] = [
  { k: 'all', l: 'Tümü' },
  { k: 'superlig', l: 'Süper Lig' },
  { k: 'cup', l: 'Kupa' },
  { k: 'europe', l: 'Avrupa' },
];

const KEY = 'fikstur-filtre';

function readFilter(): Filter {
  try {
    const v = localStorage.getItem(KEY) as Filter | null;
    return v && FILTERS.some((f) => f.k === v) ? v : 'all';
  } catch {
    return 'all';
  }
}

export function Fixtures() {
  const { data, error, reload } = useApi<FixturesT>('/api/fixtures');
  const [filter, setFilter] = useState<Filter>(readFilter);
  const scrolled = useRef(false);
  const now = useNow(60_000);

  const list = useMemo(
    () => (data?.data.matches ?? []).filter((m) => filter === 'all' || m.competition === filter),
    [data, filter],
  );
  const nextId = nextMatch(list, now)?.id;

  const groups = useMemo(() => {
    const g: { label: string; items: MatchSummary[] }[] = [];
    for (const m of list) {
      const label = month(m.date);
      if (g.at(-1)?.label !== label) g.push({ label, items: [] });
      g.at(-1)!.items.push(m);
    }
    return g;
  }, [list]);

  // ilk açılışta sıradaki maça kaydır
  useEffect(() => {
    if (scrolled.current || !nextId) return;
    scrolled.current = true;
    document.getElementById(`m-${nextId}`)?.scrollIntoView({ block: 'center' });
  }, [nextId]);

  const choose = (f: Filter) => {
    setFilter(f);
    try {
      localStorage.setItem(KEY, f);
    } catch {
      /* gizli sekme: önemli değil */
    }
  };

  return (
    <div className="page">
      <PageTop>Fikstür</PageTop>
      <div className="chips" role="group" aria-label="Turnuva filtresi">
        {FILTERS.map((f) => (
          <button
            key={f.k}
            type="button"
            className={`chip ${filter === f.k ? 'on' : ''}`}
            aria-pressed={filter === f.k}
            onClick={() => choose(f.k)}
          >
            {f.l}
          </button>
        ))}
      </div>

      {(filter === 'cup' || filter === 'all') &&
        data?.data.notices.map((n) => <Notice key={n}>{n}</Notice>)}

      {error && !data && <ErrorBox message={error} onRetry={reload} />}
      {!data && !error && <Loading />}
      {data && list.length === 0 && <p className="empty">Bu filtrede maç yok.</p>}

      {groups.map((g) => (
        <section key={g.label} className="month">
          <h2 className="month-h">{g.label}</h2>
          {g.items.map((m) => (
            <MatchRow key={m.id} m={m} id={`m-${m.id}`} />
          ))}
        </section>
      ))}
      <DataNote env={data} />
    </div>
  );
}
