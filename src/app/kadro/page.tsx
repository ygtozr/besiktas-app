import { DataStatus } from "@/components/data-status";
import { getFootballData } from "@/lib/data";
import { displayValue } from "@/lib/format";
import type { Player } from "@/lib/types";

const groups: Player["position"][] = [
  "Kaleci",
  "Defans",
  "Orta saha",
  "Forvet",
];
const statColumns = [
  ["appearances", "M", "Maç"],
  ["starts", "11", "İlk 11"],
  ["minutes", "Dk", "Dakika"],
  ["goals", "G", "Gol"],
  ["assists", "A", "Asist"],
  ["yellowCards", "🟨", "Sarı kart"],
  ["redCards", "🟥", "Kırmızı kart"],
] as const;

export default async function Squad() {
  const data = await getFootballData();
  return (
    <main className="shell">
      <p className="eyebrow">2026–27</p>
      <h1>Takım kadrosu</h1>
      <DataStatus updatedAt={data.updatedAt} stale={data.stale} />
      <div className="compact-sections">
        {groups.map((group) => (
          <section key={group}>
            <h2>{group === "Kaleci" ? "Kaleciler" : group}</h2>
            <div className="squad-table-wrap">
              <table className="squad-table">
                <thead>
                  <tr>
                    <th>Oyuncu</th>
                    {statColumns.map(([key, symbol, label]) => (
                      <th key={key} title={label} aria-label={label}>
                        {symbol}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.players
                    .filter((player) => player.position === group)
                    .map((player) => (
                      <tr key={player.id}>
                        <td>
                          <span className="shirt-number">{player.number}</span>
                          <span className="squad-player-name">
                            <strong>{player.name}</strong>
                            <small>{player.nationality}</small>
                          </span>
                        </td>
                        {statColumns.map(([key]) => (
                          <td key={key}>
                            {player[key] === null
                              ? "—"
                              : displayValue(player[key])}
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
