// İngilizce ülke adı → Türkçe. ICU (Intl.DisplayNames) kullanır, elle liste tutmaz.

const ALIAS: Record<string, string> = {
  Turkey: 'TR',
  'Ivory Coast': 'CI',
  "Cote d'Ivoire": 'CI',
  USA: 'US',
  'United States': 'US',
  'Republic of Ireland': 'IE',
  'DR Congo': 'CD',
  'Congo DR': 'CD',
  'Bosnia-Herzegovina': 'BA',
  'Bosnia and Herzegovina': 'BA',
  'Cape Verde': 'CV',
  'Cape Verde Islands': 'CV',
  Curacao: 'CW',
  'Korea Republic': 'KR',
  'Czech Republic': 'CZ',
  Macedonia: 'MK',
  Swaziland: 'SZ',
};

// Birleşik Krallık ülkeleri ISO kodu değil: elle.
const FIXED: Record<string, string> = {
  England: 'İngiltere',
  Scotland: 'İskoçya',
  Wales: 'Galler',
  'Northern Ireland': 'Kuzey İrlanda',
};

// ICU'nun Türkçe adı yaygın kullanımdan farklıysa.
const TR_NAME: Record<string, string> = { CI: 'Fildişi Sahili' };

let byName: Map<string, string> | undefined;

function table(): Map<string, string> {
  if (byName) return byName;
  byName = new Map();
  const en = new Intl.DisplayNames(['en'], { type: 'region' });
  for (let a = 65; a < 91; a++) {
    for (let b = 65; b < 91; b++) {
      const code = String.fromCharCode(a, b);
      let name: string | undefined;
      try {
        name = en.of(code);
      } catch {
        continue;
      }
      // ilk gelen kazanır: eski kodlar (YU, FX, DY) yenisini ezmesin
      if (name && name !== code && !byName.has(name)) byName.set(name, code);
    }
  }
  return byName;
}

export function countryTr(name: string | undefined): string | undefined {
  if (!name) return undefined;
  if (FIXED[name]) return FIXED[name];
  const code = ALIAS[name] ?? table().get(name);
  if (!code) return name;
  if (TR_NAME[code]) return TR_NAME[code];
  try {
    return new Intl.DisplayNames(['tr'], { type: 'region' }).of(code) ?? name;
  } catch {
    return name;
  }
}
