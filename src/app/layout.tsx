import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/navigation";

export const metadata: Metadata = {
  title: { default: "Beşiktaş App", template: "%s · Beşiktaş App" },
  description: "Beşiktaş futbol takımına odaklanan bağımsız taraftar projesi.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr">
      <body className="min-h-full">
        <Navigation />
        {children}
        <footer className="border-t border-[var(--line)] bg-[var(--surface)] py-8">
          <div className="shell text-sm text-[var(--muted)]">
            <strong className="text-[var(--text)]">
              Bağımsız taraftar projesidir.
            </strong>{" "}
            Beşiktaş Jimnastik Kulübü’nün resmî uygulaması değildir.
          </div>
        </footer>
      </body>
    </html>
  );
}
