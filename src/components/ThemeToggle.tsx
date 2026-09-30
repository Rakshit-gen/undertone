"use client";

import { useSyncExternalStore } from "react";
import { ThemeSwitch, type Theme } from "@/registry/components/theme-switch/theme-switch";

const read = (): Theme => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");
const subscribe = (cb: () => void) => {
  const o = new MutationObserver(cb);
  o.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => o.disconnect();
};

/** Day or night sky. The choice is remembered in this browser only. */
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, read, () => "light" as Theme);
  return (
    <ThemeSwitch
      theme={theme}
      iconOnly
      onThemeChange={(next) => {
        document.documentElement.dataset.theme = next;
        try { localStorage.setItem("theme", next); } catch {}
      }}
    />
  );
}
