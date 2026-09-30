import { Check, X } from "lucide-react";
import type { CheckReading } from "@/lib/reading";
import panel from "./Panel.module.css";
import styles from "./Checks.module.css";

export function Checks({ checks }: { checks: CheckReading[] }) {
  const sorted = [...checks].sort((a, b) => Number(a.ok) - Number(b.ok));
  return (
    <section className={panel.section}>
      <h3 className={panel.heading}>Before you send</h3>
      <ul className={styles.list}>
        {sorted.map((c) => (
          <li key={c.key} data-ok={c.ok}>
            {c.ok
              ? <Check size={16} strokeWidth={1.75} aria-hidden="true" />
              : <X size={16} strokeWidth={1.75} aria-hidden="true" />}
            <span>{c.label}</span>
            <span className="sr-only">{c.ok ? "looks fine" : "worth a look"}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
