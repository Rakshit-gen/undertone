import type { Sky } from "@/lib/forecast";

const Cloud = ({ fill = "var(--cloud-icon)", y = 0 }: { fill?: string; y?: number }) => (
  <path transform={`translate(0 ${y})`} fill={fill} d="M14 34a9 9 0 0 1 1.4-17.9A12 12 0 0 1 38.6 19 7.5 7.5 0 0 1 38 34z" />
);

/** Flat, two-tone weather marks. Size is set by the caller through CSS. */
export function WeatherIcon({ sky, className }: { sky: Sky; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false"
      style={{ ["--cloud-icon" as string]: "var(--foreground)", ["--sun" as string]: "var(--rain)" }}>
      {sky === "clear" && (
        <g fill="var(--sun)">
          <circle cx="24" cy="24" r="8.5" />
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x="23" y="6" width="2" height="6" rx="1" transform={`rotate(${i * 45} 24 24)`} />
          ))}
        </g>
      )}
      {sky === "partly" && (
        <>
          <circle cx="31" cy="17" r="7.5" fill="var(--sun)" />
          <Cloud y={4} />
        </>
      )}
      {sky === "overcast" && (
        <>
          <path fill="var(--text-muted)" d="M22 26a7 7 0 0 1 1-13.9A9.5 9.5 0 0 1 41 14a6 6 0 0 1-.5 12z" />
          <Cloud y={4} />
        </>
      )}
      {sky === "showers" && (
        <>
          <Cloud y={-4} />
          {[16, 24, 32].map((x) => <rect key={x} x={x} y="34" width="2.2" height="7" rx="1.1" fill="var(--mist)" transform={`rotate(12 ${x} 37)`} />)}
        </>
      )}
      {sky === "storm" && (
        <>
          <Cloud y={-5} />
          <path fill="var(--rain)" d="M25 30h-6l-3 9h5l-2 7 9-11h-5z" />
        </>
      )}
    </svg>
  );
}
