import Link from "next/link";
export function PageTabs({
  items,
  active,
  param,
  rest = {},
}: {
  items: [string, string][];
  active: string;
  param: string;
  rest?: Record<string, string>;
}) {
  return (
    <div className="page-tabs" role="tablist" aria-label="Görünüm seçimi">
      {items.map(([value, label]) => (
        <Link
          role="tab"
          aria-selected={active === value}
          className={`chip ${active === value ? "chip-active" : ""}`}
          key={value}
          href={{ query: { ...rest, [param]: value } }}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
