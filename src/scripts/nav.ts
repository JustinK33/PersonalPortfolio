// Primary nav: scroll-spy, the sliding indicator, and the mobile menu.

const header = document.getElementById('header');
const nav = document.getElementById('primary-nav');
const toggle = document.getElementById('menu-toggle');
const indicator = nav?.querySelector<HTMLElement>('.nav-indicator');
const links = Array.from(nav?.querySelectorAll<HTMLAnchorElement>('a[href^="#"]') ?? []);
const sections = links
  .map((link) => ({ link, section: document.getElementById(link.hash.slice(1)) }))
  .filter((pair): pair is { link: HTMLAnchorElement; section: HTMLElement } => pair.section !== null);

let active: HTMLAnchorElement | null = null;

function moveIndicator(link: HTMLAnchorElement | null) {
  if (!indicator) return;
  if (!link) {
    indicator.style.setProperty('--o', '0');
    return;
  }
  indicator.style.setProperty('--x', `${link.offsetLeft}px`);
  indicator.style.setProperty('--w', String(link.offsetWidth / 100));
  indicator.style.setProperty('--o', '1');
}

/** Called from the shared scroll loop (scripts/scroll.ts). */
export function syncActive() {
  // Whichever section has crossed a third of the viewport most recently wins;
  // nothing is active while the hero is on screen.
  const probe = window.scrollY + window.innerHeight / 3;
  let current: HTMLAnchorElement | null = null;
  for (const { link, section } of sections) if (section.offsetTop <= probe) current = link;

  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
  if (atBottom && sections.length) current = sections[sections.length - 1].link;

  if (current === active) return;
  active = current;
  // Indicator first: it reads offsets, which must happen before the attribute writes.
  if (!nav?.matches(':hover')) moveIndicator(active);
  links.forEach((link) => (link === current ? link.setAttribute('aria-current', 'true') : link.removeAttribute('aria-current')));
}

links.forEach((link) => link.addEventListener('pointerenter', () => moveIndicator(link)));
nav?.addEventListener('pointerleave', () => moveIndicator(active));
window.addEventListener('resize', () => moveIndicator(active));
document.fonts?.ready.then(() => moveIndicator(active));

// --- Mobile menu ---

function setOpen(open: boolean) {
  nav?.classList.toggle('is-open', open);
  toggle?.setAttribute('aria-expanded', String(open));
  toggle?.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}

toggle?.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
nav?.addEventListener('click', (e) => {
  if ((e.target as Element).closest('a')) setOpen(false);
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' || toggle?.getAttribute('aria-expanded') !== 'true') return;
  setOpen(false);
  toggle.focus();
});
document.addEventListener('click', (e) => {
  if (toggle?.getAttribute('aria-expanded') === 'true' && !header?.contains(e.target as Node)) setOpen(false);
});
