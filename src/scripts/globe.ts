// Hero network globe: points on a Fibonacci sphere, nearest-neighbour edges, a few lifted
// arcs with travelling pulses. Canvas 2D, batched by depth bucket so a frame is a handful
// of draw calls. Pauses off screen / in background tabs; one static frame for reduced motion.

type Vec = [number, number, number];

const CORAL = '255, 122, 89';
const TILT = -0.38;
const CAMERA = 3.2;
const SPIN = 0.07; // rad/s
const BUCKETS = 5;

const slerp = (a: Vec, b: Vec, t: number): Vec => {
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const om = Math.acos(dot);
  const s = Math.sin(om) || 1;
  const ka = Math.sin((1 - t) * om) / s;
  const kb = Math.sin(t * om) / s;
  return [a[0] * ka + b[0] * kb, a[1] * ka + b[1] * kb, a[2] * ka + b[2] * kb];
};

function buildSphere(n: number) {
  const pts: Vec[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = i * golden;
    pts.push([Math.cos(th) * r, y, Math.sin(th) * r]);
  }

  // ponytail: O(n^2) neighbour search, fine for a few hundred points built once.
  const edges: [number, number][] = [];
  const seen = new Set<number>();
  pts.forEach((p, i) => {
    pts
      .map((q, j) => ({ j, d: (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2 }))
      .filter((o) => o.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 3)
      .forEach(({ j }) => {
        const key = Math.min(i, j) * n + Math.max(i, j);
        if (!seen.has(key)) {
          seen.add(key);
          edges.push([i, j]);
        }
      });
  });

  const hubs = pts.map((_, i) => i).filter((i) => i % 13 === 5);
  const arcs: Vec[][] = [];
  for (let k = 0; k + 1 < hubs.length && arcs.length < 7; k += 2) {
    const a = pts[hubs[k]];
    const b = pts[hubs[(k + 5) % hubs.length]];
    const samples: Vec[] = [];
    for (let s = 0; s <= 28; s++) {
      const t = s / 28;
      const p = slerp(a, b, t);
      const lift = 1 + 0.22 * Math.sin(Math.PI * t);
      samples.push([p[0] * lift, p[1] * lift, p[2] * lift]);
    }
    arcs.push(samples);
  }
  return { pts, edges, hubs, arcs };
}

function glowSprite() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255, 230, 215, 1)');
  grad.addColorStop(0.18, `rgba(${CORAL}, 0.9)`);
  grad.addColorStop(0.5, `rgba(${CORAL}, 0.18)`);
  grad.addColorStop(1, `rgba(${CORAL}, 0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return c;
}

export function mountGlobe(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = matchMedia('(max-width: 720px)').matches;
  const { pts, edges, hubs, arcs } = buildSphere(small ? 140 : 300);
  const sprite = glowSprite();
  const proj = new Float32Array(pts.length * 3);

  let size = 0;
  let angle = 0.6;
  let last = 0;
  let visible = true;
  let raf = 0;

  const ct = Math.cos(TILT);
  const st = Math.sin(TILT);

  function project(p: Vec, ca: number, sa: number, R: number, out: Float32Array, o: number) {
    const x1 = p[0] * ca + p[2] * sa;
    const z1 = -p[0] * sa + p[2] * ca;
    const y2 = p[1] * ct - z1 * st;
    const z2 = p[1] * st + z1 * ct;
    const s = CAMERA / (CAMERA - z2);
    out[o] = size / 2 + x1 * R * s;
    out[o + 1] = size / 2 + y2 * R * s;
    out[o + 2] = z2;
  }

  const bucketOf = (z: number) => Math.min(BUCKETS - 1, Math.max(0, Math.floor(((z + 1) / 2) * BUCKETS)));
  const alphaOf = (b: number, lo: number, hi: number) => lo + (hi - lo) * ((b + 0.5) / BUCKETS) ** 2;
  const arcBuf = new Float32Array(29 * 3);

  function draw(time: number) {
    if (!ctx) return;
    const R = size * 0.42;
    const ca = Math.cos(angle);
    const sa = Math.sin(angle);
    ctx.clearRect(0, 0, size, size);

    for (let i = 0; i < pts.length; i++) project(pts[i], ca, sa, R, proj, i * 3);

    // Limb: a faint silhouette ring so the sphere reads as a solid.
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, R * 1.01, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${CORAL}, 0.08)`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Edges, one path per depth bucket.
    ctx.lineWidth = 0.7;
    for (let b = 0; b < BUCKETS; b++) {
      ctx.beginPath();
      for (const [i, j] of edges) {
        if (bucketOf((proj[i * 3 + 2] + proj[j * 3 + 2]) / 2) !== b) continue;
        ctx.moveTo(proj[i * 3], proj[i * 3 + 1]);
        ctx.lineTo(proj[j * 3], proj[j * 3 + 1]);
      }
      ctx.strokeStyle = `rgba(${CORAL}, ${alphaOf(b, 0.03, 0.3).toFixed(3)})`;
      ctx.stroke();
    }

    // Points.
    for (let b = 0; b < BUCKETS; b++) {
      ctx.beginPath();
      const r = 0.6 + b * 0.28;
      for (let i = 0; i < pts.length; i++) {
        if (bucketOf(proj[i * 3 + 2]) !== b) continue;
        ctx.moveTo(proj[i * 3] + r, proj[i * 3 + 1]);
        ctx.arc(proj[i * 3], proj[i * 3 + 1], r, 0, Math.PI * 2);
      }
      ctx.fillStyle = `rgba(255, 170, 145, ${alphaOf(b, 0.12, 0.95).toFixed(3)})`;
      ctx.fill();
    }

    // Arcs with a pulse travelling along each.
    ctx.lineWidth = 1;
    arcs.forEach((arc, k) => {
      for (let s = 0; s < arc.length; s++) project(arc[s], ca, sa, R, arcBuf, s * 3);
      const z = arcBuf[14 * 3 + 2];
      if (z < -0.35) return;
      ctx.beginPath();
      ctx.moveTo(arcBuf[0], arcBuf[1]);
      for (let s = 1; s < arc.length; s++) ctx.lineTo(arcBuf[s * 3], arcBuf[s * 3 + 1]);
      ctx.strokeStyle = `rgba(${CORAL}, ${(0.12 + 0.3 * Math.max(0, z)).toFixed(3)})`;
      ctx.stroke();

      const phase = (time * 0.00011 + k * 0.37) % 1;
      const s = Math.floor(phase * (arc.length - 1)) * 3;
      const g = 9;
      ctx.globalAlpha = 0.5 + 0.5 * Math.max(0, arcBuf[s + 2]);
      ctx.drawImage(sprite, arcBuf[s] - g / 2, arcBuf[s + 1] - g / 2, g, g);
      ctx.globalAlpha = 1;
    });

    // Hubs glow when facing the viewer.
    for (const i of hubs) {
      const z = proj[i * 3 + 2];
      if (z < -0.1) continue;
      const g = 8 + 12 * z;
      ctx.globalAlpha = 0.35 + 0.65 * z;
      ctx.drawImage(sprite, proj[i * 3] - g / 2, proj[i * 3 + 1] - g / 2, g, g);
    }
    ctx.globalAlpha = 1;
  }

  function frame(t: number) {
    const dt = last ? Math.min((t - last) / 1000, 0.05) : 0;
    last = t;
    angle += dt * SPIN;
    draw(t);
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (reduced || raf || !visible || document.hidden) return;
    last = 0;
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    cancelAnimationFrame(raf);
    raf = 0;
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    size = canvas.clientWidth;
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(performance.now());
  }

  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    visible ? start() : stop();
  }).observe(canvas);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  resize();
  start();
}
