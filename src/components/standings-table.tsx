import type { Standing } from "@/lib/types";
export function StandingsTable({ rows }: { rows: Standing[] }) {
  return (
    <div className="table-wrap standings-wrap">
      <table className="standings-table">
        <thead>
          <tr>
            <th>Sıra</th>
            <th>Takım</th>
            <th>O</th>
            <th>G</th>
            <th>B</th>
            <th>M</th>
            <th>AG</th>
            <th>YG</th>
            <th>AV</th>
            <th>P</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.team}
              className={row.team === "Beşiktaş" ? "besiktas-row" : ""}
            >
              <td>{row.position}</td>
              <td className="standing-team">
                <strong>{row.team}</strong>
                <small>
                  {row.won}G · {row.drawn}B · {row.lost}M · {row.goalsFor}-
                  {row.goalsAgainst}
                </small>
              </td>
              <td>{row.played}</td>
              <td>{row.won}</td>
              <td>{row.drawn}</td>
              <td>{row.lost}</td>
              <td>{row.goalsFor}</td>
              <td>{row.goalsAgainst}</td>
              <td>{row.goalsFor - row.goalsAgainst}</td>
              <td>{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
