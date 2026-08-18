/* Justin Kong - portfolio. Three small behaviours, no dependencies.
   The entrance animation is CSS-only on purpose, so no content is ever
   dependent on this file having run. */

/* --- Mobile menu ---------------------------------------------------------- */

(function initMenu() {
  const toggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('primary-nav');
  if (!toggle || !nav) return;

  function setOpen(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (toggle.getAttribute('aria-expanded') !== 'true') return;
    setOpen(false);
    toggle.focus();
  });
})();

/* --- Active nav link + header border -------------------------------------- */

(function initScrollState() {
  const header = document.getElementById('header');
  const links = Array.from(document.querySelectorAll('.navbar a[href^="#"]'));

  const sections = links
    .map((link) => ({ link, section: document.getElementById(link.hash.slice(1)) }))
    .filter((pair) => pair.section);

  function update() {
    if (header) header.classList.toggle('is-stuck', window.scrollY > 8);
    if (!sections.length) return;

    // Whichever section has crossed a third of the viewport most recently wins.
    const probe = window.scrollY + window.innerHeight / 3;
    let current = sections[0];
    sections.forEach((pair) => {
      if (pair.section.offsetTop <= probe) current = pair;
    });

    const atBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atBottom) current = sections[sections.length - 1];

    links.forEach((link) => link.classList.toggle('is-active', link === current.link));
  }

  let queued = false;
  window.addEventListener(
    'scroll',
    () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        update();
        queued = false;
      });
    },
    { passive: true }
  );

  update();
})();

/* --- Copy email ----------------------------------------------------------- */
/* The address is also plain selectable text in the markup, so a clipboard
   failure degrades to "select it yourself" rather than a dead button. */

(function initCopyEmail() {
  const btn = document.getElementById('copy-email');
  const status = document.getElementById('copy-status');
  if (!btn) return;

  const email = btn.dataset.email;
  let resetTimer;

  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(email);
      btn.classList.add('is-copied');
      btn.querySelector('.copy-label').textContent = 'Copied';
      if (status) status.textContent = `${email} copied to your clipboard.`;
    } catch (err) {
      if (status) status.textContent = `Copy blocked by your browser - the address above is ${email}.`;
      return;
    }

    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      btn.classList.remove('is-copied');
      btn.querySelector('.copy-label').textContent = 'Copy';
      if (status) status.textContent = '';
    }, 2500);
  });
})();
