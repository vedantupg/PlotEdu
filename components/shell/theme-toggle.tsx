"use client";

import { useSyncExternalStore } from "react";
import { IconMonitor, IconMoon, IconSun } from "@/components/brand/icons";
import { applyThemePref, type ThemePref } from "@/lib/theme";
import { cn } from "@/lib/utils";

function readPref(): ThemePref {
  const v = document.documentElement.dataset.themePref;
  return v === "system" || v === "light" ? v : "dark";
}

function subscribe(onChange: () => void): () => void {
  const obs = new MutationObserver(onChange);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme-pref"] });
  return () => obs.disconnect();
}

const OPTIONS: { value: ThemePref; label: string; Icon: typeof IconSun }[] = [
  { value: "system", label: "System", Icon: IconMonitor },
  { value: "dark", label: "Dark", Icon: IconMoon },
  { value: "light", label: "Light", Icon: IconSun },
];

/** System / Dark / Light. System keeps chrome dark and lets reading surfaces follow the OS. */
export function ThemeToggle({ className }: { className?: string }) {
  const pref = useSyncExternalStore(subscribe, readPref, () => "dark" as ThemePref);

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn("inline-flex rounded-full border border-line bg-ink p-0.5", className)}
    >
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={pref === value}
          aria-label={label}
          title={label}
          onClick={() => applyThemePref(value)}
          className={cn(
            "grid size-8 place-items-center rounded-full text-muted transition-colors duration-150 hover:text-fg",
            pref === value && "bg-surface-3 text-fg",
          )}
        >
          <Icon width={16} height={16} />
        </button>
      ))}
    </div>
  );
}
