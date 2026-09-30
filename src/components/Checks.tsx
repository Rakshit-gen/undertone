import { Check, ChevronRight, X } from "lucide-react";
import type { CheckReading } from "@/lib/reading";
import { CHECKS } from "@/lib/signals";
import panel from "./Panel.module.css";
import styles from "./Checks.module.css";

/** Failing checks come first and open to show how to fix them. */
export function Checks({ checks }: { checks: CheckReading[] }) {
  const sorted = [...checks].sort((a, b) => Number(a.ok) - Number(b.ok));
  const passed = checks.filter((c) => c.ok).length;
  return (
    <section className={panel.section}>
      <div className={styles.head}>
        <h3 className={panel.heading}>Before you send</h3>
        <span className={styles.score}>{passed} of {checks.length}</span>
      </div>
      <span className={styles.meter} aria-hidden="true"><span style={{ width: `${(passed / Math.max(1, checks.length)) * 100}%` }} /></span>
      <ul className={styles.list}>
        {sorted.map((c) => (
          <li key={c.key} data-ok={c.ok}>
            <details name="checks">
              <summary>
                {c.ok ? <Check size={16} strokeWidth={1.75} aria-hidden="true" /> : <X size={16} strokeWidth={1.75} aria-hidden="true" />}
                <span className={styles.text}>{c.label}</span>
                <span className="sr-only">{c.ok ? "looks fine" : "worth a look"}</span>
                <ChevronRight size={16} strokeWidth={1.75} aria-hidden="true" className={styles.chev} />
              </summary>
              <p>{c.ok ? "This one's fine. " : ""}{CHECKS[c.key].fix}</p>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}
