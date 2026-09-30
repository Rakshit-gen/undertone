"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EyeOff } from "lucide-react";
import type { SentenceReading } from "@/lib/reading";
import { FLAGS } from "@/lib/signals";
import { motionTokens } from "@/registry/motion-tokens";
import { Tooltip } from "@/registry/components/tooltip/tooltip";
import panel from "./Panel.module.css";
import styles from "./Notes.module.css";

type Props = {
  sentences: SentenceReading[];
  active: string | null;
  onActive: (id: string | null) => void;
  /** Jump to the sentence in the editor. */
  onPick: (id: string) => void;
  onDismiss: (id: string) => void;
  dismissedCount: number;
  onRestore: () => void;
};

/** Up and down move between notes; Enter jumps to the sentence. */
function move(e: React.KeyboardEvent<HTMLButtonElement>) {
  if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
  e.preventDefault();
  const all = [...(e.currentTarget.closest("ol")?.querySelectorAll<HTMLButtonElement>("button[data-note]") ?? [])];
  const i = all.indexOf(e.currentTarget);
  all[(i + (e.key === "ArrowDown" ? 1 : -1) + all.length) % all.length]?.focus();
}

export function Notes({ sentences, active, onActive, onPick, onDismiss, dismissedCount, onRestore }: Props) {
  const reduce = useReducedMotion();
  const flagged = sentences.filter((s) => s.flags.length);
  return (
    <section className={panel.section}>
      <div className={styles.head}>
        <h3 className={panel.heading}>{flagged.length ? `${flagged.length} line${flagged.length === 1 ? "" : "s"} to look at` : "Line by line"}</h3>
        {dismissedCount > 0 && <button type="button" className={styles.restore} onClick={onRestore}>Show {dismissedCount} ignored</button>}
      </div>
      {flagged.length === 0 ? (
        <p className={styles.empty}>No sentence stands out at this sensitivity.</p>
      ) : (
        <ol className={styles.list} onMouseLeave={() => onActive(null)}>
          <AnimatePresence initial={false}>
            {flagged.map((s) => {
              const top = FLAGS[s.flags[0].key];
              return (
                <motion.li
                  key={s.id + s.text}
                  layout={!reduce}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0, transition: motionTokens.spring.smooth }}
                  transition={motionTokens.spring.smooth}
                  className={styles.item}
                >
                  <button
                    type="button"
                    data-note
                    className={styles.note}
                    data-tone={top.tone}
                    data-active={active === s.id || undefined}
                    onMouseEnter={() => onActive(s.id)}
                    onFocus={() => onActive(s.id)}
                    onClick={() => onPick(s.id)}
                    onKeyDown={move}
                    aria-label={`${s.text}. ${s.flags.map((f) => FLAGS[f.key].label).join(", ")}. Jump to sentence.`}
                  >
                    <span className={styles.quote}>{s.text}</span>
                    <span className={styles.labels}>
                      {s.flags.map((f) => (
                        <span key={f.key} data-tone={FLAGS[f.key].tone}>
                          {FLAGS[f.key].label} <em>{Math.round(f.p * 100)}%</em>
                        </span>
                      ))}
                    </span>
                    <span className={styles.tip}>{top.tip}</span>
                  </button>
                  <Tooltip content="Ignore this line">
                    <button type="button" className={styles.dismiss} onClick={() => onDismiss(s.id)} aria-label={`Ignore: ${s.text}`}>
                      <EyeOff size={16} strokeWidth={1.75} aria-hidden="true" />
                    </button>
                  </Tooltip>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ol>
      )}
    </section>
  );
}
