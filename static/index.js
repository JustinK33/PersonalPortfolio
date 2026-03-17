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
    return;
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
}

(async function initAnimations() {
  try {
    await loadScript('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js');
    await loadScript('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js');
    initGsapReveal();
  } catch (err) {
    initRevealFallback();
  }
})();

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
