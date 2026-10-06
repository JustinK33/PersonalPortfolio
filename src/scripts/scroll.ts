// One rAF-throttled scroll loop for everything scroll-linked: the progress bar,
// the header's scrolled state, the experience timeline fill, and nav scroll-spy.

import { syncActive } from './nav';

const bar = document.getElementById('scroll-progress-bar');
const header = document.getElementById('header');
const timelines = Array.from(document.querySelectorAll<HTMLElement>('[data-timeline]'));

let queued = false;

function update() {
  queued = false;

  // All layout reads first, then writes, so the frame never forces a synchronous reflow.
  const y = window.scrollY;
  const vh = window.innerHeight;
  const max = document.documentElement.scrollHeight - vh;
  const fills = timelines.map((tl) => {
    const rect = tl.getBoundingClientRect();
    // The fill tracks a reading line 60% down the viewport.
    return Math.min(Math.max((vh * 0.6 - rect.top) / rect.height, 0), 1);
  });
  syncActive();

  bar?.style.setProperty('transform', `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`);
  header?.classList.toggle('is-scrolled', y > 12);
  timelines.forEach((tl, i) => tl.style.setProperty('--fill', fills[i].toFixed(4)));
}

function schedule() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(update);
}

window.addEventListener('scroll', schedule, { passive: true });
window.addEventListener('resize', schedule);
update();
