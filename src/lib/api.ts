import { useCallback, useEffect, useState } from 'react';
import type { Envelope } from '../../shared/types';

// Sayfa değişince son veri anında görünsün. Arkada tazelenir.
const memory = new Map<string, Envelope<unknown>>();

export interface ApiState<T> {
  data?: Envelope<T>;
  error?: string;
  loading: boolean;
  reload: () => void;
}

interface Result<T> {
  path: string;
  tick: number;
  data?: Envelope<T>;
  error?: string;
}

export function useApi<T>(path: string | null): ApiState<T> {
  const [tick, setTick] = useState(0);
  const [res, setRes] = useState<Result<T>>();
  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!path) return;
    const ctrl = new AbortController();
    fetch(path, { signal: ctrl.signal })
      .then(async (r) => {
        const body = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(body?.error ?? `Hata ${r.status}`);
        return body as Envelope<T>;
      })
      .then((env) => {
        memory.set(path, env);
        setRes({ path, tick, data: env });
      })
      .catch((e: unknown) => {
        if (ctrl.signal.aborted) return;
        setRes({ path, tick, error: e instanceof Error ? e.message : 'Bağlantı hatası' });
      });
    return () => ctrl.abort();
  }, [path, tick]);

  const mine = res?.path === path ? res : undefined;
  return {
    data: mine?.data ?? (path ? (memory.get(path) as Envelope<T> | undefined) : undefined),
    error: mine?.error,
    loading: !!path && mine?.tick !== tick,
    reload,
  };
}

/** Sekme görünür olunca yenile. */
export function useRefreshOnFocus(reload: () => void): void {
  useEffect(() => {
    const on = () => {
      if (document.visibilityState === 'visible') reload();
    };
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, [reload]);
}
