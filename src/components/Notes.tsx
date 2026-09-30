import type { SentenceReading } from "@/lib/reading";
import { FLAGS } from "@/lib/signals";
import panel from "./Panel.module.css";
import styles from "./Notes.module.css";

type Props = { sentences: SentenceReading[]; active: string | null; onActive: (id: string | null) => void };

/** One note per flagged sentence. Pointing at a note lights up its sentence in the editor. */
export function Notes({ sentences, active, onActive }: Props) {
  const flagged = sentences.filter((s) => s.flags.length);
  return (
    <section className={panel.section}>
      <h3 className={panel.heading}>{flagged.length ? `${flagged.length} line${flagged.length === 1 ? "" : "s"} to look at` : "Line by line"}</h3>
      {flagged.length === 0 ? (
        <p className={styles.empty}>No sentence stands out. Nothing to fix line by line.</p>
      ) : (
        <ol className={styles.list} onMouseLeave={() => onActive(null)}>
          {flagged.map((s) => {
            const top = FLAGS[s.flags[0].key];
            return (
              <li key={s.id}>
                <button
                  type="button"
                  className={styles.note}
                  data-tone={top.tone}
                  data-active={active === s.id || undefined}
                  onMouseEnter={() => onActive(s.id)}
                  onFocus={() => onActive(s.id)}
                  onBlur={() => onActive(null)}
                >
                  <span className={styles.quote}>{s.text}</span>
                  <span className={styles.labels}>
                    {s.flags.map((f) => <span key={f.key} data-tone={FLAGS[f.key].tone}>{FLAGS[f.key].label}</span>)}
                  </span>
                  <span className={styles.tip}>{top.tip}</span>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
