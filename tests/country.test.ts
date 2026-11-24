import { describe, expect, it } from 'vitest';
import { countryTr } from '../server/country-tr';

describe('ülke adı', () => {
  it.each([
    ['Germany', 'Almanya'],
    ['Türkiye', 'Türkiye'],
    ['Turkey', 'Türkiye'],
    ['Serbia', 'Sırbistan'],
    ['France', 'Fransa'],
    ['Benin', 'Benin'],
    ['Ivory Coast', 'Fildişi Sahili'],
    ['South Korea', 'Güney Kore'],
    ['England', 'İngiltere'],
    ['Netherlands', 'Hollanda'],
  ])('%s → %s', (en, tr) => expect(countryTr(en)).toBe(tr));

  it('bilinmeyen ad olduğu gibi kalır', () => {
    expect(countryTr('Atlantis')).toBe('Atlantis');
    expect(countryTr(undefined)).toBeUndefined();
  });
});
