import { statusLabels } from "@/lib/format";
import type { Match } from "@/lib/types";

const zone = "Europe/Istanbul";

function dateParts(value: string) {
  const date = new Date(value);
  return {
    day: new Intl.DateTimeFormat("tr-TR", {
      timeZone: zone,
      day: "2-digit",
      month: "2-digit",
    }).format(date),
    time: new Intl.DateTimeFormat("tr-TR", {
      timeZone: zone,
      hour: "2-digit",
      minute: "2-digit",
    }).format(date),
  };
}

function matchCenter(match: Match, time: string) {
  if (match.score) {
    const home = match.home ? match.score.besiktas : match.score.opponent;
    const away = match.home ? match.score.opponent : match.score.besiktas;
    return `${home} - ${away}`;
  }
  if (match.status === "tbd") return "-:-";
  if (match.status === "postponed") return "ERT";
  if (match.status === "cancelled") return "İPT";
  return time;
}

export function FixtureList({ matches }: { matches: Match[] }) {
  if (!matches.length)
    return <p className="empty-state">Bu filtrede maç bulunamadı.</p>;

  const competitions = Map.groupBy(matches, (match) => match.competition);

  return (
    <div className="fixture-groups">
      {Array.from(competitions).map(([competition, items]) => (
        <section className="fixture-panel" key={competition}>
          <h2 className="fixture-heading">{competition}</h2>
          <div className="fixture-rows">
            {items.map((match) => {
              const { day, time } = dateParts(match.date);
              const home = match.home ? "Beşiktaş" : match.opponent;
              const away = match.home ? match.opponent : "Beşiktaş";
              const result = match.score
                ? match.score.besiktas > match.score.opponent
                  ? "win"
                  : match.score.besiktas < match.score.opponent
                    ? "loss"
                    : "draw"
                : "upcoming";
              return (
                <article
                  className="fixture-row"
                  id={`match-${match.id}`}
                  key={match.id}
                  title={`${match.venue} · ${statusLabels[match.status]}`}
                >
                  <time dateTime={match.date}>{day}</time>
                  <span className={match.home ? "team team-besiktas" : "team"}>
                    {home}
                  </span>
                  <strong className="fixture-score">
                    {matchCenter(match, time)}
                  </strong>
                  <span className={!match.home ? "team team-besiktas" : "team"}>
                    {away}
                  </span>
                  <span
                    className={`result-mark result-${result}`}
                    aria-label={statusLabels[match.status]}
                  >
                    {result === "win"
                      ? "✓"
                      : result === "loss"
                        ? "×"
                        : result === "draw"
                          ? "–"
                          : ""}
                  </span>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
