"use client";

import * as React from "react";
import {
  defaultLocale,
  messages as dictionary,
  supportedLocales,
  type Locale
} from "@/lib/messages";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  messages: (typeof dictionary)[Locale];
  isLoading: boolean;
};

const LocaleContext = React.createContext<LocaleContextValue | undefined>(
  undefined
);

const STORAGE_KEY = "portfolio.locale";

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>(defaultLocale);
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(STORAGE_KEY) as
      | Locale
      | null
      | undefined;
    if (stored && supportedLocales.includes(stored)) {
      setLocaleState(stored);
    }
    setIsHydrated(true);
  }, []);

  const setLocale = React.useCallback((value: Locale) => {
    setLocaleState(value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, value);
    }
  }, []);

  const value = React.useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      messages: dictionary[locale],
      isLoading: !isHydrated
    }),
    [locale, setLocale, isHydrated]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = React.useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider.");
  }
  return context;
}
