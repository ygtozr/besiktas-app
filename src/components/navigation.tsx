"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const links = [
  ["/", "Ana Sayfa", "⌂"],
  ["/fikstur", "Fikstür", "▦"],
  ["/kadro", "Kadro", "♟"],
  ["/performans", "Performans", "↗"],
] as const;
export function Navigation() {
  const pathname = usePathname();
  return (
    <>
      <header className="border-b border-[var(--line)] bg-[var(--surface)]">
        <div className="shell flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 font-black">
            <span className="grid size-9 place-items-center rounded-xl bg-zinc-950 text-sm text-white">
              BJK
            </span>
            Beşiktaş App
          </Link>
          <nav className="hidden gap-1 md:flex" aria-label="Ana navigasyon">
            {links.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                aria-current={pathname === href ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-bold ${pathname === href ? "bg-zinc-950 text-white dark:bg-white dark:text-black" : "text-[var(--muted)]"}`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <nav className="mobile-nav md:hidden" aria-label="Mobil navigasyon">
        {links.map(([href, label, icon]) => (
          <Link
            key={href}
            href={href}
            aria-current={pathname === href ? "page" : undefined}
            className={
              pathname === href ? "mobile-nav-link active" : "mobile-nav-link"
            }
          >
            <span aria-hidden>{icon}</span>
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
