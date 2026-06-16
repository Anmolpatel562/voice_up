"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { THEMES, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { Monitor, Moon, Sun } from "lucide-react";

const THEME_ICONS: Record<Theme, typeof Monitor> = {
  system: Monitor,
  dark: Moon,
  light: Sun,
};

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-3">
      <div>
        <p className="font-medium text-foreground">Appearance</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose how VoiceUp looks on this device.
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="Theme"
        className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-background p-1"
      >
        {THEMES.map(({ value, label }) => {
          const Icon = THEME_ICONS[value];
          const isSelected = mounted && theme === value;

          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setTheme(value)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors",
                isSelected
                  ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
