export type Lang = 'he' | 'ar' | 'en';
export type Dir = 'rtl' | 'ltr';

export interface MetaText { title: string; desc: string }
export interface QA { q: string; a: string }
export interface Block { h: string; p: string }

export interface Dict {
  code: Lang;
  dir: Dir;
  /** Native language name, used in the language switcher. */
  name: string;
  locale: string; // og:locale
  skip: string;
  meta: {
    home: MetaText; studies: MetaText; areas: MetaText; locality: MetaText;
    privacy: MetaText; accessibility: MetaText; notFound: MetaText;
  };
  a11y: {
    primaryNav: string; footerNav: string; infoNav: string; langGroup: string;
    menuOpen: string; menuClose: string; breadcrumb: string; legalNav: string;
    whatsapp: string; call: string; waStrip: string; waPrev: string; waNext: string;
    stars: string; required: string; formName: string; quickContact: string;
  };
  /** Built-in accessibility menu (display adjustments stored on the visitor's device only). */
  a11yMenu: {
    open: string; close: string; title: string; bigger: string; smaller: string; textSize: string;
    contrast: string; links: string; font: string; motion: string; reset: string;
  };
  alt: {
    logo: string; hero: string; lobby: string; device: string; goggles: string; chairs: string;
    reception: string; logoWall: string; details: string; treatment: string; entrance: string;
  };
  crumb: { home: string };
  cta: { primary: string; short: string; secondary: string };
  hero: { eyebrow: string; title: string; claimLine: string; body: string; fine: string };
  lead: {
    h: string; p: string; nameLabel: string; phoneLabel: string; phoneHint: string;
    errName: string; errPhone: string; submit: string; submitLocked: string; sent: string;
    privacy: string; privacyLink: string; noscript: string;
  };
  pillars: { h: string; sub: string; sub2: string; items: { t: string; b: string }[] };
  welcome: { n: string; h: string };
  tech: { n: string; h: string; painless: string; p1: string; studiesLink: string };
  clinic: { n: string; h: string; p: string };
  midcta: { h: string; p: string };
  care: { beforeK: string; beforeH: string; afterK: string; afterH: string; before: string[]; after: string[] };
  faq: { n: string; h: string; items: QA[] };
  reviews: { n: string; h: string; src: string; waH: string; items: { when: string; title: string; body: string }[] };
  contact: {
    n: string; h: string; addrK: string; addr: string; phoneK: string; mailK: string; hoursK: string;
    d1: string; d2: string; instaK: string; instaCta: string; mapH: string; mapP: string; mapGoogle: string; mapWaze: string;
  };
  areas: { h: string; all: string; crumb: string; indexH: string; indexP: string; note: string; onlyPage: string };
  loc: {
    name: string; eyebrow: string; h: string; intro: string; cta: string; waExtra: string;
    stats: { k: string; v: string; note: string }[];
    directionsH: string; directionsP: string; faqH: string; faq: QA[];
  };
  studies: {
    crumb: string; eyebrow: string; h: string; intro: string; qa: { stat: string; q: string; a: string }[];
    ctaH: string; ctaP: string; ctaBtn: string; sourcesH: string; sourceLink: string; note: string;
  };
  legal: { privacyTab: string; a11yTab: string; updated: string; privacy: Block[]; a11y: Block[] };
  footer: { tagline: string; navK: string; infoK: string; disclaimer: string; facebook: string; instagram: string };
  nav: [string, string, string, string, string];
  notFound: { h: string; p: string; home: string };
}
