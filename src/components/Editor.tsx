"use client";

import { useRef, type ReactNode, type RefObject } from "react";
import type { Result } from "@/hooks/useReading";
import { FLAGS } from "@/lib/signals";
import styles from "./Editor.module.css";

type Props = {
  value: string;
  onChange: (v: string) => void;
  result: Result | null;
  active: string | null;
  /** Called with the caret offset whenever it moves, so the page can follow the sentence being edited. */
  onCaret?: (offset: number) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  textarea?: RefObject<HTMLTextAreaElement | null>;
};

/**
 * A plain textarea over a mirror of the same text. The mirror draws the underlines,
 * so typing, selection, undo and spellcheck stay the browser's own.
 */
export function Editor({ value, onChange, result, active, onCaret, onKeyDown, textarea }: Props) {
  const mirror = useRef<HTMLDivElement>(null);
  const lead = value.length - value.trimStart().length;
  const current = result && result.text === value.trim() ? result : null;

  const parts: ReactNode[] = [];
  let at = 0;
  for (const s of current?.sentences ?? []) {
    if (!s.flags.length) continue;
    const start = s.start + lead, end = s.end + lead;
    if (start > at) parts.push(value.slice(at, start));
    parts.push(
      <mark key={s.id} data-tone={FLAGS[s.flags[0].key].tone} data-active={active === s.id || undefined}>
        {value.slice(start, end)}
      </mark>,
    );
    at = end;
  }
  parts.push(value.slice(at));

  return (
    <div className={styles.wrap}>
      <div ref={mirror} className={`${styles.field} ${styles.mirror}`} aria-hidden="true">
        {parts}
        {"\n"}
      </div>
      <textarea
        className={styles.field}
        value={value}
        ref={textarea}
        onChange={(e) => { onChange(e.target.value); onCaret?.(e.target.selectionStart); }}
        onSelect={(e) => onCaret?.(e.currentTarget.selectionStart)}
        onKeyDown={onKeyDown}
        onScroll={(e) => { if (mirror.current) mirror.current.scrollTop = e.currentTarget.scrollTop; }}
        placeholder="Write or paste the message you're about to send."
        aria-label="Your message"
        maxLength={4000}
        spellCheck
      />
    </div>
  );
}
