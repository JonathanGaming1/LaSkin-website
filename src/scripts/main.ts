/**
 * La Skin — client behaviour (no framework, ~4 KB).
 *  - analytics abstraction (window.dataLayer, no PII, no message content)
 *  - WhatsApp deep links: desktop browsers go straight to web.whatsapp.com
 *  - accessibility menu (text size, contrast, link highlight, readable font, stop animations)
 *  - mobile menu (aria-expanded, Escape, focus management)
 *  - FAQ accordion (aria-expanded/aria-controls, arrow-key navigation)
 *  - screenshot strip prev/next
 *  - lead form: accessible validation, opens WhatsApp with the details, 20 s duplicate lock
 */

type Payload = Record<string, string | number | boolean | undefined>;
declare global { interface Window { dataLayer?: Payload[] } }

const body = document.body;
const LANG = body.dataset.lang ?? 'he';
const ROUTE = body.dataset.route ?? 'home';
const RTL = document.documentElement.dir === 'rtl';

/* ---------- Analytics abstraction (provider-neutral; nothing is sent anywhere by default) ---------- */
function track(event: string, params: Payload = {}): void {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, lang: LANG, route: ROUTE, ts: Date.now(), ...params });
}
(function pageView() {
  const q = new URLSearchParams(location.search);
  let referrer = '';
  try { referrer = document.referrer ? new URL(document.referrer).hostname : ''; } catch { /* ignore */ }
  track('page_view', {
    locality: ROUTE === 'locality' ? 'mevaseret-zion' : undefined,
    referrer,
    utm_source: q.get('utm_source') ?? undefined,
    utm_medium: q.get('utm_medium') ?? undefined,
    utm_campaign: q.get('utm_campaign') ?? undefined,
  });
})();

document.addEventListener('click', (e) => {
  const el = (e.target as Element).closest<HTMLElement>('[data-track]');
  if (!el) return;
  const { track: event, placement, target, to } = el.dataset;
  if (!event) return;
  if (event === 'language_change') { if (to === LANG) return; track(event, { from: LANG, to }); return; }
  track(event, { placement, target, locality_slug: ROUTE === 'locality' ? 'mevaseret-zion' : undefined });
});

/* ---------- WhatsApp links: wa.me redirects through api.whatsapp.com, which some desktop networks block ---------- */
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
if (!isMobile) {
  document.querySelectorAll<HTMLAnchorElement>('a[data-wa]').forEach((a) => {
    try {
      const u = new URL(a.href);
      if (u.hostname !== 'wa.me') return;
      const phone = u.pathname.replace('/', '');
      const text = u.searchParams.get('text') ?? '';
      a.href = `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`;
    } catch { /* keep original */ }
  });
}

/* ---------- Accessibility menu (classes on <html>; the choice is kept in localStorage on this device only) ---------- */
(function a11yMenu() {
  const root = document.documentElement;
  const KEY = 'laskin-a11y';
  const SIZES = [100, 110, 120, 135];
  const TOGGLES = ['contrast', 'links', 'font', 'motion'] as const;
  type State = { size: number } & Record<(typeof TOGGLES)[number], boolean>;
  const blank = (): State => ({ size: 0, contrast: false, links: false, font: false, motion: false });
  let state = blank();
  try { state = { ...state, ...(JSON.parse(localStorage.getItem(KEY) || '{}') as Partial<State>) }; } catch { /* storage unavailable */ }
  if (!(state.size >= 0 && state.size < SIZES.length)) state.size = 0;

  const btn = document.querySelector<HTMLButtonElement>('.a11y__btn');
  const panel = document.getElementById('a11y-panel');
  const level = panel?.querySelector<HTMLElement>('[data-a11y-level]');
  const apply = () => {
    SIZES.forEach((_, i) => { if (i) root.classList.toggle(`a11y-fs-${i}`, state.size === i); });
    TOGGLES.forEach((k) => {
      root.classList.toggle(`a11y-${k}`, state[k]);
      panel?.querySelector(`[data-a11y-toggle="${k}"]`)?.setAttribute('aria-pressed', String(state[k]));
    });
    if (level) level.textContent = `${SIZES[state.size]}%`;
    panel?.querySelector<HTMLButtonElement>('[data-a11y-size="-1"]')?.toggleAttribute('disabled', state.size === 0);
    panel?.querySelector<HTMLButtonElement>('[data-a11y-size="1"]')?.toggleAttribute('disabled', state.size === SIZES.length - 1);
  };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* in-memory only */ } };
  apply();
  if (!btn || !panel) return;

  const setOpen = (open: boolean) => {
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', (open ? btn.dataset.labelClose : btn.dataset.labelOpen) ?? '');
    panel.hidden = !open;
  };
  const isOpen = () => btn.getAttribute('aria-expanded') === 'true';
  btn.addEventListener('click', () => setOpen(!isOpen()));
  panel.addEventListener('click', (e) => {
    const el = (e.target as Element).closest<HTMLElement>('[data-a11y-size], [data-a11y-toggle], [data-a11y-reset]');
    if (!el) return;
    if (el.dataset.a11ySize) {
      state.size = Math.min(SIZES.length - 1, Math.max(0, state.size + Number(el.dataset.a11ySize)));
      apply();
      // A button that just became disabled drops focus; keep focus inside the panel.
      if ((el as HTMLButtonElement).disabled) panel.querySelector<HTMLElement>('[data-a11y-size]:not([disabled])')?.focus();
    } else if (el.dataset.a11yToggle) {
      const k = el.dataset.a11yToggle as (typeof TOGGLES)[number];
      state[k] = !state[k];
      apply();
    } else {
      state = blank();
      apply();
    }
    save();
    track('a11y_menu', { option: el.dataset.a11yToggle ?? (el.dataset.a11ySize ? 'text_size' : 'reset') });
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen()) { setOpen(false); btn.focus(); } });
  document.addEventListener('click', (e) => { if (isOpen() && !(e.target as Element).closest('.a11y')) setOpen(false); });
})();

/* ---------- Mobile menu ---------- */
const burger = document.querySelector<HTMLButtonElement>('.burger');
const menu = document.getElementById('mobile-menu');
if (burger && menu) {
  const setOpen = (open: boolean) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', (open ? burger.dataset.labelClose : burger.dataset.labelOpen) ?? '');
    menu.hidden = !open;
    menu.classList.toggle('is-open', open);
  };
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') !== 'true';
    setOpen(open);
    if (open) menu.querySelector<HTMLElement>('a')?.focus();
  });
  menu.addEventListener('click', (e) => { if ((e.target as Element).closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') { setOpen(false); burger.focus(); }
  });
  document.addEventListener('click', (e) => {
    if (burger.getAttribute('aria-expanded') !== 'true') return;
    if (!(e.target as Element).closest('.header')) setOpen(false);
  });
}

/* ---------- FAQ accordion ---------- */
const faqButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('.faq__btn'));
faqButtons.forEach((btn, i) => {
  const panel = document.getElementById(btn.getAttribute('aria-controls') ?? '');
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    faqButtons.forEach((b) => {
      const p = document.getElementById(b.getAttribute('aria-controls') ?? '');
      b.setAttribute('aria-expanded', 'false');
      if (p) p.hidden = true;
    });
    if (!expanded) { btn.setAttribute('aria-expanded', 'true'); if (panel) panel.hidden = false; }
  });
  btn.addEventListener('keydown', (e) => {
    const n = faqButtons.length;
    let next: number | null = null;
    if (e.key === 'ArrowDown') next = (i + 1) % n;
    else if (e.key === 'ArrowUp') next = (i - 1 + n) % n;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = n - 1;
    if (next !== null) { e.preventDefault(); faqButtons[next].focus(); }
  });
});

/* ---------- Screenshot strip ---------- */
const trackEl = document.getElementById('wa-strip');
if (trackEl) {
  const step = 260;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scroll = (dir: 1 | -1) => trackEl.scrollBy({ left: (RTL ? -dir : dir) * step, behavior: reduce ? 'auto' : 'smooth' });
  document.querySelector('[data-strip-prev]')?.addEventListener('click', () => scroll(-1));
  document.querySelector('[data-strip-next]')?.addEventListener('click', () => scroll(1));
}

/* ---------- Lead form ---------- */
const form = document.getElementById('lead-form') as HTMLFormElement | null;
if (form) {
  const name = form.querySelector<HTMLInputElement>('#lead-name')!;
  const phone = form.querySelector<HTMLInputElement>('#lead-phone')!;
  const nameErr = document.getElementById('lead-name-err')!;
  const phoneErr = document.getElementById('lead-phone-err')!;
  const status = document.getElementById('lead-status')!;
  const statusMsg = status.querySelector<HTMLElement>('[data-msg]')!;
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const d = form.dataset;
  /* Duplicate-send protection: after a successful send the button stays locked for a cooldown,
     and the lock survives a page refresh within the same tab (sessionStorage holds only a timestamp). */
  const COOLDOWN_MS = 5 * 60 * 1000;
  const KEY = 'laskin-lead-sent-at';
  let timer: number | undefined;

  const readSentAt = (): number => { try { return Number(sessionStorage.getItem(KEY) || 0); } catch { return 0; } };
  const isLocked = () => Date.now() - readSentAt() < COOLDOWN_MS;
  const unlock = () => { submit.disabled = false; submit.textContent = d.submit ?? ''; };
  const lock = (remaining: number) => {
    submit.disabled = true;
    submit.textContent = d.locked ?? submit.textContent;
    window.clearTimeout(timer);
    timer = window.setTimeout(unlock, remaining);
  };
  const showSent = () => { statusMsg.textContent = d.sent ?? ''; status.hidden = false; };
  if (isLocked()) { showSent(); lock(COOLDOWN_MS - (Date.now() - readSentAt())); }

  const validName = () => name.value.trim().length >= 2;
  const validPhone = () => /^(\+972-?|0)\d{1,2}-?\d{3}-?\d{4}$/.test(phone.value.replace(/[\s().]/g, ''));
  const setError = (input: HTMLInputElement, errEl: HTMLElement, ok: boolean, msg: string) => {
    input.setAttribute('aria-invalid', String(!ok));
    errEl.textContent = ok ? '' : msg;
  };

  name.addEventListener('input', () => { if (name.getAttribute('aria-invalid') === 'true' && validName()) setError(name, nameErr, true, ''); });
  phone.addEventListener('input', () => { if (phone.getAttribute('aria-invalid') === 'true' && validPhone()) setError(phone, phoneErr, true, ''); });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (isLocked()) return;
    const nameOk = validName();
    const phoneOk = validPhone();
    setError(name, nameErr, nameOk, d.errName ?? '');
    setError(phone, phoneErr, phoneOk, d.errPhone ?? '');
    if (!nameOk || !phoneOk) {
      track('form_submit', { status: 'validation_error' });
      (nameOk ? phone : name).focus();
      return;
    }
    const text = (d.waTemplate ?? '').replace('{name}', name.value.trim()).replace('{phone}', phone.value.trim());
    const url = isMobile
      ? `https://wa.me/${d.waNumber}?text=${encodeURIComponent(text)}`
      : `https://web.whatsapp.com/send?phone=${d.waNumber}&text=${encodeURIComponent(text)}`;
    track('form_submit', { status: 'opened_whatsapp' });
    window.open(url, '_blank', 'noopener');
    try { sessionStorage.setItem(KEY, String(Date.now())); } catch { /* storage unavailable: in-memory lock only */ }
    showSent();
    status.focus();
    lock(COOLDOWN_MS);
  });
}

export {};
