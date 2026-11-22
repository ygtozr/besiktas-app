import type { Usage } from '../../shared/types.js';
import { counter, counterSince, dayKey } from '../counter.js';
import { json } from '../http.js';

export async function handleUsage(): Promise<Response> {
  const day = dayKey();
  const body: Usage = {
    day,
    counts: await counter.snapshot(day),
    since: counterSince,
    note: 'Sayaç sunucu belleğinde. Sunucu yeniden başlarsa sıfırlanır. Tam kayıt Vercel loglarında: evt=upstream_request.',
  };
  return json(body, 0);
}
