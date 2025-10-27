"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supportedLocales, type Locale } from "@/lib/messages";
import { useLocale } from "@/components/locale-provider";

const shortLabels: Record<Locale, string> = {
  en: "EN",
  fr: "FR",
  ru: "RU"
};

export function LanguageSwitcher() {
  const { locale, setLocale, messages, isLoading } = useLocale();

  if (isLoading) {
    return (
      <div className="h-9 w-24 rounded-lg border border-border/60 bg-muted/30" />
    );
  }

  const labels: Record<Locale, string> = {
    en: messages.languageToggle.english,
    fr: messages.languageToggle.french,
    ru: messages.languageToggle.russian
  };

  return (
    <div>
      <span className="sr-only">{messages.languageToggle.label}</span>
      <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-background/90 p-1 backdrop-blur-md">
        {supportedLocales.map((code) => (
          <Button
            key={code}
            variant="ghost"
            size="sm"
            aria-label={labels[code]}
            className={cn(
              "rounded-md px-3 text-xs font-semibold uppercase transition",
              locale === code
                ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                : "text-muted-foreground"
            )}
            onClick={() => setLocale(code)}
          >
            <span aria-hidden="true">{shortLabels[code]}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
