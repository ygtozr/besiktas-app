import type { Envelope } from '../../shared/types';
import { ago } from '../lib/format';

/** Verinin nereden ve ne zaman geldiği. Gecikme ve demo durumunu gizlemez. */
export function DataNote({ env, extra }: { env?: Envelope<unknown>; extra?: string }) {
  if (!env) return null;
  return (
    <div className="datanote">
      {env.demo && <span className="flag">Demo veri</span>}
      {env.stale && (
        <span className="flag" role="status">
          Gecikmiş veri: kaynağa ulaşılamadı, son kopya gösteriliyor
        </span>
      )}
      <span>
        Kaynak: {env.source} · {ago(env.fetchedAt)} güncellendi
        {extra ? ` · ${extra}` : ''}
      </span>
    </div>
  );
}
