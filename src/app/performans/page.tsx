import { DataStatus } from "@/components/data-status";
import { PageTabs } from "@/components/page-tabs";
import { PlayerPerformanceTable } from "@/components/player-performance-table";
import { getFootballData } from "@/lib/data";
import { resultLetter } from "@/lib/format";
import type { FootballData } from "@/lib/types";

export default async function Performance({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = await searchParams;
  const view = query.gorunum ?? "takim";
  const data = await getFootballData();
  return (
    <main className="shell">
      <p className="eyebrow">2026–27</p>
      <h1>Performans paneli</h1>
      <DataStatus updatedAt={data.updatedAt} stale={data.stale} />
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <PageTabs
          items={[
            ["takim", "Takım"],
            ["oyuncular", "Oyuncular"],
          ]}
          active={view}
          param="gorunum"
          rest={{ sezon: "2026-27", organizasyon: "tumu" }}
        />
        <div className="flex gap-2">
          <select
            aria-label="Sezon"
            className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-2"
          >
            <option>2026–27</option>
          </select>
          <select
            aria-label="Organizasyon"
            className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-2"
          >
            <option>Tümü</option>
            <option>Lig</option>
            <option>Avrupa</option>
            <option>Türkiye Kupası</option>
          </select>
        </div>
      </div>
      {view === "oyuncular" ? (
        <PlayerPerformanceTable players={data.players} />
      ) : (
        <TeamPerformance data={data} />
      )}
    </main>
  );
}
function TeamPerformance({ data }: { data: FootballData }) {
  const games = data.matches.filter((m) => m.score);
  const rows = [
    summarize("Genel", games),
    summarize(
      "İç saha",
      games.filter((match) => match.home),
    ),
    summarize(
      "Deplasman",
      games.filter((match) => !match.home),
    ),
  ];
  return (
    <section className="team-performance-wrap">
      <table className="team-performance-table">
        <thead>
          <tr>
            <th>Kapsam</th>
            <th>O</th>
            <th>G</th>
            <th>B</th>
            <th>M</th>
            <th>A</th>
            <th>Y</th>
            <th>Av</th>
            <th>MP</th>
            <th>Form</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td>
                <strong>{row.label}</strong>
              </td>
              <td>{row.played}</td>
              <td>{row.won}</td>
              <td>{row.drawn}</td>
              <td>{row.lost}</td>
              <td>{row.gf}</td>
              <td>{row.ga}</td>
              <td>{row.gf - row.ga}</td>
              <td>{row.ppg}</td>
              <td>
                <span className="table-form">{row.form.join(" ") || "—"}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function summarize(label: string, games: FootballData["matches"]) {
  const won = games.filter((match) => resultLetter(match) === "G").length;
  const drawn = games.filter((match) => resultLetter(match) === "B").length;
  const lost = games.filter((match) => resultLetter(match) === "M").length;
  const gf = games.reduce(
    (sum, match) => sum + (match.score?.besiktas ?? 0),
    0,
  );
  const ga = games.reduce(
    (sum, match) => sum + (match.score?.opponent ?? 0),
    0,
  );
  return {
    label,
    played: games.length,
    won,
    drawn,
    lost,
    gf,
    ga,
    ppg: games.length ? ((won * 3 + drawn) / games.length).toFixed(2) : "—",
    form: games.slice(-5).map(resultLetter),
  };
}
