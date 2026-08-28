import { Countdown } from "@/components/countdown";
import { DataStatus } from "@/components/data-status";
import { MatchCard } from "@/components/match-card";
import { getFootballData, getServerNow } from "@/lib/data";
import { resultLetter } from "@/lib/format";

export default async function Home() {
  const data = await getFootballData();
  const finished = data.matches.filter((m) => m.status === "finished");
  const upcoming = data.matches.filter(
    (m) => m.status === "scheduled" || m.status === "tbd",
  );
  const next = upcoming[0];
  const last = finished.at(-1);
  const form = finished.slice(-5).map(resultLetter);
  const bjk = data.standings.find((row) => row.team === "Beşiktaş")!;
  const leader = data.standings[0];
  return (
    <main className="shell">
      <p className="eyebrow">2026–27 sezon merkezi</p>
      <h1>Siyah beyaz gündem.</h1>
      <DataStatus updatedAt={data.updatedAt} stale={data.stale} />
      <section className="mt-6 grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
        <div className="card next-match-card">
          <h2 className="eyebrow">Sıradaki maç</h2>
          <h3 className="compact-match-title">{next.opponent}</h3>
          <p className="compact-match-meta">
            {next.competition} · {next.home ? "İç saha" : "Deplasman"}
          </p>
          <Countdown target={next.date} serverNow={getServerNow()} />
          <p className="muted mt-5 text-sm">{next.venue}</p>
        </div>
        {last && (
          <div>
            <h2>Son oynanan maç</h2>
            <MatchCard match={last} />
          </div>
        )}
      </section>
      <section className="mt-8 grid-cards">
        <div className="card">
          <p className="eyebrow">Son beş maç</p>
          <div className="my-4 flex gap-2">
            {form.map((value, i) => (
              <span
                key={i}
                className={`grid size-10 place-items-center rounded-full font-black text-white ${value === "G" ? "bg-emerald-600" : value === "B" ? "bg-zinc-500" : "bg-red-600"}`}
              >
                {value}
              </span>
            ))}
          </div>
          <p className="muted text-sm">
            {form.filter((x) => x === "G").length} galibiyet ·{" "}
            {form.filter((x) => x === "B").length} beraberlik ·{" "}
            {form.filter((x) => x === "M").length} mağlubiyet
          </p>
        </div>
        <div className="card">
          <p className="eyebrow">Güncel lig konumu</p>
          <div className="mt-3 flex items-end justify-between">
            <strong className="league-position">{bjk.position}.</strong>
            <div className="text-right">
              <strong className="league-points">{bjk.points} puan</strong>
              <p className="muted">
                {bjk.played} maç · Liderin {leader.points - bjk.points} puan
                gerisinde
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="mt-8">
        <h2>Yaklaşan üç maç</h2>
        <div className="grid-cards">
          {upcoming.slice(0, 3).map((match) => (
            <MatchCard key={match.id} match={match} compact />
          ))}
        </div>
      </section>
    </main>
  );
}
