import { Countdown } from "@/components/countdown";
import { DataStatus } from "@/components/data-status";
import { FixtureList } from "@/components/fixture-list";
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
      <section className="home-match-grid">
        <div className="next-match-strip">
          <div className="next-match-topline">
            <div>
              <h2 className="eyebrow">Sıradaki maç</h2>
              <span className="next-competition">{next.competition}</span>
              <strong>{next.home ? "İç saha" : "Deplasman"}</strong>
            </div>
            <Countdown target={next.date} serverNow={getServerNow()} />
          </div>
          <div className="next-match-teams">
            <span className={next.home ? "active-team" : ""}>
              {next.home ? "Beşiktaş" : next.opponent}
            </span>
            <b>—</b>
            <span className={!next.home ? "active-team" : ""}>
              {next.home ? next.opponent : "Beşiktaş"}
            </span>
          </div>
          <p className="next-match-venue">{next.venue}</p>
        </div>
        {last && (
          <section>
            <h2>Son oynanan maç</h2>
            <FixtureList matches={[last]} />
          </section>
        )}
      </section>
      <section className="home-summary-grid">
        <div className="summary-strip">
          <p className="eyebrow">Son beş maç</p>
          <div className="form-line">
            {form.map((value, i) => (
              <span
                key={i}
                className={`form-dot ${value === "G" ? "form-win" : value === "B" ? "form-draw" : "form-loss"}`}
              >
                {value}
              </span>
            ))}
            <span className="muted form-summary">
              {form.filter((x) => x === "G").length}G ·{" "}
              {form.filter((x) => x === "B").length}B ·{" "}
              {form.filter((x) => x === "M").length}M
            </span>
          </div>
        </div>
        <div className="summary-strip league-summary">
          <p className="eyebrow">Güncel lig konumu</p>
          <div>
            <strong className="league-position">{bjk.position}.</strong>
            <div>
              <strong className="league-points">{bjk.points} puan</strong>
              <span className="muted">
                {bjk.played} maç · Liderden {leader.points - bjk.points} puan
                geride
              </span>
            </div>
          </div>
        </div>
      </section>
      <section className="home-upcoming">
        <h2>Yaklaşan üç maç</h2>
        <FixtureList matches={upcoming.slice(0, 3)} />
      </section>
    </main>
  );
}
