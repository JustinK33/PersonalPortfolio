// Scroll reveals: each [data-reveal] / [data-reveal-stagger] gets .is-in once, then is
// forgotten. Styles live in styles/motion.css and only apply under html.js.

const targets = document.querySelectorAll<HTMLElement>('[data-reveal], [data-reveal-stagger]');

document.querySelectorAll<HTMLElement>('[data-reveal-stagger]').forEach((group) => {
  Array.from(group.children).forEach((child, i) => (child as HTMLElement).style.setProperty('--i', String(i)));
});

if (!('IntersectionObserver' in window)) {
  targets.forEach((el) => el.classList.add('is-in'));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    },
    // Threshold 0 so elements taller than the viewport still trigger.
    { rootMargin: '0px 0px -8% 0px', threshold: 0 },
  );
  targets.forEach((el) => io.observe(el));
}

export {};
