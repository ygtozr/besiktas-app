// Temalar. Her tema renk değişkenleri + önerilen yazı tipi.
// Rakip kulüp renk ikilileri (sarı-lacivert, sarı-kırmızı, bordo-mavi) kullanılmaz.

export interface ThemeDef {
  id: string;
  name: string;
  dark: boolean;
  font: string;
  vars: Record<string, string>;
}

interface Palette {
  bg: string;
  surface: string;
  surface2: string;
  line: string;
  text: string;
  text2: string;
  text3: string;
  accent: string;
  onAccent: string;
  heroA: string;
  heroB: string;
  heroInk: string;
  heroInk2: string;
  us?: string;
  onUs?: string;
  band?: string;
  radius?: string;
  shadow?: string;
}

function theme(id: string, name: string, dark: boolean, font: string, p: Palette): ThemeDef {
  return {
    id,
    name,
    dark,
    font,
    vars: {
      '--bg': p.bg,
      '--surface': p.surface,
      '--surface-2': p.surface2,
      '--line': p.line,
      '--text': p.text,
      '--text-2': p.text2,
      '--text-3': p.text3,
      '--accent': p.accent,
      '--on-accent': p.onAccent,
      '--hero-a': p.heroA,
      '--hero-b': p.heroB,
      '--hero-ink': p.heroInk,
      '--hero-ink-2': p.heroInk2,
      '--us': p.us ?? p.accent,
      '--on-us': p.onUs ?? p.onAccent,
      '--band': p.band ?? 'transparent',
      '--radius': p.radius ?? '18px',
      '--shadow':
        p.shadow ??
        (dark
          ? '0 1px 0 rgba(255,255,255,0.03) inset'
          : '0 1px 2px rgba(20,20,40,0.05), 0 6px 20px rgba(20,20,40,0.06)'),
      '--theme-color': p.bg,
    },
  };
}

export const THEMES: ThemeDef[] = [
  theme('gece', 'Gece Mavisi', true, 'manrope', {
    bg: '#0b1120',
    surface: '#131c2e',
    surface2: '#1b2740',
    line: '#25314a',
    text: '#e5ebf5',
    text2: '#9fadc4',
    text3: '#6f7e98',
    accent: '#8fb4ff',
    onAccent: '#0b1120',
    heroA: '#22345a',
    heroB: '#162540',
    heroInk: '#f1f5ff',
    heroInk2: '#a9b8d6',
  }),
  theme('grafit', 'Grafit', true, 'inter', {
    bg: '#111113',
    surface: '#1c1c1f',
    surface2: '#26262a',
    line: '#2f2f35',
    text: '#ececf1',
    text2: '#a3a3ad',
    text3: '#77777f',
    accent: '#d4d4dc',
    onAccent: '#111113',
    heroA: '#2e2e35',
    heroB: '#1f1f23',
    heroInk: '#f4f4f7',
    heroInk2: '#a3a3ad',
    us: '#3a3a44',
    onUs: '#ffffff',
  }),
  theme('okyanus', 'Okyanus', true, 'outfit', {
    bg: '#071a24',
    surface: '#0d2633',
    surface2: '#133243',
    line: '#1b3d50',
    text: '#e0eef4',
    text2: '#97b5c2',
    text3: '#68899b',
    accent: '#5cc8dc',
    onAccent: '#062029',
    heroA: '#11566a',
    heroB: '#0b3242',
    heroInk: '#eafaff',
    heroInk2: '#a7d3df',
  }),
  theme('orman', 'Orman', true, 'grotesk', {
    bg: '#0c1612',
    surface: '#13211b',
    surface2: '#1a2c24',
    line: '#23382e',
    text: '#e3ede7',
    text2: '#9fb6a9',
    text3: '#6f897b',
    accent: '#7fd4a8',
    onAccent: '#0c1612',
    heroA: '#1f4233',
    heroB: '#142a21',
    heroInk: '#effaf4',
    heroInk2: '#a8c9b8',
  }),
  theme('gunbatimi', 'Gün Batımı', true, 'rubik', {
    bg: '#17110e',
    surface: '#221915',
    surface2: '#2d221c',
    line: '#3a2c24',
    text: '#f4e9e1',
    text2: '#c2ac9d',
    text3: '#8f7a6b',
    accent: '#f2a65a',
    onAccent: '#1a120d',
    heroA: '#5e3522',
    heroB: '#2e1e16',
    heroInk: '#fff3ea',
    heroInk2: '#e2c2ab',
  }),
  theme('neon', 'Neon Gece', true, 'grotesk', {
    bg: '#0b0b14',
    surface: '#141423',
    surface2: '#1c1c30',
    line: '#29294a',
    text: '#e8e8ff',
    text2: '#a3a3cc',
    text3: '#72729c',
    accent: '#93a2ff',
    onAccent: '#0b0b14',
    heroA: '#3d3190',
    heroB: '#1b1942',
    heroInk: '#f4f3ff',
    heroInk2: '#bcb7f0',
    shadow: '0 0 0 1px rgba(147,162,255,0.06), 0 8px 30px rgba(80,90,255,0.08)',
  }),
  theme('klasik', 'Klasik', true, 'barlow', {
    bg: '#101012',
    surface: '#1a1a1d',
    surface2: '#242428',
    line: '#2f2f34',
    text: '#eeeeef',
    text2: '#a6a6ae',
    text3: '#77777f',
    accent: '#eeeeef',
    onAccent: '#101012',
    heroA: '#e9e9ec',
    heroB: '#cfcfd4',
    heroInk: '#141416',
    heroInk2: '#55555c',
    band: 'repeating-linear-gradient(90deg, #d8d8dc 0 10px, #101012 10px 20px)',
    radius: '14px',
  }),
  theme('bulut', 'Bulut', false, 'inter', {
    bg: '#eef0f4',
    surface: '#ffffff',
    surface2: '#f4f5f8',
    line: '#e1e4ea',
    text: '#1d2330',
    text2: '#5b6475',
    text3: '#8a92a3',
    accent: '#2b3445',
    onAccent: '#ffffff',
    heroA: '#2b3445',
    heroB: '#46516a',
    heroInk: '#f8fafc',
    heroInk2: '#c7d0de',
  }),
  theme('kum', 'Kum', false, 'manrope', {
    bg: '#f4efe6',
    surface: '#fffcf6',
    surface2: '#f8f3ea',
    line: '#e6ddcf',
    text: '#2b2722',
    text2: '#6b6258',
    text3: '#9a9083',
    accent: '#4a453e',
    onAccent: '#fffcf6',
    heroA: '#4a453e',
    heroB: '#6a6359',
    heroInk: '#fffaf2',
    heroInk2: '#ddd3c5',
  }),
  theme('lavanta', 'Lavanta', false, 'outfit', {
    bg: '#f3f1fa',
    surface: '#ffffff',
    surface2: '#f7f5fd',
    line: '#e4e0f2',
    text: '#262140',
    text2: '#635c82',
    text3: '#948db1',
    accent: '#6c5ce7',
    onAccent: '#ffffff',
    heroA: '#6c5ce7',
    heroB: '#9483f7',
    heroInk: '#ffffff',
    heroInk2: '#e4dfff',
  }),
  theme('nane', 'Nane', false, 'rubik', {
    bg: '#edf6f2',
    surface: '#ffffff',
    surface2: '#f4faf7',
    line: '#d9e9e1',
    text: '#1b2b25',
    text2: '#557067',
    text3: '#86a097',
    accent: '#23896a',
    onAccent: '#ffffff',
    heroA: '#1f7a5e',
    heroB: '#33a382',
    heroInk: '#ffffff',
    heroInk2: '#cdf0e2',
  }),
  theme('kagit', 'Kâğıt', false, 'fraunces', {
    bg: '#faf8f3',
    surface: '#ffffff',
    surface2: '#f5f2eb',
    line: '#e8e2d6',
    text: '#1f1d1a',
    text2: '#5e5a52',
    text3: '#8f897d',
    accent: '#2f4a6d',
    onAccent: '#ffffff',
    heroA: '#2a2825',
    heroB: '#45413b',
    heroInk: '#faf8f3',
    heroInk2: '#cbc3b5',
    us: '#2a2825',
    onUs: '#faf8f3',
  }),
];

export const DEFAULT_THEME = 'gece';

export const themeById = (id: string) =>
  THEMES.find((t) => t.id === id) ?? THEMES.find((t) => t.id === DEFAULT_THEME)!;
