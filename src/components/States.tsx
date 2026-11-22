export function Loading({ label = 'Yükleniyor' }: { label?: string }) {
  return (
    <div className="state" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      {label}…
    </div>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="state error" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn" onClick={onRetry}>
          Tekrar dene
        </button>
      )}
    </div>
  );
}

export function Notice({ children }: { children: React.ReactNode }) {
  return <p className="notice">{children}</p>;
}
