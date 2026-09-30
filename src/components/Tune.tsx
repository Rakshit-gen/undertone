"use client";

import { FLAGS, type FlagKey } from "@/lib/signals";
import { Slider } from "@/registry/components/slider/slider";
import { ChipGroup } from "@/registry/components/chip-group/chip-group";
import panel from "./Panel.module.css";
import styles from "./Tune.module.css";

/** Five stops from relaxed to picky. Each is the Jev probability a line needs before it is marked. */
export const STOPS = [0.8, 0.7, 0.6, 0.5, 0.35] as const;
const NAMES = ["Relaxed", "Easygoing", "Balanced", "Careful", "Picky"];

type Props = {
  stop: number;
  onStop: (i: number) => void;
  hidden: ReadonlySet<FlagKey>;
  onHidden: (h: Set<FlagKey>) => void;
};

export function Tune({ stop, onStop, hidden, onHidden }: Props) {
  const keys = Object.keys(FLAGS) as FlagKey[];
  return (
    <section className={panel.section}>
      <h3 className={panel.heading}>What to look for</h3>
      <div className={styles.stack}>
        <Slider
          label="Sensitivity"
          min={0}
          max={STOPS.length - 1}
          step={1}
          value={stop}
          onValueChange={onStop}
          format={(v) => NAMES[v]}
          start={<span className={styles.end}>Relaxed</span>}
          end={<span className={styles.end}>Picky</span>}
        />
        <ChipGroup
          label="Flags shown"
          options={keys.map((k) => ({ value: k, label: FLAGS[k].label }))}
          value={keys.filter((k) => !hidden.has(k))}
          onValueChange={(shown) => onHidden(new Set(keys.filter((k) => !shown.includes(k))))}
        />
      </div>
    </section>
  );
}
