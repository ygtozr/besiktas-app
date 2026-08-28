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
            <div className="squad-list">
              {data.players
                .filter((p) => p.position === group)
                .map((player) => (
                  <PlayerRow key={player.id} player={player} />
                ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
function PlayerRow({ player }: { player: Player }) {
  return (
    <details className="player-row">
      <summary>
        <span className="shirt-number">{player.number}</span>
        <span className="player-identity">
          <strong>{player.name}</strong>
          <small>
            {player.nationality} · {player.position}
          </small>
        </span>
        <span>
          <b>{displayValue(player.appearances)}</b>
          <small>Maç</small>
        </span>
        <span>
          <b>{displayValue(player.minutes)}</b>
          <small>Dk.</small>
        </span>
        <span className="row-toggle" aria-hidden>
          +
        </span>
      </summary>
      <div className="player-detail">
        <span>
          İlk 11 <b>{displayValue(player.starts)}</b>
        </span>
        <span>
          Gol <b>{displayValue(player.goals)}</b>
        </span>
        <span>
          Asist <b>{displayValue(player.assists)}</b>
        </span>
        <span>
          Sarı <b>{displayValue(player.yellowCards)}</b>
        </span>
        <span>
          Kırmızı <b>{displayValue(player.redCards)}</b>
        </span>
      </div>
    </details>
  );
}
