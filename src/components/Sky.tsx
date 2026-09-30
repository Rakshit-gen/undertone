"use client";

import { useEffect, useRef } from "react";
import { mood } from "@/lib/mood";
import styles from "./Sky.module.css";

/** One cloud: overlapping circles on a flat base, drawn the way you'd cut it from paper. */
function CloudShape({ variant }: { variant: number }) {
  const puffs = [
    [[62, 52, 30], [104, 38, 36], [150, 50, 28]],
    [[56, 56, 26], [92, 40, 30], [132, 34, 34], [172, 54, 24]],
    [[70, 50, 32], [120, 44, 30], [158, 56, 22]],
  ][variant % 3];
  return (
    <svg viewBox="0 0 220 90" aria-hidden="true" focusable="false">
      <g fill="var(--cloud)">
        {puffs.map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} className={styles.puff} style={{ animationDelay: `${-i * 1.3 - variant}s` }} />)}
        <rect x="30" y="52" width="160" height="30" rx="15" />
      </g>
      <rect x="44" y="72" width="132" height="10" rx="5" fill="var(--cloud-shade)" />
    </svg>
  );
}

/** depth: 0 far and slow and small, 1 near and fast and big. */
const CLOUDS = [
  { y: 6, w: 260, depth: .7, x: 5 },
  { y: 20, w: 170, depth: .35, x: 62 },
  { y: 34, w: 120, depth: .15, x: 30 },
  { y: 58, w: 320, depth: .9, x: 78 },
  { y: 72, w: 200, depth: .5, x: 18 },
  { y: 84, w: 150, depth: .25, x: 50 },
  { y: 12, w: 110, depth: .1, x: 88 },
];

const BIRDS = [0, 1, 2];

// Fixed spread for the rain so server and client render the same drops.
const DROPS = Array.from({ length: 64 }, (_, i) => ({
  left: (i * 37) % 100 + ((i * 13) % 7) / 10,
  delay: -((i * 0.173) % 1.2),
  duration: 0.75 + ((i * 7) % 5) / 10,
}));

/**
 * The page backdrop, alive: clouds ride a wind that typing stirs up, breathe as they go,
 * and lean away from the pointer by depth. Weather comes from `data-sky` and mood variables on <html>.
 * Decorative only; with reduced motion everything holds still.
 */
export function Sky() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const vw = () => window.innerWidth;
    // Positions in px, starting from the layout above so there's no jump on load.
    const xs = CLOUDS.map((c) => (c.x / 100) * vw());
    const pointer = { x: 0, y: 0 }, eased = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => { pointer.x = e.clientX / vw() - .5; pointer.y = e.clientY / window.innerHeight - .5; };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0, last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(.05, (now - last) / 1000);
      last = now;
      mood.gust *= Math.pow(.25, dt); // a gust fades over a couple of seconds
      const wind = 1 + mood.gust * 6 + mood.storm * 3;
      eased.x += (pointer.x - eased.x) * Math.min(1, dt * 3);
      eased.y += (pointer.y - eased.y) * Math.min(1, dt * 3);
      const t = now / 1000;

      CLOUDS.forEach((c, i) => {
        const el = refs.current[i];
        if (!el) return;
        xs[i] += (6 + c.depth * 18) * wind * dt;
        if (xs[i] > vw() + 40) xs[i] = -c.w - 40;
        const bob = Math.sin(t * (.35 + c.depth * .2) + i * 1.7) * (4 + c.depth * 6);
        const breathe = 1 + Math.sin(t * .5 + i) * .015;
        const px = -eased.x * 40 * c.depth, py = -eased.y * 24 * c.depth;
        el.style.transform = `translate3d(${xs[i] + px}px, ${bob + py}px, 0) scale(${breathe})`;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("pointermove", onMove); };
  }, []);

  return (
    <div className={styles.sky} aria-hidden="true">
      <span className={styles.sun}>
        <svg viewBox="0 0 100 100">
          <g className={styles.rays}>
            {Array.from({ length: 12 }, (_, i) => <rect key={i} x="48.5" y="2" width="3" height="12" rx="1.5" transform={`rotate(${i * 30} 50 50)`} />)}
          </g>
          <circle cx="50" cy="50" r="24" />
        </svg>
      </span>
      <span className={styles.moon} />

      <div className={styles.birds}>
        {BIRDS.map((b) => (
          <svg key={b} viewBox="0 0 24 10" className={styles.bird} style={{ animationDelay: `${-b * 7}s`, top: `${14 + b * 6}%` }}>
            <path d="M1 7 Q6 1 12 6 Q18 1 23 7" className={styles.wing} style={{ animationDelay: `${b * .2}s` }} />
          </svg>
        ))}
      </div>

      {CLOUDS.map((c, i) => (
        <div
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          className={styles.cloud}
          style={{ top: `${c.y}%`, width: c.w, opacity: .45 + c.depth * .55, zIndex: Math.round(c.depth * 10), transform: `translate3d(${c.x}vw, 0, 0)` }}
        >
          <CloudShape variant={i} />
        </div>
      ))}

      <div className={styles.fog}><i /><i /><i /><i /></div>
      <div className={styles.rain}>
        {DROPS.map((d, i) => (
          <i key={i} style={{ left: `${d.left}%`, animationDelay: `${d.delay}s`, animationDuration: `${d.duration}s` }} />
        ))}
      </div>
      <span className={styles.flash} />
    </div>
  );
}
