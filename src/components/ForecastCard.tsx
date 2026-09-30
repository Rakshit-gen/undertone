import type { Forecast } from "@/lib/forecast";
import { WeatherIcon } from "./WeatherIcon";
import styles from "./Panel.module.css";

export function ForecastCard({ forecast }: { forecast: Forecast }) {
  return (
    <section className={styles.forecast} aria-live="polite">
      <WeatherIcon sky={forecast.sky} className={styles.weather} />
      <div>
        <h2 className={styles.title}>{forecast.title}</h2>
        <p className={styles.line}>{forecast.line}</p>
      </div>
    </section>
  );
}
