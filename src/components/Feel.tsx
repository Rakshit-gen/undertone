import { FEELINGS, type Feeling } from "@/lib/signals";
import panel from "./Panel.module.css";
import styles from "./Feel.module.css";

const pct = (p: number) => `${Math.round(p * 100)}%`;

/** What the reader is likely to feel, as a share of Jev's confidence rather than a single verdict. */
export function Feel({ feel, reader }: { feel: { key: Feeling; p: number }[]; reader: string }) {
  if (!feel.length) return null;
  return (
    <section className={panel.section}>
      <h3 className={panel.heading}>How {reader} may feel</h3>
      <ul className={styles.list}>
        {feel.map((f, i) => (
          <li key={f.key} className={styles.row} data-top={i === 0 || undefined}>
            <span>{FEELINGS[f.key]}</span>
            <span className={styles.bar} aria-hidden="true"><span style={{ width: pct(f.p) }} /></span>
            <span className={styles.pct}>{pct(f.p)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
