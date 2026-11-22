import type { Standings as StandingsT } from '../../shared/types';
import { DataNote } from '../components/DataNote';
import { ErrorBox, Loading } from '../components/States';
import { useApi } from '../lib/api';

/** Bölge adı → çizgi stili (renk yok, siyah-beyaz). */
function zoneClass(z?: string): string {
  if (!z) return '';
  const s = z.toLowerCase();
  if (s.includes('champions')) return 'z-cl';
  if (s.includes('europa') || s.includes('conference')) return 'z-el';
  if (s.includes('relegation')) return 'z-rel';
  return 'z-other';
}

const ZONE_TR: Record<string, string> = {
  'z-cl': 'Şampiyonlar Ligi',
  'z-el': 'Avrupa / Konferans Ligi',
  'z-rel': 'Küme düşme',
};

export function Standings() {
  const { data, error, reload } = useApi<StandingsT>('/api/standings');
  const rows = data?.data.rows ?? [];
  const zones = [...new Set(rows.map((r) => zoneClass(r.zone)).filter((z) => z && ZONE_TR[z]))];

  return (
    <div className="page">
      <h1 className="page-h">Puan durumu</h1>
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
                <tr key={r.teamId} className={`${r.isUs ? 'us' : ''} ${zoneClass(r.zone)}`}>
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
          {zones.map((z) => (
            <li key={z} className={z}>
              {ZONE_TR[z]}
            </li>
          ))}
        </ul>
      )}
      <DataNote env={data} />
    </div>
  );
}
