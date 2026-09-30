import { GAUGES, type GaugeKey } from "@/lib/signals";
import styles from "./Gauges.module.css";
import panel from "./Panel.module.css";

/** A hairline scale per gauge, with the level it lands on spelled out. */
export function Gauges({ gauges }: { gauges: Record<GaugeKey, number> }) {
  return (
    <section className={panel.section}>
      <h3 className={panel.heading}>How it reads</h3>
      <dl className={styles.list}>
        {(Object.keys(GAUGES) as GaugeKey[]).map((key) => {
          const g = GAUGES[key];
          const v = gauges[key];
          const level = g.levels[Math.round(v * (g.levels.length - 1))];
          return (
            <div key={key} className={styles.row}>
              <dt>{g.label}</dt>
              <dd>
                <span className={styles.value}>{level}</span>
                <span className={styles.scale} role="meter" aria-label={g.label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(v * 100)} aria-valuetext={level}>
                  <span className={styles.ends} aria-hidden="true"><span>{g.low}</span><span>{g.high}</span></span>
                  <span className={styles.track} aria-hidden="true">
                    {g.levels.map((_, i) => <i key={i} />)}
                    <b style={{ left: `${v * 100}%` }} />
                  </span>
                </span>
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
