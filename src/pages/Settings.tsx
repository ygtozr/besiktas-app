import type { CSSProperties } from 'react';
import { Link } from 'react-router';
import { IconCheck } from '../components/Icons';
import { FONTS } from '../settings/fonts';
import {
  SCALE_MAX,
  SCALE_MIN,
  SCALE_STEP,
  resetSettings,
  resolvedFont,
  updateSettings,
  useSettings,
} from '../settings/store';
import { THEMES, themeById } from '../settings/themes';

function previewVars(v: Record<string, string>): CSSProperties {
  return {
    '--p-bg': v['--bg'],
    '--p-surface': v['--surface'],
    '--p-line': v['--line'],
    '--p-accent': v['--accent'],
    '--p-hero-a': v['--hero-a'],
    '--p-hero-b': v['--hero-b'],
  } as CSSProperties;
}

export function Settings() {
  const s = useSettings();
  const activeFont = resolvedFont(s);
  const themeFont = themeById(s.theme).font;
  const pct = Math.round(s.scale * 100);

  return (
    <div className="page">
      <Link to="/" className="back">
        ← Ana sayfa
      </Link>
      <h1 className="page-h">Ayarlar</h1>
      <p className="muted small">Seçimler bu cihazda saklanır.</p>

      <section aria-labelledby="t-h">
        <h2 id="t-h" className="sub-h">
          Tema
        </h2>
        <div className="theme-grid" role="radiogroup" aria-labelledby="t-h">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={s.theme === t.id}
              className="theme-card"
              onClick={() => updateSettings({ theme: t.id })}
            >
              <span className="tc-preview" style={previewVars(t.vars)} aria-hidden="true">
                <span className="tc-hero">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="tc-row">
                  <span />
                  <b />
                </span>
                <span className="tc-row">
                  <span />
                  <span />
                </span>
              </span>
              <span className="tc-name">
                {t.name}
                <small>{t.dark ? 'Koyu' : 'Açık'}</small>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="f-h">
        <h2 id="f-h" className="sub-h">
          Yazı tipi
        </h2>
        <div className="font-list" role="radiogroup" aria-labelledby="f-h">
          <button
            type="button"
            role="radio"
            aria-checked={s.font === 'auto'}
            className="font-opt"
            onClick={() => updateSettings({ font: 'auto' })}
          >
            <span>
              <strong>Temaya göre</strong>
              <small>Şu an: {FONTS.find((f) => f.id === themeFont)?.name}</small>
            </span>
            <span className="check">{s.font === 'auto' && <IconCheck />}</span>
          </button>
          {FONTS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="radio"
              aria-checked={s.font === f.id}
              className="font-opt"
              onClick={() => {
                void f.load();
                updateSettings({ font: f.id });
              }}
              onPointerEnter={() => void f.load()}
            >
              <span>
                <span
                  className="font-sample"
                  style={{
                    fontFamily: f.display,
                    fontWeight: f.displayWeight,
                    textTransform: f.caps ? 'uppercase' : 'none',
                  }}
                >
                  {f.name} · Beşiktaş 3–1
                </span>
                <small>{f.hint}</small>
              </span>
              <span className="check">{s.font === f.id && <IconCheck />}</span>
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="s-h" className="card scale-box">
        <h2 id="s-h" className="sub-h" style={{ margin: 0 }}>
          Yazı boyutu
        </h2>
        <div className="scale-row">
          <button
            type="button"
            className="scale-btn"
            aria-label="Yazıyı küçült"
            disabled={s.scale <= SCALE_MIN}
            onClick={() => updateSettings({ scale: s.scale - SCALE_STEP })}
          >
            A−
          </button>
          <input
            type="range"
            min={SCALE_MIN}
            max={SCALE_MAX}
            step={SCALE_STEP}
            value={s.scale}
            aria-label="Yazı boyutu"
            aria-valuetext={`%${pct}`}
            onChange={(e) => updateSettings({ scale: Number(e.target.value) })}
          />
          <button
            type="button"
            className="scale-btn"
            aria-label="Yazıyı büyüt"
            disabled={s.scale >= SCALE_MAX}
            onClick={() => updateSettings({ scale: s.scale + SCALE_STEP })}
          >
            A+
          </button>
        </div>
        <div className="scale-val">%{pct}</div>
        <p className="muted" style={{ margin: 0 }}>
          Örnek: Beşiktaş, Süper Lig'de {activeFont.name.toLowerCase()} yazı tipiyle böyle görünür.
        </p>
      </section>

      <button type="button" className="btn ghost block" onClick={resetSettings}>
        Varsayılana dön
      </button>
    </div>
  );
}
