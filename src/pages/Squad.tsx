import { useMemo, useState } from 'react';
import type { Player, PositionGroup, Squad as SquadT } from '../../shared/types';
import { DataNote } from '../components/DataNote';
import { PageTop } from '../components/PageTop';
import { ErrorBox, Loading } from '../components/States';
import { useApi } from '../lib/api';

const GROUPS: { k: PositionGroup; l: string }[] = [
  { k: 'GK', l: 'Kaleci' },
  { k: 'DF', l: 'Defans' },
  { k: 'MF', l: 'Orta saha' },
  { k: 'FW', l: 'Forvet' },
  { k: '?', l: 'Diğer' },
];

type Sort = 'pos' | 'goals' | 'assists' | 'minutes';
const SORTS: { k: Sort; l: string }[] = [
  { k: 'pos', l: 'Mevki' },
  { k: 'goals', l: 'Gol' },
  { k: 'assists', l: 'Asist' },
  { k: 'minutes', l: 'Dakika' },
];

/** Boş hücre yok: değer yoksa 0. */
function Num({ v, strong = false }: { v: number; strong?: boolean }) {
  const n = Number.isFinite(v) ? v : 0;
  return <td className={`num ${n === 0 ? 'zero' : strong ? 'strong' : ''}`}>{n}</td>;
}

function Table({ players }: { players: Player[] }) {
  return (
    <table className="tbl squad">
      <thead>
        <tr>
          <th scope="col" className="num">
            #
          </th>
          <th scope="col">Oyuncu</th>
          <th scope="col" className="num" title="Maç">
            M
          </th>
          <th scope="col" className="num" title="Dakika">
            Dk
          </th>
          <th scope="col" className="num" title="Gol">
            G
          </th>
          <th scope="col" className="num" title="Asist">
            A
          </th>
        </tr>
      </thead>
      <tbody>
        {players.map((p) => (
          <tr key={p.id}>
            <td className="num muted">{p.number ?? '–'}</td>
            <td>
              <span className="pname">{p.name}</span>
              <span className="muted small">
                {[p.nationality, p.age ? `${p.age} yaş` : undefined].filter(Boolean).join(' · ')}
              </span>
            </td>
            <Num v={p.appearances} />
            <Num v={p.minutes ?? 0} />
            <Num v={p.goals} strong />
            <Num v={p.assists} />
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function Squad() {
  const { data, error, reload } = useApi<SquadT>('/api/squad');
  const [sort, setSort] = useState<Sort>('pos');
  const players = useMemo(() => data?.data.players ?? [], [data]);
  const sorted = useMemo(() => {
    if (sort === 'pos') return players;
    const key = sort;
    return [...players].sort((a, b) => (b[key] ?? 0) - (a[key] ?? 0));
  }, [players, sort]);

  return (
    <div className="page">
      <PageTop>Kadro</PageTop>
      {data && <p className="muted small">{data.data.scope}</p>}
      <div className="chips" role="group" aria-label="Sıralama">
        {SORTS.map((s) => (
          <button
            key={s.k}
            type="button"
            className={`chip ${sort === s.k ? 'on' : ''}`}
            aria-pressed={sort === s.k}
            onClick={() => setSort(s.k)}
          >
            {s.l}
          </button>
        ))}
      </div>
      {error && !data && <ErrorBox message={error} onRetry={reload} />}
      {!data && !error && <Loading label="Kadro ve dakikalar hesaplanıyor" />}
      {sort === 'pos'
        ? GROUPS.map((g) => {
            const list = players.filter((p) => p.position === g.k);
            if (list.length === 0) return null;
            return (
              <section key={g.k}>
                <h2 className="month-h">{g.l}</h2>
                <Table players={list} />
              </section>
            );
          })
        : data && <Table players={sorted} />}
      {data && (
        <DataNote
          env={data}
          extra={`Dakika ${data.data.minutesFromMatches} lig maçından hesaplandı, uzatmalar hariç`}
        />
      )}
    </div>
  );
}
