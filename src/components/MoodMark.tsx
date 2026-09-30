"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useSyncExternalStore } from "react";
import type { Sky } from "@/lib/forecast";
import { motionTokens } from "@/registry/motion-tokens";
import { WeatherIcon } from "./WeatherIcon";
import styles from "./MoodMark.module.css";

const read = () => (document.documentElement.dataset.sky ?? "partly") as Sky;
const subscribe = (cb: () => void) => {
  const o = new MutationObserver(cb);
  o.observe(document.documentElement, { attributes: true, attributeFilter: ["data-sky"] });
  return () => o.disconnect();
};

/** A tiny copy of the current weather beside the wordmark, so the whole page shares one mood. */
export function MoodMark() {
  const sky = useSyncExternalStore(subscribe, read, () => "partly" as Sky);
  const reduce = useReducedMotion();
  return (
    <span className={styles.mark} aria-hidden="true">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={sky}
          className={styles.inner}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: .5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10, scale: .5 }}
          transition={motionTokens.spring.morph}
        >
          <WeatherIcon sky={sky} className={styles.icon} />
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
