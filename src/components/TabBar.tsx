import { NavLink } from 'react-router';

const TABS = [
  { to: '/', label: 'Ana', end: true },
  { to: '/fikstur', label: 'Fikstür' },
  { to: '/canli', label: 'Canlı' },
  { to: '/kadro', label: 'Kadro' },
  { to: '/puan', label: 'Puan' },
];

export function TabBar() {
  return (
    <nav className="tabbar" aria-label="Ana menü">
      {TABS.map((t) => (
        <NavLink key={t.to} to={t.to} end={t.end} className="tab">
          {t.label}
        </NavLink>
      ))}
    </nav>
  );
}
