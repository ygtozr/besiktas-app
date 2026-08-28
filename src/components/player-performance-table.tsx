"use client";

import { displayValue } from "@/lib/format";
import type { Player } from "@/lib/types";
import { useMemo, useState } from "react";

type SortKey =
  | "appearances"
  | "starts"
  | "minutes"
  | "goals"
  | "assists"
  | "yellowCards"
  | "redCards";
const columns: [SortKey, string][] = [
  ["appearances", "Maç"],
  ["starts", "İlk 11"],
  ["minutes", "Dakika"],
  ["goals", "Gol"],
  ["assists", "Asist"],
  ["yellowCards", "Sarı"],
  ["redCards", "Kırmızı"],
];

export function PlayerPerformanceTable({ players }: { players: Player[] }) {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("Tümü");
  const [sort, setSort] = useState<SortKey>("minutes");
  const rows = useMemo(
    () =>
      players
        .filter(
          (p) =>
            p.name
              .toLocaleLowerCase("tr-TR")
              .includes(name.toLocaleLowerCase("tr-TR")) &&
            (position === "Tümü" || p.position === position),
        )
        .toSorted((a, b) => (b[sort] ?? -1) - (a[sort] ?? -1)),
    [players, name, position, sort],
  );
  return (
    <>
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-bold">
          Oyuncu ara
          <input
            className="mt-1 w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] p-2"
            type="search"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Örn. Rafa"
          />
        </label>
        <label className="text-sm font-bold">
          Pozisyon
          <select
            value={position}
            onChange={(event) => setPosition(event.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] p-2"
          >
            <option>Tümü</option>
            <option>Kaleci</option>
            <option>Defans</option>
            <option>Orta saha</option>
            <option>Forvet</option>
          </select>
        </label>
      </div>
      <div className="table-wrap" tabIndex={0}>
        <table>
          <thead>
            <tr>
              <th>Oyuncu</th>
              <th>Pozisyon</th>
              {columns.map(([key, label]) => (
                <th key={key}>
                  <button
                    className="font-bold underline-offset-4 hover:underline"
                    onClick={() => setSort(key)}
                    aria-pressed={sort === key}
                  >
                    {label}
                    {sort === key ? " ↓" : ""}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td>
                  <strong>{p.name}</strong>
                </td>
                <td>{p.position}</td>
                {columns.map(([key]) => (
                  <td key={key}>{displayValue(p[key])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <p className="card muted mt-3">
          Bu filtrelerle eşleşen oyuncu bulunamadı.
        </p>
      )}
    </>
  );
}
