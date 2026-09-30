"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Sky } from "@/lib/forecast";
import { SKIES } from "@/lib/forecast";
import { motionTokens } from "@/registry/motion-tokens";
import { Tooltip } from "@/registry/components/tooltip/tooltip";
import { WeatherIcon } from "./WeatherIcon";
import styles from "./Trail.module.css";

export type Stop = { id: number; sky: Sky; text: string };

/** Every version you've had read, as a row of little skies. Click one to bring that version back. */
export function Trail({ stops, current, onRestore }: { stops: Stop[]; current: string; onRestore: (s: Stop) => void }) {
  const reduce = useReducedMotion();
  if (stops.length < 2) return null;
  return (
    <nav className={styles.trail} aria-label="Earlier versions">
      <span className={styles.label}>Versions</span>
      <ol>
        <AnimatePresence initial={false}>
          {stops.map((s, i) => (
            <motion.li
              key={s.id}
              layout={!reduce}
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: .4, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: .4 }}
              transition={motionTokens.spring.snappy}
            >
              <Tooltip content={`Version ${i + 1}: ${SKIES[s.sky].title}`}>
                <button
                  type="button"
                  className={styles.stop}
                  data-current={s.text === current || undefined}
                  onClick={() => onRestore(s)}
                  aria-label={`Restore version ${i + 1}, ${SKIES[s.sky].title}`}
                >
                  <WeatherIcon sky={s.sky} className={styles.icon} />
                </button>
              </Tooltip>
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
    </nav>
  );
}
