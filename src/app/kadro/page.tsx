import { DataStatus } from "@/components/data-status";
import { getFootballData } from "@/lib/data";
import { displayValue } from "@/lib/format";
import type { Player } from "@/lib/types";
import Image from "next/image";

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

const flags: Record<string, string> = {
  Türkiye: "flag-tr",
  Brezilya: "flag-br",
  Portekiz: "flag-pt",
};

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
            <div className="squad-table-wrap">
              <table className="squad-table">
                <caption className="sr-only">{group} oyuncuları</caption>
                <thead>
                  <tr>
                    <th>{group === "Kaleci" ? "Kaleciler" : group}</th>
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
                          <span className="player-photo-wrap">
                            <Image
                              className="player-photo"
                              src={player.photoUrl ?? "/player-placeholder.svg"}
                              width={32}
                              height={32}
                              alt={`${player.name} oyuncu fotoğrafı`}
                            />
                            <span className="number-badge">
                              {player.number}
                            </span>
                          </span>
                          <span className="squad-player-name">
                            <strong>{player.name}</strong>
                            <small>
                              <span
                                className={`country-flag ${flags[player.nationality] ?? "flag-world"}`}
                                aria-label={`${player.nationality} bayrağı`}
                              />
                              {player.nationality}
                            </small>
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
