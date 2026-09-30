import styles from "./Sky.module.css";

/** One cloud: overlapping circles on a flat base, drawn the way you'd cut it from paper. */
function Cloud({ className }: { className: string }) {
  return (
    <svg className={`${styles.cloud} ${className}`} viewBox="0 0 220 90" aria-hidden="true" focusable="false">
      <g fill="var(--cloud)">
        <circle cx="62" cy="52" r="30" />
        <circle cx="104" cy="38" r="36" />
        <circle cx="150" cy="50" r="28" />
        <rect x="32" y="52" width="150" height="30" rx="15" />
      </g>
      <rect x="44" y="72" width="126" height="10" rx="5" fill="var(--cloud-shade)" />
    </svg>
  );
}

// Fixed spread for the rain so server and client render the same drops.
const DROPS = Array.from({ length: 56 }, (_, i) => ({
  left: (i * 37) % 100 + ((i * 13) % 7) / 10,
  delay: -((i * 0.173) % 1.2),
  duration: 0.75 + ((i * 7) % 5) / 10,
}));

/**
 * The page backdrop. It follows the forecast through `data-sky` on <html>:
 * sun for clear, heavier cloud for overcast, rain for showers, rain and lightning for storms.
 * Decorative only, and still when motion is reduced.
 */
export function Sky() {
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
      <Cloud className={styles.a} />
      <Cloud className={styles.b} />
      <Cloud className={styles.c} />
      <Cloud className={styles.d} />
      <Cloud className={styles.e} />
      <div className={styles.rain}>
        {DROPS.map((d, i) => (
          <i key={i} style={{ left: `${d.left}%`, animationDelay: `${d.delay}s`, animationDuration: `${d.duration}s` }} />
        ))}
      </div>
      <span className={styles.flash} />
    </div>
  );
}
