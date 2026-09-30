"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Forecast } from "@/lib/forecast";
import { motionTokens } from "@/registry/motion-tokens";
import { TextMorph } from "@/registry/components/text-morph/text-morph";
import { WeatherIcon } from "./WeatherIcon";
import styles from "./Panel.module.css";

/** The headline. When the weather changes, the icon swaps with a small spring and the title morphs. */
export function ForecastCard({ forecast }: { forecast: Forecast }) {
  const reduce = useReducedMotion();
  return (
    <section className={styles.forecast} aria-live="polite" data-sky={forecast.sky}>
      <span className={styles.weatherSlot}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={forecast.sky}
            className={styles.weatherInner}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: .6, rotate: -20, y: 8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: .6, rotate: 20, y: -8 }}
            transition={motionTokens.spring.morph}
          >
            <WeatherIcon sky={forecast.sky} className={styles.weather} />
          </motion.span>
        </AnimatePresence>
      </span>
      <div>
        <TextMorph as="h2" className={styles.title}>{forecast.title}</TextMorph>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={forecast.line}
            className={styles.line}
            initial={{ opacity: 0, y: reduce ? 0 : 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: motionTokens.duration.standard }}
          >
            {forecast.line}
          </motion.p>
        </AnimatePresence>
      </div>
    </section>
  );
}
