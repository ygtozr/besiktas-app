import { NavLink } from 'react-router';
import { IconCalendar, IconHome, IconLive, IconTable, IconUsers } from './Icons';

const TABS = [
  { to: '/', label: 'Ana', end: true, Icon: IconHome },
  { to: '/fikstur', label: 'Fikstür', Icon: IconCalendar },
  { to: '/canli', label: 'Canlı', Icon: IconLive },
  { to: '/kadro', label: 'Kadro', Icon: IconUsers },
  { to: '/puan', label: 'Puan', Icon: IconTable },
];

export function TabBar() {
  return (
    <nav className="tabbar" aria-label="Ana menü">
      {TABS.map(({ to, label, end, Icon }) => (
        <NavLink key={to} to={to} end={end} className="tab">
          <Icon />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
