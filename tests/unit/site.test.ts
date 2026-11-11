import { describe, it, expect } from 'vitest';
import { SITE, WA_MESSAGE, FORM_MESSAGE, whatsappUrl, googleMapsUrl } from '../../src/data/site';
import { dictionaries, LANGS } from '../../src/i18n';
import { LOCALITIES } from '../../src/data/localities';
import { WA_SHOTS } from '../../src/data/waShots';

describe('business facts and WhatsApp links', () => {
  it('uses the confirmed clinic number', () => {
    expect(SITE.whatsappNumber).toBe('972585700051');
    expect(SITE.phoneE164).toBe('+972585700051');
    expect(SITE.email).toBe('laskin.amc@gmail.com');
  });
  it('encodes the language-specific message and never embeds visitor data', () => {
    for (const lang of LANGS) {
      const url = whatsappUrl(WA_MESSAGE[lang]);
      expect(url.startsWith('https://wa.me/972585700051?text=')).toBe(true);
      expect(decodeURIComponent(url)).toContain('La Skin');
      expect(FORM_MESSAGE[lang]).toContain('{name}');
      expect(FORM_MESSAGE[lang]).toContain('{phone}');
    }
  });
  it('map links are built from the address only', () => {
    expect(googleMapsUrl).toContain(encodeURIComponent('מבוא החורש 10, הר אדר'));
  });
});

describe('content completeness', () => {
  it('every language has the same dictionary shape and no placeholder markers', () => {
    const keys = (o: unknown, prefix = ''): string[] =>
      o && typeof o === 'object' && !Array.isArray(o)
        ? Object.entries(o as Record<string, unknown>).flatMap(([k, v]) => keys(v, `${prefix}${k}.`))
        : [prefix];
    const he = keys(dictionaries.he).sort();
    expect(keys(dictionaries.en).sort()).toEqual(he);
    expect(keys(dictionaries.ar).sort()).toEqual(he);
    for (const lang of LANGS) {
      const json = JSON.stringify(dictionaries[lang]);
      expect(json).not.toMatch(/CONTENT_REQUIRED|REVIEW_PENDING|AUTHORITY_REQUIRED|TODO|Lorem/);
      expect(dictionaries[lang].nav).toHaveLength(5);
      expect(dictionaries[lang].faq.items).toHaveLength(5);
    }
  });
  it('the owner-supplied locality list is complete, translated, and has one dedicated page', () => {
    expect(LOCALITIES).toHaveLength(78);
    for (const l of LOCALITIES) { expect(l.he).toBeTruthy(); expect(l.en).toBeTruthy(); expect(l.ar).toBeTruthy(); }
    expect(LOCALITIES.filter((l) => l.page).map((l) => l.page)).toEqual(['mevaseret-zion']);
  });
  it('every WhatsApp screenshot carries a transcript in all three languages', () => {
    expect(WA_SHOTS).toHaveLength(12);
    for (const s of WA_SHOTS) for (const lang of LANGS) expect(s.alt[lang].length).toBeGreaterThan(40);
  });
});
