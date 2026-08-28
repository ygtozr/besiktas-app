import { formatDate } from "@/lib/format";
export function DataStatus({
  updatedAt,
  stale,
}: {
  updatedAt: string;
  stale: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="chip border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
        Demo veri · 28 Ağustos anlık görüntüsü
      </span>
      {stale && <span className="chip">Canlı kaynak kullanılamadı</span>}
      <span className="muted">Son güncelleme: {formatDate(updatedAt)}</span>
    </div>
  );
}
