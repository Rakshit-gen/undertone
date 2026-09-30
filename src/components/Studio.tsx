"use client";

import { useState } from "react";
import { useReading } from "@/hooks/useReading";
import { forecast } from "@/lib/forecast";
import { SAMPLES } from "@/lib/samples";
import { GOALS, RECIPIENTS, type Goal, type Recipient } from "@/lib/signals";
import { Select } from "@/registry/components/select/select";
import { CopyButton } from "@/registry/components/copy-button/copy-button";
import { Skeleton } from "@/registry/components/skeleton/skeleton";
import { Editor } from "./Editor";
import { ForecastCard } from "./ForecastCard";
import { Gauges } from "./Gauges";
import { Feel } from "./Feel";
import { Checks } from "./Checks";
import { Notes } from "./Notes";
import { WeatherIcon } from "./WeatherIcon";
import panel from "./Panel.module.css";
import styles from "./Studio.module.css";

const opts = <K extends string>(m: Record<K, string>) => (Object.keys(m) as K[]).map((value) => ({ value, label: m[value] }));

const ERRORS = {
  not_connected: { title: "Jev isn't connected yet", body: "The AI Gateway needs a card on the Vercel account before it will answer. Nothing is being made up in the meantime." },
  limited: { title: "Slow down a little", body: "Too many reads in a short time. Try again in a minute." },
  unavailable: { title: "Couldn't read that", body: "Jev didn't answer. Keep typing and it will try again." },
  invalid: { title: "Couldn't read that", body: "The message is empty or longer than 4,000 characters." },
} as const;

export function Studio() {
  const [recipient, setRecipient] = useState<Recipient>("colleague");
  const [goal, setGoal] = useState<Goal>("followup");
  const [text, setText] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const { result, status, error } = useReading(text, { recipient, goal });
  const current = result && result.text === text.trim() ? result : null;

  function load(i: number) {
    const s = SAMPLES[i];
    setRecipient(s.recipient);
    setGoal(s.goal);
    setText(s.text);
  }

  return (
    <div className={styles.grid}>
      <div className={styles.left}>
        <div className={styles.context}>
          <Select label="Sending to" options={opts(RECIPIENTS)} value={recipient} onValueChange={(v) => setRecipient(v as Recipient)} />
          <Select label="I want to" options={opts(GOALS)} value={goal} onValueChange={(v) => setGoal(v as Goal)} />
        </div>

        <div className={styles.sheet}>
          <Editor value={text} onChange={setText} result={current} active={active} />
          <div className={styles.foot}>
            <span className={styles.status} aria-live="polite">
              {status === "reading" ? "Reading…" : current ? <>Read by Jev in <b>{current.ms} ms</b></> : text ? "" : "Start typing. It reads as you go."}
            </span>
            <span className={styles.count}>{text.length.toLocaleString()} / 4,000</span>
            <CopyButton value={text} label="Copy" disabled={!text} />
          </div>
        </div>

        <div className={styles.samples}>
          <span>Try one:</span>
          {SAMPLES.map((s, i) => (
            <button key={s.name} type="button" onClick={() => load(i)}>{s.name}</button>
          ))}
        </div>
      </div>

      <aside className={`${panel.panel} ${styles.right}`} aria-label="Reading">
        {status === "error" && error ? (
          <div className={styles.empty} role="alert">
            <WeatherIcon sky="overcast" className={styles.emptyIcon} />
            <h2>{ERRORS[error].title}</h2>
            <p>{ERRORS[error].body}</p>
          </div>
        ) : current ? (
          <>
            <ForecastCard forecast={forecast(current)} />
            <Notes sentences={current.sentences} active={active} onActive={setActive} />
            <Gauges gauges={current.gauges} />
            <Feel feel={current.feel} reader={RECIPIENTS[recipient]} />
            <Checks checks={current.checks} />
          </>
        ) : status === "reading" ? (
          <div className={styles.loading}><Skeleton label="Reading your message" lines={6} /></div>
        ) : (
          <div className={styles.empty}>
            <WeatherIcon sky="partly" className={styles.emptyIcon} />
            <h2>The forecast shows up here</h2>
            <p>Undertone reads each sentence the way the other person will and tells you where it might land wrong. It doesn&apos;t rewrite anything.</p>
          </div>
        )}
      </aside>
    </div>
  );
}
