"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Laptop, MoonStar, SunMedium } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/locale-provider";

const themeOptions = [
  { value: "light", icon: SunMedium },
  { value: "dark", icon: MoonStar },
  { value: "system", icon: Laptop }
] as const;

type ThemeValue = (typeof themeOptions)[number]["value"];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { messages } = useLocale();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-10 w-[144px] rounded-lg border border-border/60 bg-muted/30" />
    );
  }

  const activeTheme = (theme ?? "system") as ThemeValue;

  return (
    <div>
      <span className="sr-only">{messages.themeToggle.label}</span>
      <div className="flex gap-1 rounded-lg border border-border/60 bg-background/90 p-1 backdrop-blur-md">
        {themeOptions.map(({ value, icon: Icon }) => (
          <Button
            key={value}
            variant="ghost"
            size="icon"
            aria-label={messages.themeToggle[value]}
            className={cn(
              "rounded-md transition",
              activeTheme === value
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "text-muted-foreground"
            )}
            onClick={() => setTheme(value)}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </Button>
        ))}
      </div>
    </div>
  );
}
