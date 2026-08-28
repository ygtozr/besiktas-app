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
            <th aria-label="Atılan gol">A</th>
            <th aria-label="Yenilen gol">Y</th>
            <th aria-label="Averaj">Av</th>
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
