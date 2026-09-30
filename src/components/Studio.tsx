"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useReading } from "@/hooks/useReading";
import { EXAMPLES } from "@/lib/examples";
import { forecast } from "@/lib/forecast";
import { applyView } from "@/lib/view";
import { SAMPLES } from "@/lib/samples";
import { GOALS, RECIPIENTS, type FlagKey, type Goal, type Recipient } from "@/lib/signals";
import { Select } from "@/registry/components/select/select";
import { CopyButton } from "@/registry/components/copy-button/copy-button";
import { Skeleton } from "@/registry/components/skeleton/skeleton";
import { Badge } from "@/registry/components/badge/badge";
import { Editor } from "./Editor";
import { ForecastCard } from "./ForecastCard";
import { Gauges } from "./Gauges";
import { Feel } from "./Feel";
import { Checks } from "./Checks";
import { Notes } from "./Notes";
import { STOPS, Tune } from "./Tune";
import { Trail, type Stop } from "./Trail";
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
  const [hover, setHover] = useState<string | null>(null);
  const [caret, setCaret] = useState(-1);
  const [stop, setStop] = useState(2);
  const threshold = STOPS[stop];
  const [hidden, setHidden] = useState<ReadonlySet<FlagKey>>(new Set());
  const [dismissed, setDismissed] = useState<ReadonlySet<string>>(new Set());
  const textarea = useRef<HTMLTextAreaElement>(null);

  // Samples come with a hand-written reading; anything else is read live by Jev.
  const example = EXAMPLES[text.trim()] ?? null;
  const { result, status, error } = useReading(example ? "" : text, { recipient, goal });
  const raw = example ?? (result && result.text === text.trim() ? result : null);
  const current = useMemo(() => raw && applyView(raw, { threshold, hidden, dismissed }), [raw, threshold, hidden, dismissed]);

  const weather = current ? forecast(current) : null;

  // Each new reading leaves a stop on the trail. Set during render, guarded, so it never loops.
  const [trail, setTrail] = useState<Stop[]>([]);
  const last = trail[trail.length - 1];
  if (weather && current && (!last || last.text !== current.text) && !trail.some((t) => t.text === current.text)) {
    setTrail([...trail, { id: (last?.id ?? 0) + 1, sky: weather.sky, text: current.text }].slice(-12));
  }

  // The sky behind the page follows the forecast.
  useEffect(() => {
    const root = document.documentElement;
    if (weather) root.dataset.sky = weather.sky;
    else delete root.dataset.sky;
  }, [weather?.sky]); // eslint-disable-line react-hooks/exhaustive-deps

  const lead = text.length - text.trimStart().length;
  const flagged = current?.sentences.filter((s) => s.flags.length) ?? [];
  const atCaret = flagged.find((s) => caret >= s.start + lead && caret <= s.end + lead)?.id ?? null;
  const active = hover ?? atCaret;

  function pick(id: string) {
    const s = current?.sentences.find((x) => x.id === id);
    const el = textarea.current;
    if (!s || !el) return;
    el.focus();
    el.setSelectionRange(s.start + lead, s.end + lead);
    setCaret(s.start + lead);
  }

  function dismiss(id: string) {
    const s = current?.sentences.find((x) => x.id === id);
    if (s) setDismissed((d) => new Set(d).add(s.text));
    setHover(null);
  }

  /** Alt with up or down hops between flagged sentences without leaving the keyboard. */
  function onEditorKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!e.altKey || (e.key !== "ArrowDown" && e.key !== "ArrowUp") || !flagged.length) return;
    e.preventDefault();
    const pos = e.currentTarget.selectionStart;
    const next = e.key === "ArrowDown"
      ? flagged.find((s) => s.start + lead > pos) ?? flagged[0]
      : [...flagged].reverse().find((s) => s.end + lead < pos) ?? flagged[flagged.length - 1];
    pick(next.id);
  }

  function load(i: number) {
    const s = SAMPLES[i];
    setRecipient(s.recipient);
    setGoal(s.goal);
    setText(s.text);
    setDismissed(new Set());
  }

  return (
    <div className={styles.grid}>
      <div className={styles.left}>
        <div className={styles.context}>
          <Select label="Sending to" options={opts(RECIPIENTS)} value={recipient} onValueChange={(v) => setRecipient(v as Recipient)} />
          <Select label="I want to" options={opts(GOALS)} value={goal} onValueChange={(v) => setGoal(v as Goal)} />
        </div>

        <div className={styles.sheet}>
          <Editor value={text} onChange={setText} result={current} active={active} textarea={textarea} onCaret={setCaret} onKeyDown={onEditorKey} />
          <div className={styles.foot}>
            <span className={styles.status} aria-live="polite">
              {example ? <><Badge tone="info" size="sm">Example</Badge> Hand-written reading. Edit the text for a live one.</>
                : status === "reading" ? "Reading…"
                : current ? <>Read by Jev in <b>{current.ms} ms</b></>
                : text ? "" : "Start typing. It reads as you go."}
            </span>
            <span className={styles.count}>{text.length.toLocaleString()} / 4,000</span>
            <CopyButton value={text} label="Copy" disabled={!text} />
          </div>
        </div>

        <Trail stops={trail} current={text.trim()} onRestore={(t) => setText(t.text)} />

        <div className={styles.samples}>
          <span>Try one:</span>
          {SAMPLES.map((s, i) => (
            <button key={s.name} type="button" onClick={() => load(i)}>{s.name}</button>
          ))}
        </div>
      </div>

      <aside className={`${panel.panel} ${styles.right}`} aria-label="Reading">
        {!example && status === "error" && error ? (
          <div className={styles.empty} role="alert">
            <WeatherIcon sky="overcast" className={styles.emptyIcon} />
            <h2>{ERRORS[error].title}</h2>
            <p>{ERRORS[error].body}</p>
          </div>
        ) : current ? (
          <>
            <ForecastCard forecast={weather!} />
            <Notes sentences={current.sentences} active={active} onActive={setHover} onPick={pick} onDismiss={dismiss} dismissedCount={dismissed.size} onRestore={() => setDismissed(new Set())} />
            <Tune stop={stop} onStop={setStop} hidden={hidden} onHidden={setHidden} />
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
