// Cursor-aware effects. Desktop with a fine pointer only, and never under reduced motion:
//   [data-spotlight]  sets --mx/--my so CSS can draw a radial highlight under the cursor
//   [data-magnetic]   drifts toward the cursor, at most 4px
//   [data-parallax]   hero layers ([data-depth] = max px) follow the cursor, >= 1024px wide

const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (fine && !reduced) {
  document.querySelectorAll<HTMLElement>('[data-spotlight]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  const MAG = 4;
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = ((e.clientX - r.left) / r.width - 0.5) * 2 * MAG;
      const dy = ((e.clientY - r.top) / r.height - 0.5) * 2 * MAG;
      el.style.translate = `${dx.toFixed(2)}px ${dy.toFixed(2)}px`;
    });
    el.addEventListener('pointerleave', () => (el.style.translate = ''));
  });

  const root = document.querySelector<HTMLElement>('[data-parallax]');
  const layers = Array.from(root?.querySelectorAll<HTMLElement>('[data-depth]') ?? []).map((el) => ({
    el,
    depth: Number(el.dataset.depth),
  }));
  const wide = matchMedia('(min-width: 1024px)');

  if (root && layers.length) {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    let running = false;

    const frame = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      for (const { el, depth } of layers) {
        el.style.transform = `translate3d(${(cx * depth).toFixed(2)}px, ${(cy * depth).toFixed(2)}px, 0)`;
      }
      if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) requestAnimationFrame(frame);
      else running = false;
    };

    window.addEventListener('pointermove', (e) => {
      if (!wide.matches || window.scrollY > window.innerHeight) return;
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!running) {
        running = true;
        requestAnimationFrame(frame);
      }
    });
  }
}

export {};
