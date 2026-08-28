"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="shell">
      <div className="card">
        <p className="eyebrow">Bir sorun oluştu</p>
        <h1>Veriler yüklenemedi.</h1>
        <p className="muted">
          Bir süre sonra yeniden deneyin. Varsa son başarılı veri otomatik
          olarak gösterilir.
        </p>
        <button className="chip chip-active mt-4" onClick={reset}>
          Yeniden dene
        </button>
      </div>
    </main>
  );
}
