function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve();
        return;
      }
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function initRevealFallback() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      } else {
        entry.target.classList.remove('show');
      }
    });
  });

  const hiddenElements = document.querySelectorAll('.hidden');
  hiddenElements.forEach((el) => observer.observe(el));
}

function initGsapReveal() {
  const hiddenElements = Array.from(document.querySelectorAll('.hidden'));
  if (
    !hiddenElements.length ||
    typeof window.gsap === 'undefined' ||
    typeof window.ScrollTrigger === 'undefined'
  ) {
    return false;
  }

  window.gsap.registerPlugin(window.ScrollTrigger);

  // In GSAP mode, avoid pinning visible state via CSS class so reverse works.
  hiddenElements.forEach((el) => el.classList.remove('show'));

  // Keep fixed navbar/header visible immediately.
  const header = document.getElementById('header');
  if (header && header.classList.contains('hidden')) {
    window.gsap.set(header, { autoAlpha: 1, x: 0, filter: 'blur(0px)' });
  }

  const sectionMap = new Map();
  hiddenElements.forEach((el) => {
    if (el.id === 'header') return;

    const section = el.closest('section') || el.closest('header') || el.closest('footer') || document.body;
    if (!sectionMap.has(section)) {
      sectionMap.set(section, []);
    }
    sectionMap.get(section).push(el);
  });

  sectionMap.forEach((elements, section) => {
    const normalElements = elements.filter((el) => !el.classList.contains('slow-reveal'));
    const slowElements = elements.filter((el) => el.classList.contains('slow-reveal'));

    if (normalElements.length) {
      window.gsap.fromTo(
        normalElements,
        {
          autoAlpha: 0,
          x: (i) => (normalElements[i].classList.contains('slide-right') ? 56 : -56),
          filter: 'blur(5px)'
        },
        {
          autoAlpha: 1,
          x: 0,
          filter: 'blur(0px)',
          duration: 0.22,
          ease: 'power2.out',
          stagger: 0.03,
          overwrite: true,
          scrollTrigger: {
            trigger: section,
            start: 'top 95%',
            end: 'bottom 15%',
            toggleActions: 'play reverse play reverse'
          }
        }
      );
    }

    if (slowElements.length) {
      window.gsap.fromTo(
        slowElements,
        {
          autoAlpha: 0,
          x: (i) => (slowElements[i].classList.contains('slide-right') ? 64 : -64),
          filter: 'blur(6px)'
        },
        {
          autoAlpha: 1,
          x: 0,
          filter: 'blur(0px)',
          duration: 0.3,
          ease: 'power2.out',
          stagger: 0.04,
          overwrite: true,
          scrollTrigger: {
            trigger: section,
            start: 'top 95%',
            end: 'bottom 15%',
            toggleActions: 'play reverse play reverse'
          }
        }
      );
    }
  });

  return true;
}

function revealAllHiddenImmediately() {
  const hiddenElements = document.querySelectorAll('.hidden');
  hiddenElements.forEach((el) => el.classList.add('show'));
}

function initNavbarIndicator() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const navLinks = Array.from(navbar.querySelectorAll('a[href^="#"], a[href*="#"]'));
  if (!navLinks.length) return;

  const indicator = document.createElement('span');
  indicator.className = 'nav-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  indicator.style.position = 'absolute';
  indicator.style.left = '0';
  indicator.style.bottom = '0';
  indicator.style.width = '0';
  indicator.style.pointerEvents = 'none';
  navbar.appendChild(indicator);

  function moveIndicatorTo(link) {
    if (!link) return;
    const navRect = navbar.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const left = linkRect.left - navRect.left;
    indicator.style.width = `${linkRect.width}px`;
    indicator.style.transform = `translateX(${left}px)`;
    navbar.dataset.indicatorReady = 'true';
  }

  function getSectionForLink(link) {
    const href = link.getAttribute('href') || '';
    const hashIndex = href.indexOf('#');
    if (hashIndex === -1) return null;
    const id = href.slice(hashIndex + 1);
    if (!id) return null;
    return document.getElementById(id);
  }

  function setActiveLink(link) {
    navLinks.forEach((item) => item.classList.remove('is-active'));
    if (link) {
      link.classList.add('is-active');
      moveIndicatorTo(link);
    }
  }

  const sectionToLink = new Map();
  navLinks.forEach((link) => {
    const section = getSectionForLink(link);
    if (section) sectionToLink.set(section, link);

    link.addEventListener('mouseenter', () => moveIndicatorTo(link));
    link.addEventListener('focus', () => moveIndicatorTo(link));
    link.addEventListener('click', () => setActiveLink(link));
  });

  navbar.addEventListener('mouseleave', () => {
    const active = navbar.querySelector('a.is-active') || navLinks[0];
    moveIndicatorTo(active);
  });

  const sections = Array.from(sectionToLink.keys());

  function updateActiveFromScroll() {
    if (!sections.length) return;
    const probe = window.scrollY + window.innerHeight * 0.35;
    let current = sections[0];
    for (const section of sections) {
      if (section.offsetTop <= probe) current = section;
    }
    const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (nearBottom) current = sections[sections.length - 1];
    const activeLink = sectionToLink.get(current);
    if (activeLink && !activeLink.classList.contains('is-active')) {
      setActiveLink(activeLink);
    }
  }

  let scrollScheduled = false;
  window.addEventListener('scroll', () => {
    if (scrollScheduled) return;
    scrollScheduled = true;
    requestAnimationFrame(() => {
      updateActiveFromScroll();
      scrollScheduled = false;
    });
  }, { passive: true });

  const initialActive = navbar.querySelector('a.is-active') || navLinks[0];
  setActiveLink(initialActive);
  updateActiveFromScroll();

  window.addEventListener('resize', () => {
    const active = navbar.querySelector('a.is-active') || navLinks[0];
    moveIndicatorTo(active);
  });
}

function initHeroParallax() {
  const heroImage = document.querySelector('.home-img img');
  const homeSection = document.getElementById('home');
  if (!heroImage || !homeSection) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = window.matchMedia('(min-width: 1025px)').matches;
  if (prefersReducedMotion || !isDesktop) return;

  homeSection.addEventListener('mousemove', (e) => {
    const rect = homeSection.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    heroImage.style.transform = `translate3d(${x * 18}px, ${y * 14}px, 0) scale(1.015)`;
  });

  homeSection.addEventListener('mouseleave', () => {
    heroImage.style.transform = 'translate3d(0, 0, 0) scale(1)';
  });
}

(async function initAnimations() {
  // Failsafe: if external animation scripts are blocked/slow, keep content visible.
  const revealTimeout = window.setTimeout(() => {
    const unrevealed = document.querySelectorAll('.hidden:not(.show)');
    if (unrevealed.length) {
      revealAllHiddenImmediately();
    }
  }, 1800);

  try {
    await loadScript('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js');
    await loadScript('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js');
    const gsapReady = initGsapReveal();
    if (!gsapReady) {
      initRevealFallback();
    }
  } catch (err) {
    initRevealFallback();
  } finally {
    window.clearTimeout(revealTimeout);
  }
})();

initNavbarIndicator();
initHeroParallax();

/* === Contact form submit handler === */
(function(){
  const form = document.getElementById('contact-form');
  if (!form) return;

  const statusEl = document.getElementById('form-status');
  const submitBtn = document.getElementById('contact-submit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      phone: form.elements.phone.value.trim(),
      subject: form.elements.subject.value.trim(),
      message: form.elements.message.value.trim(),
      _gotcha: form.elements._gotcha.value.trim()
    };

    if (!data.name || !data.email || !data.subject || !data.message) {
      statusEl.textContent = 'Please fill out name, email, subject, and message.';
      return;
    }

    statusEl.textContent = 'Sending...';
    submitBtn.disabled = true;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'same-origin'
      });

      if (res.ok) {
        form.reset();
        statusEl.textContent = 'Thanks! Your message was sent.';
      } else {
        const err = await res.json().catch(() => ({}));
        statusEl.textContent = err?.error?.message || 'Could not send your message.';
      }
    } catch (err) {
      statusEl.textContent = 'Network error—please try again.';
    } finally {
      submitBtn.disabled = false;
    }
  });
})();

const btn = document.getElementById('menu-icon');
const nav = document.querySelector('.navbar');
if (btn && nav) {
  btn.addEventListener('click', () => nav.classList.toggle('active'));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('active')));
}

/* === Not Shipped Yet Modal === */
(function(){
  const modal = document.getElementById('not-shipped-modal');
  const reviewBtns = document.querySelectorAll('.review-project-btn');
  const closeBtn = document.querySelector('.modal-close');

  if (!modal) return;

  // Open modal when clicking review project buttons
  reviewBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.style.display = 'flex';
    });
  });

  // Close modal when clicking X
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
})();
