import { DataStatus } from "@/components/data-status";
import { getFootballData } from "@/lib/data";
import { displayValue, formatDate } from "@/lib/format";
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
      <div className="mt-8 space-y-8">
        {groups.map((group) => (
          <section key={group}>
            <h2>{group === "Kaleci" ? "Kaleciler" : group}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.players
                .filter((p) => p.position === group)
                .map((player) => (
                  <PlayerCard key={player.id} player={player} />
                ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
function PlayerCard({ player }: { player: Player }) {
  return (
    <details className="card group">
      <summary className="cursor-pointer list-none">
        <div className="mb-4 grid aspect-[16/8] place-items-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
          <span
            className="text-4xl font-black text-zinc-400"
            aria-label="Oyuncu fotoğrafı bulunamadı"
          >
            {player.number}
          </span>
        </div>
        <p className="eyebrow">{player.position}</p>
        <h3 className="my-1 text-xl font-black">{player.name}</h3>
        <p className="muted text-sm">
          #{player.number} · {player.nationality}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <span className="chip">{displayValue(player.appearances)} maç</span>
          <span className="chip">{displayValue(player.minutes)} dakika</span>
        </div>
        <span className="mt-4 block text-sm font-bold group-open:hidden">
          Detayı aç +
        </span>
      </summary>
      <div className="mt-5 border-t border-[var(--line)] pt-4 text-sm">
        <p>Doğum: {formatDate(player.birthDate, false)}</p>
        <p>İlk 11: {displayValue(player.starts)}</p>
        <p>
          Gol / asist: {displayValue(player.goals)} /{" "}
          {displayValue(player.assists)}
        </p>
      </div>
    </details>
  );
}
