"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "@/components/locale-provider";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

const sectionIds = [
  { key: "summary", id: "summary" },
  { key: "education", id: "education" },
  { key: "skills", id: "skills" },
  { key: "projects", id: "projects" },
  { key: "resume", id: "resume" },
  { key: "contact", id: "contact" }
] as const;

export function Header() {
  const { messages } = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-4 z-40">
      <div className="mx-auto flex max-w-5xl items-center justify-between rounded-full border border-border/70 bg-card/80 px-3 py-2 shadow-lg backdrop-blur-md md:px-5 md:py-3">
        <button
          type="button"
          aria-label={open ? "Close navigation" : "Toggle navigation"}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-white text-muted-foreground transition hover:border-primary/40 hover:text-primary md:hidden"
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className="relative flex h-3 w-4 flex-col justify-between">
            <span
              className={`h-[2px] w-full rounded bg-current transition-transform duration-200 ${
                open ? "translate-y-[5px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-[2px] w-full rounded bg-current transition-opacity duration-200 ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`h-[2px] w-full rounded bg-current transition-transform duration-200 ${
                open ? "-translate-y-[5px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
        <nav className="hidden items-center gap-2 text-[0.58rem] uppercase tracking-[0.28em] text-muted-foreground md:flex md:gap-3">
          {sectionIds.map(({ id, key }) => (
            <Link
              key={id}
              href={`#${id}`}
              className="whitespace-nowrap rounded-full px-3 py-1 transition hover:bg-primary/10 hover:text-primary"
            >
              {messages.nav[key]}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end gap-1.5 md:gap-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
      {open && (
        <nav className="mx-auto mt-3 flex w-full max-w-5xl flex-col gap-1 rounded-3xl border border-border/70 bg-card/90 p-3 text-[0.62rem] uppercase tracking-[0.28em] text-muted-foreground shadow-lg backdrop-blur-md md:hidden">
          {sectionIds.map(({ id, key }) => (
            <Link
              key={id}
              href={`#${id}`}
              className="rounded-2xl px-4 py-2 transition hover:bg-primary/10 hover:text-primary"
              onClick={() => setOpen(false)}
            >
              {messages.nav[key]}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
