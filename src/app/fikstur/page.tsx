import { DataStatus } from "@/components/data-status";
import { FixtureList } from "@/components/fixture-list";
import { PageTabs } from "@/components/page-tabs";
import { StandingsTable } from "@/components/standings-table";
import { getFootballData } from "@/lib/data";
import type { Organization } from "@/lib/types";

export default async function Fixtures({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = await searchParams;
  const organization = query.organizasyon ?? "tumu";
  const view = query.gorunum ?? "fikstur";
  const data = await getFootballData();
  const filtered =
    organization === "tumu"
      ? data.matches
      : data.matches.filter((m) => m.organization === organization);
  const tabs: [string, string][] = [
    ["tumu", "Tümü"],
    ["lig", "Lig"],
    ["avrupa", "Avrupa"],
    ["kupa", "Türkiye Kupası"],
  ];
  const nearest = filtered.find(
    (match) => match.status === "scheduled" || match.status === "tbd",
  );
  return (
    <main className="shell">
      <p className="eyebrow">2026–27</p>
      <h1>Sezon fikstürü</h1>
      <DataStatus updatedAt={data.updatedAt} stale={data.stale} />
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <PageTabs
          items={tabs}
          active={organization}
          param="organizasyon"
          rest={{ sezon: "2026-27" }}
        />
        <label className="text-sm font-bold">
          Sezon{" "}
          <select className="ml-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-2">
            <option>2026–27</option>
            <option>2025–26</option>
          </select>
        </label>
      </div>
      {nearest && view === "fikstur" && (
        <a className="chip mb-5" href={`#match-${nearest.id}`}>
          En yakın gelecek maça git ↓
        </a>
      )}
      {organization !== "tumu" && (
        <PageTabs
          items={[
            ["fikstur", "Fikstür"],
            ["tablo", "Tablo / Eşleşmeler"],
          ]}
          active={view}
          param="gorunum"
          rest={{ organizasyon: organization, sezon: "2026-27" }}
        />
      )}
      {view === "tablo" && organization !== "tumu" ? (
        <OrganizationView organization={organization as Organization} />
      ) : (
        <FixtureList matches={filtered} />
      )}
    </main>
  );
}

async function OrganizationView({
  organization,
}: {
  organization: Organization;
}) {
  const data = await getFootballData();
  if (organization === "lig")
    return (
      <section>
        <h2>Süper Lig puan durumu</h2>
        <StandingsTable rows={data.standings} />
      </section>
    );
  const title =
    organization === "avrupa"
      ? "UEFA Avrupa Ligi eşleşmeleri"
      : "Türkiye Kupası eşleşmeleri";
  return (
    <section>
      <h2>{title}</h2>
      <FixtureList
        matches={data.matches.filter((m) => m.organization === organization)}
      />
      <p className="muted mt-4 text-sm">
        Demo veri setinde mevcut organizasyon formatına uygun tur bazlı eşleşme
        listesi gösterilmektedir.
      </p>
    </section>
  );
}
