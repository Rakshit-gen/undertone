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

/** The page backdrop. Decorative, behind everything, and still when motion is reduced. */
export function Sky() {
  return (
    <div className={styles.sky} aria-hidden="true">
      <Cloud className={styles.a} />
      <Cloud className={styles.b} />
      <Cloud className={styles.c} />
      <Cloud className={styles.d} />
      <span className={styles.moon} />
    </div>
  );
}
