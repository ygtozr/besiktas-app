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
  const won = games.filter((m) => resultLetter(m) === "G").length,
    drawn = games.filter((m) => resultLetter(m) === "B").length,
    lost = games.filter((m) => resultLetter(m) === "M").length;
  const gf = games.reduce((s, m) => s + (m.score?.besiktas ?? 0), 0),
    ga = games.reduce((s, m) => s + (m.score?.opponent ?? 0), 0);
  const stats = [
    ["Oynanan maç", games.length],
    ["Galibiyet", won],
    ["Beraberlik", drawn],
    ["Mağlubiyet", lost],
    ["Atılan gol", gf],
    ["Yenilen gol", ga],
    ["Gol averajı", gf - ga],
    ["Maç başına puan", ((won * 3 + drawn) / games.length).toFixed(2)],
  ];
  return (
    <>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value]) => (
          <div className="card" key={label}>
            <p className="eyebrow">{label}</p>
            <strong className="stat-value">{value}</strong>
          </div>
        ))}
      </section>
      <section className="mt-6 grid-cards">
        <div className="card">
          <h2>İç saha performansı</h2>
          <p className="compact-highlight">%75 puan oranı</p>
          <p className="muted mt-2">3 galibiyet · 1 beraberlik</p>
        </div>
        <div className="card">
          <h2>Deplasman performansı</h2>
          <p className="compact-highlight">%58 puan oranı</p>
          <p className="muted mt-2">
            2 galibiyet · 1 beraberlik · 1 mağlubiyet
          </p>
        </div>
      </section>
    </>
  );
}
