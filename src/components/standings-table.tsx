import type { Standing } from "@/lib/types";
export function StandingsTable({ rows }: { rows: Standing[] }) {
  return (
    <div
      className="table-wrap"
      tabIndex={0}
      aria-label="Puan tablosu, yatay kaydırılabilir"
    >
      <table>
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
              <td>{row.team}</td>
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
