export default function Loading() {
  return (
    <main className="shell" aria-busy="true">
      <p className="eyebrow">Yükleniyor</p>
      <h1>Maç merkezi hazırlanıyor…</h1>
      <div className="grid-cards">
        {[1, 2, 3, 4].map((x) => (
          <div
            key={x}
            className="card h-40 animate-pulse bg-zinc-200 dark:bg-zinc-800"
          />
        ))}
      </div>
    </main>
  );
}
