import { useState } from 'react';
import type { StandingsLeague, Standings as StandingsT } from '../../shared/types';
import { DataNote } from '../components/DataNote';
import { PageTop } from '../components/PageTop';
import { ErrorBox, Loading } from '../components/States';
import { useApi } from '../lib/api';

const LEAGUES: { k: StandingsLeague; l: string; q: string }[] = [
  { k: 'superlig', l: 'Süper Lig', q: '' },
  { k: 'europe', l: 'Avrupa', q: '?lig=avrupa' },
];

const KEY = 'puan-lig';

function readLeague(): StandingsLeague {
  try {
    return localStorage.getItem(KEY) === 'europe' ? 'europe' : 'superlig';
  } catch {
    return 'superlig';
  }
}

export function Standings() {
  const [league, setLeague] = useState<StandingsLeague>(readLeague);
  const q = LEAGUES.find((x) => x.k === league)!.q;
  const { data, error, reload } = useApi<StandingsT>(`/api/standings${q}`);
  const rows = data?.data.rows ?? [];
  // bölge açıklaması: tablodaki sırayla, tekrarsız
  const zones = [...new Map(rows.filter((r) => r.zone).map((r) => [r.zone!, r.zoneKind ?? 'mid']))];

  const choose = (k: StandingsLeague) => {
    setLeague(k);
    try {
      localStorage.setItem(KEY, k);
    } catch {
      /* önemli değil */
    }
  };

  return (
    <div className="page">
      <PageTop>Puan durumu</PageTop>
      <div className="seg" role="tablist" aria-label="Lig seç">
        {LEAGUES.map((x) => (
          <button
            key={x.k}
            role="tab"
            aria-selected={league === x.k}
            className={league === x.k ? 'on' : ''}
            onClick={() => choose(x.k)}
          >
            {x.l}
          </button>
        ))}
      </div>
      {data && <p className="muted small">{data.data.season}</p>}
      {error && !data && <ErrorBox message={error} onRetry={reload} />}
      {!data && !error && <Loading />}
      {rows.length > 0 && (
        <div className="tbl-wrap">
          <table className="tbl standings">
            <thead>
              <tr>
                <th scope="col" className="num">
                  #
                </th>
                <th scope="col">Takım</th>
                <th scope="col" className="num" title="Oynanan">
                  O
                </th>
                <th scope="col" className="num" title="Galibiyet">
                  G
                </th>
                <th scope="col" className="num" title="Beraberlik">
                  B
                </th>
                <th scope="col" className="num" title="Mağlubiyet">
                  M
                </th>
                <th scope="col" className="num" title="Averaj">
                  Av
                </th>
                <th scope="col" className="num" title="Puan">
                  P
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.teamId}
                  className={`${r.isUs ? 'us' : ''} ${r.zoneKind ? `z-${r.zoneKind}` : ''}`}
                  title={r.zone}
                >
                  <td className="num">{r.rank}</td>
                  <td className="team">{r.team}</td>
                  <td className="num">{r.played}</td>
                  <td className="num">{r.won}</td>
                  <td className="num">{r.drawn}</td>
                  <td className="num">{r.lost}</td>
                  <td className="num">{r.gd > 0 ? `+${r.gd}` : r.gd}</td>
                  <td className="num strong">{r.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {zones.length > 0 && (
        <ul className="legend">
          {zones.map(([z, kind]) => (
            <li key={z} className={`z-${kind}`}>
              {z}
            </li>
          ))}
        </ul>
      )}
      <DataNote env={data} />
    </div>
  );
}
