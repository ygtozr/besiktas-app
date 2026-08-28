import { formatDate, organizationLabels, statusLabels } from "@/lib/format";
import type { Match } from "@/lib/types";
export function MatchCard({
  match,
  compact = false,
}: {
  match: Match;
  compact?: boolean;
}) {
  return (
    <article
      id={`match-${match.id}`}
      className={`card ${match.status === "finished" ? "opacity-75" : ""}`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="eyebrow">
          {organizationLabels[match.organization]}
        </span>
        <span className="chip">{statusLabels[match.status]}</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="muted text-sm">
            {match.home ? "İç saha" : "Deplasman"}
          </p>
          <h3 className="my-1 text-lg font-black">
            {match.home
              ? `Beşiktaş – ${match.opponent}`
              : `${match.opponent} – Beşiktaş`}
          </h3>
          <p className="muted text-sm">
            {formatDate(match.date, match.status !== "tbd")} · {match.venue}
          </p>
        </div>
        {match.score && (
          <strong className="text-3xl">
            {match.score.besiktas}–{match.score.opponent}
          </strong>
        )}
      </div>
      {!compact && (
        <p className="mt-3 text-sm font-semibold">{match.competition}</p>
      )}
    </article>
  );
}
