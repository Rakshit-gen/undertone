import styles from "./Dots.module.css";

/** Three small drops, falling in turn while Jev reads. */
export function Dots({ label }: { label: string }) {
  return (
    <span className={styles.wrap}>
      {label}
      <span className={styles.dots} aria-hidden="true"><i /><i /><i /></span>
    </span>
  );
}
