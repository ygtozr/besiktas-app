// Ayarlar: tema, yazı tipi, yazı boyutu. Bu cihazda saklanır (localStorage).
import { useSyncExternalStore } from 'react';
import { fontById } from './fonts';
import { DEFAULT_THEME, themeById } from './themes';

export interface Settings {
  theme: string;
  /** 'auto' = temanın önerdiği yazı tipi */
  font: string;
  /** 0.85 – 1.4 */
  scale: number;
}

export const SCALE_MIN = 0.85;
export const SCALE_MAX = 1.4;
export const SCALE_STEP = 0.05;

const KEY = 'ayarlar-v1';
const DEFAULTS: Settings = { theme: DEFAULT_THEME, font: 'auto', scale: 1 };

function read(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const v = JSON.parse(raw) as Partial<Settings>;
    return {
      theme: typeof v.theme === 'string' ? v.theme : DEFAULTS.theme,
      font: typeof v.font === 'string' ? v.font : DEFAULTS.font,
      scale: clampScale(Number(v.scale) || 1),
    };
  } catch {
    return DEFAULTS;
  }
}

export function clampScale(n: number): number {
  const r = Math.round(n / SCALE_STEP) * SCALE_STEP;
  return Math.min(SCALE_MAX, Math.max(SCALE_MIN, Number(r.toFixed(2))));
}

let current = read();
const listeners = new Set<() => void>();

export function getSettings(): Settings {
  return current;
}

export function updateSettings(patch: Partial<Settings>): void {
  current = { ...current, ...patch, scale: clampScale(patch.scale ?? current.scale) };
  try {
    localStorage.setItem(KEY, JSON.stringify(current));
  } catch {
    /* gizli sekme: yalnız bu oturum */
  }
  applySettings(current);
  listeners.forEach((l) => l());
}

export function resetSettings(): void {
  updateSettings(DEFAULTS);
}

export function useSettings(): Settings {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getSettings,
    getSettings,
  );
}

export function resolvedFont(s: Settings) {
  return fontById(s.font === 'auto' ? themeById(s.theme).font : s.font);
}

/** Temayı ve yazıyı sayfaya uygula. */
export function applySettings(s: Settings = current): void {
  const root = document.documentElement;
  const t = themeById(s.theme);
  for (const [k, v] of Object.entries(t.vars)) root.style.setProperty(k, v);
  const f = resolvedFont(s);
  root.style.setProperty('--font-display', f.display);
  root.style.setProperty('--font-body', f.body);
  root.style.setProperty('--display-weight', String(f.displayWeight));
  root.style.setProperty('--display-case', f.caps ? 'uppercase' : 'none');
  root.style.setProperty('--display-track', f.caps ? '0.01em' : '-0.02em');
  root.style.setProperty('--scale', String(s.scale));
  root.style.colorScheme = t.dark ? 'dark' : 'light';
  root.dataset.theme = t.id;
  void f.load();
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', t.vars['--theme-color']);
}
