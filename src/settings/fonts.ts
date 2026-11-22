// Yazı tipleri. Seçilmeyen font indirilmez (dinamik import).

export interface FontDef {
  id: string;
  name: string;
  hint: string;
  display: string;
  body: string;
  /** başlık stili */
  caps: boolean;
  displayWeight: number;
  load: () => Promise<unknown>;
}

const all = (...p: Promise<unknown>[]) => Promise.all(p);

export const FONTS: FontDef[] = [
  {
    id: 'inter',
    name: 'Modern',
    hint: 'Inter · sade, okunaklı',
    display: "'Inter', system-ui, sans-serif",
    body: "'Inter', system-ui, sans-serif",
    caps: false,
    displayWeight: 700,
    load: () =>
      all(
        import('@fontsource/inter/latin-400.css'),
        import('@fontsource/inter/latin-ext-400.css'),
        import('@fontsource/inter/latin-600.css'),
        import('@fontsource/inter/latin-ext-600.css'),
        import('@fontsource/inter/latin-700.css'),
        import('@fontsource/inter/latin-ext-700.css'),
      ),
  },
  {
    id: 'barlow',
    name: 'Spor',
    hint: 'Barlow Condensed + Inter · stadyum tabelası',
    display: "'Barlow Condensed', 'Arial Narrow', sans-serif",
    body: "'Inter', system-ui, sans-serif",
    caps: true,
    displayWeight: 800,
    load: () =>
      all(
        import('@fontsource/barlow-condensed/latin-600.css'),
        import('@fontsource/barlow-condensed/latin-ext-600.css'),
        import('@fontsource/barlow-condensed/latin-800.css'),
        import('@fontsource/barlow-condensed/latin-ext-800.css'),
        import('@fontsource/inter/latin-400.css'),
        import('@fontsource/inter/latin-ext-400.css'),
        import('@fontsource/inter/latin-600.css'),
        import('@fontsource/inter/latin-ext-600.css'),
      ),
  },
  {
    id: 'manrope',
    name: 'Yumuşak',
    hint: 'Manrope · yuvarlak hatlı, ferah',
    display: "'Manrope', system-ui, sans-serif",
    body: "'Manrope', system-ui, sans-serif",
    caps: false,
    displayWeight: 800,
    load: () =>
      all(
        import('@fontsource/manrope/latin-400.css'),
        import('@fontsource/manrope/latin-ext-400.css'),
        import('@fontsource/manrope/latin-600.css'),
        import('@fontsource/manrope/latin-ext-600.css'),
        import('@fontsource/manrope/latin-800.css'),
        import('@fontsource/manrope/latin-ext-800.css'),
      ),
  },
  {
    id: 'outfit',
    name: 'Geometrik',
    hint: 'Outfit · temiz, geometrik',
    display: "'Outfit', system-ui, sans-serif",
    body: "'Outfit', system-ui, sans-serif",
    caps: false,
    displayWeight: 700,
    load: () =>
      all(
        import('@fontsource/outfit/latin-400.css'),
        import('@fontsource/outfit/latin-ext-400.css'),
        import('@fontsource/outfit/latin-600.css'),
        import('@fontsource/outfit/latin-ext-600.css'),
        import('@fontsource/outfit/latin-700.css'),
        import('@fontsource/outfit/latin-ext-700.css'),
      ),
  },
  {
    id: 'grotesk',
    name: 'Teknik',
    hint: 'Space Grotesk + DM Sans · keskin, dijital',
    display: "'Space Grotesk', system-ui, sans-serif",
    body: "'DM Sans', system-ui, sans-serif",
    caps: false,
    displayWeight: 700,
    load: () =>
      all(
        import('@fontsource/space-grotesk/latin-600.css'),
        import('@fontsource/space-grotesk/latin-ext-600.css'),
        import('@fontsource/space-grotesk/latin-700.css'),
        import('@fontsource/space-grotesk/latin-ext-700.css'),
        import('@fontsource/dm-sans/latin-400.css'),
        import('@fontsource/dm-sans/latin-ext-400.css'),
        import('@fontsource/dm-sans/latin-600.css'),
        import('@fontsource/dm-sans/latin-ext-600.css'),
      ),
  },
  {
    id: 'rubik',
    name: 'Yuvarlak',
    hint: 'Rubik · samimi, hafif yuvarlak',
    display: "'Rubik', system-ui, sans-serif",
    body: "'Rubik', system-ui, sans-serif",
    caps: false,
    displayWeight: 700,
    load: () =>
      all(
        import('@fontsource/rubik/latin-400.css'),
        import('@fontsource/rubik/latin-ext-400.css'),
        import('@fontsource/rubik/latin-600.css'),
        import('@fontsource/rubik/latin-ext-600.css'),
        import('@fontsource/rubik/latin-700.css'),
        import('@fontsource/rubik/latin-ext-700.css'),
      ),
  },
  {
    id: 'fraunces',
    name: 'Dergi',
    hint: 'Fraunces + Inter · editoryal, zarif',
    display: "'Fraunces', Georgia, serif",
    body: "'Inter', system-ui, sans-serif",
    caps: false,
    displayWeight: 700,
    load: () =>
      all(
        import('@fontsource/fraunces/latin-600.css'),
        import('@fontsource/fraunces/latin-ext-600.css'),
        import('@fontsource/fraunces/latin-700.css'),
        import('@fontsource/fraunces/latin-ext-700.css'),
        import('@fontsource/inter/latin-400.css'),
        import('@fontsource/inter/latin-ext-400.css'),
        import('@fontsource/inter/latin-600.css'),
        import('@fontsource/inter/latin-ext-600.css'),
      ),
  },
];

export const fontById = (id: string) => FONTS.find((f) => f.id === id) ?? FONTS[0];
