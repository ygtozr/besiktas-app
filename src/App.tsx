import { BrowserRouter, Route, Routes } from 'react-router';
import { TabBar } from './components/TabBar';
import { Fixtures } from './pages/Fixtures';
import { Home } from './pages/Home';
import { Live } from './pages/Live';
import { Match } from './pages/Match';
import { Settings } from './pages/Settings';
import { Squad } from './pages/Squad';
import { Standings } from './pages/Standings';

export function App() {
  return (
    <BrowserRouter>
      <main className="shell">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/fikstur" element={<Fixtures />} />
          <Route path="/mac/:id" element={<Match />} />
          <Route path="/canli" element={<Live />} />
          <Route path="/kadro" element={<Squad />} />
          <Route path="/puan" element={<Standings />} />
          <Route path="/ayarlar" element={<Settings />} />
          <Route
            path="*"
            element={
              <div className="page">
                <p className="empty">Sayfa yok.</p>
              </div>
            }
          />
        </Routes>
      </main>
      <TabBar />
    </BrowserRouter>
  );
}
