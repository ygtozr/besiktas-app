import type { EventKind, MatchEvent } from '../../shared/types';

const ICON: Record<EventKind, string> = {
  goal: '⚽',
  'own-goal': '⚽',
  penalty: '⚽',
  yellow: '',
  red: '',
  sub: '⇄',
  other: '·',
};

const LABEL: Record<EventKind, string> = {
  goal: 'Gol',
  'own-goal': 'Kendi kalesine',
  penalty: 'Penaltı golü',
  yellow: 'Sarı kart',
  red: 'Kırmızı kart',
  sub: 'Değişiklik',
  other: '',
};

function Icon({ k }: { k: EventKind }) {
  if (k === 'yellow' || k === 'red') return <span className={`card ${k}`} aria-hidden="true" />;
  return <span aria-hidden="true">{ICON[k]}</span>;
}

export function EventList({
  events,
  newestFirst = false,
  unplaced,
  teams,
}: {
  events: MatchEvent[];
  newestFirst?: boolean;
  /** Asisti hangi gole ait olduğu belli olmayanlar */
  unplaced?: { side: 'home' | 'away'; names: string[] }[];
  teams?: { home: string; away: string };
}) {
  if (events.length === 0) return <p className="empty">Henüz olay yok.</p>;
  const list = newestFirst ? [...events].reverse() : events;
  return (
    <>
      <ol className="events">
        {list.map((e, i) => (
          <li key={`${e.order}-${i}`} className={`ev ${e.side} k-${e.kind}`}>
            <span className="ev-min">{e.minute}</span>
            <span className="ev-icon">
              <Icon k={e.kind} />
            </span>
            <span className="ev-text">
              <strong>{e.player ?? LABEL[e.kind]}</strong>
              {e.kind === 'sub' && e.playerOut && <small>çıkan: {e.playerOut}</small>}
              {e.assist && <small className="ev-assist">asist: {e.assist}</small>}
              {e.kind !== 'goal' && e.kind !== 'sub' && <small>{LABEL[e.kind]}</small>}
            </span>
          </li>
        ))}
      </ol>
      {unplaced && unplaced.length > 0 && (
        <p className="notice small">
          <strong>Asist yapanlar</strong> (hangi gole yapıldığı kaynakta yok):{' '}
          {unplaced.map((u) => `${teams?.[u.side] ?? ''}: ${u.names.join(', ')}`).join(' · ')}
        </p>
      )}
    </>
  );
}
