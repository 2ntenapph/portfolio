"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Download,
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Send,
} from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { messages } = useLocale();
  const leftColumnRef = useRef<HTMLDivElement | null>(null);
  const skillsHeadingRef = useRef<HTMLDivElement | null>(null);
  const [leftColumnHeight, setLeftColumnHeight] = useState<number | null>(null);
  const [skillsHeadingHeight, setSkillsHeadingHeight] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updateHeight = () => {
      const element = leftColumnRef.current;
      if (!element) {
        setLeftColumnHeight(null);
        return;
      }

      const isDesktop = window.matchMedia("(min-width: 768px)").matches;
      if (!isDesktop) {
        setLeftColumnHeight(null);
        return;
      }

      const nextHeight = element.offsetHeight;
      setLeftColumnHeight((current) =>
        current === nextHeight ? current : nextHeight
      );
    };

    updateHeight();

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && leftColumnRef.current) {
      observer = new ResizeObserver(updateHeight);
      observer.observe(leftColumnRef.current);
    }

    window.addEventListener("resize", updateHeight);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [messages]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updateHeadingHeight = () => {
      const element = skillsHeadingRef.current;
      if (!element) {
        setSkillsHeadingHeight(0);
        return;
      }

      const isDesktop = window.matchMedia("(min-width: 768px)").matches;
      if (!isDesktop) {
        setSkillsHeadingHeight(0);
        return;
      }

      const nextHeight = element.offsetHeight;
      setSkillsHeadingHeight((current) =>
        current === nextHeight ? current : nextHeight
      );
    };

    updateHeadingHeight();

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && skillsHeadingRef.current) {
      observer = new ResizeObserver(updateHeadingHeight);
      observer.observe(skillsHeadingRef.current);
    }

    window.addEventListener("resize", updateHeadingHeight);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateHeadingHeight);
    };
  }, [messages]);

  const skillsCardHeight =
    leftColumnHeight !== null
      ? Math.max(leftColumnHeight - skillsHeadingHeight, 0)
      : null;

  const skillsCardStyle =
    skillsCardHeight !== null
      ? {
          height: `${skillsCardHeight}px`,
          maxHeight: `${skillsCardHeight}px`,
        }
      : undefined;
  const heroNameParts = messages.sections.heroTitle.split(" ");
  const firstName = heroNameParts.shift() ?? messages.sections.heroTitle;
  const lastName = heroNameParts.join(" ");

  const socialLinks = [
    {
      icon: Mail,
      href: `mailto:${messages.contact.email}`,
      label: messages.sections.contactEmailLabel,
      external: false,
    },
    {
      icon: Linkedin,
      href: "https://www.linkedin.com/in/anton-filippov-2a640022b",
      label: "LinkedIn",
      external: true,
    },
    {
      icon: Github,
      href: "https://github.com/2ntenapph",
      label: "GitHub",
      external: true,
    },
    {
      icon: Send,
      href: "https://t.me/anttenn",
      label: "Telegram",
      external: true,
    },
  ];

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center gap-12 px-6 py-12 sm:px-12 md:py-16">
      <section
        id="summary"
        className="flex w-full flex-col items-center gap-6 text-center"
      >
        <p className="text-xs uppercase tracking-[0.5em] text-primary/80">
          {messages.sections.heroSubtitle}
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          <span className="text-muted-foreground">{firstName}</span>
          {lastName && (
            <span className="block text-foreground md:mt-1">{lastName}</span>
          )}
        </h1>
        <p className="max-w-2xl text-balance text-base text-muted-foreground sm:text-lg md:text-xl">
          {messages.sections.heroTagline}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="#projects">
              {messages.nav.projects}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="#contact">
              {messages.nav.contact}
              <Mail className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section
        aria-label="Social links"
        className="flex w-full justify-center gap-4"
      >
        <div className="flex items-center justify-center gap-4 rounded-full border border-border/60 bg-card/80 px-6 py-3 backdrop-blur">
          {socialLinks.map(({ icon: Icon, href, label, external }) => (
            <Link
              key={label}
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noreferrer" : undefined}
              className="group flex h-12 w-12 items-center justify-center rounded-full border border-transparent bg-background/80 text-muted-foreground shadow-sm transition duration-200 hover:border-primary/40 hover:text-primary"
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="flex w-full flex-col gap-10 md:flex-row md:items-stretch">
        <div
          ref={leftColumnRef}
          className="flex w-full flex-1 min-h-0 flex-col gap-6"
        >
          <InfoPanel title={messages.sections.summaryTitle}>
            <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
              {messages.sections.summaryBody}
            </p>
          </InfoPanel>

          <section id="education" className="space-y-4">
            <PanelHeading>{messages.sections.educationTitle}</PanelHeading>
            <div className="grid gap-3">
              {messages.education.map((entry) => (
                <EducationBadge
                  key={`${entry.school}-${entry.faculty}`}
                  abbr={getInitials(entry.school)}
                  logo={entry.logo}
                >
                  <div className="flex flex-col">
                    <span className="text-base font-semibold text-foreground">
                      {entry.school}
                    </span>
                    <span className="text-sm text-primary">
                      {entry.faculty}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className="text-xs text-muted-foreground">
                      {entry.details}
                    </span>
                    <span className="mt-2 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
                      {entry.period}
                    </span>
                  </div>
                </EducationBadge>
              ))}
            </div>
          </section>
        </div>

        <section id="skills" className="flex w-full flex-1 min-h-0 flex-col">
          <div ref={skillsHeadingRef} className="pb-4 md:pb-6">
            <PanelHeading>{messages.sections.skillsTitle}</PanelHeading>
          </div>
          <div
            data-steam-obstacle
            className="group flex flex-1 min-h-0 flex-col overflow-hidden rounded-3xl border border-border/60 bg-card/80 p-6 shadow-lg backdrop-blur transition hover:border-primary/40"
            style={skillsCardStyle}
          >
            <div className="flex flex-1 min-h-0 flex-col gap-6 overflow-y-auto pr-1">
              {messages.skills.map((group) => (
                <div key={group.category} className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">
                    {group.category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground transition hover:border-primary/40 hover:text-primary"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </section>

      <section id="projects" className="w-full max-w-5xl space-y-6">
        <SectionHeading>{messages.sections.projectsTitle}</SectionHeading>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {messages.projects.map((project) => (
            <div
              key={project.title}
              className="group flex h-full flex-col justify-between space-y-4 rounded-3xl border border-border/60 bg-card/70 p-6 shadow-lg backdrop-blur transition hover:border-primary/40"
              data-steam-obstacle
            >
              <div>
                <h3 className="text-lg font-semibold text-foreground transition group-hover:text-primary">
                  {project.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {project.description}
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2 text-[0.7rem] uppercase tracking-wide text-muted-foreground">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border/50 bg-background/80 px-3 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <Link
                  href={project.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:text-primary"
                >
                  <span>{messages.sections.projectLinkLabel}</span>
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="resume"
        data-steam-obstacle
        className="group w-full max-w-4xl rounded-[28px] border border-border/60 bg-card/80 px-6 py-10 text-center shadow-xl backdrop-blur transition hover:border-primary/40 sm:px-10"
      >
        <SectionHeading>{messages.sections.resumeTitle}</SectionHeading>
        <p className="mt-4 text-sm text-muted-foreground sm:text-base">
          {messages.sections.resumeDescription}
        </p>
        <Button
          asChild
          size="lg"
          className="mt-6 inline-flex items-center justify-center gap-2"
        >
          <Link href={messages.resume.url} target="_blank" rel="noreferrer">
            {messages.sections.resumeCta}
            <Download className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </section>

      <section id="contact" className="w-full max-w-4xl">
        <div
          data-steam-obstacle
          className="group rounded-[28px] border border-border/60 bg-card/80 p-6 shadow-xl backdrop-blur transition hover:border-primary/40 sm:p-8 space-y-6"
        >
          <SectionHeading>{messages.sections.contactTitle}</SectionHeading>
          <div className="grid gap-4 sm:grid-cols-2">
            <ContactCard
              icon={<Mail className="h-5 w-5" />}
              label={messages.sections.contactEmailLabel}
              value={messages.contact.email}
              href={`mailto:${messages.contact.email}`}
            />
            <ContactCard
              icon={<MapPin className="h-5 w-5" />}
              label={messages.sections.contactLocationLabel}
              value={messages.contact.location}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function PanelHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-sm font-semibold uppercase tracking-[0.5em] text-muted-foreground">
      {children}
    </h2>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-3xl font-semibold tracking-tight text-center text-foreground">
      {children}
    </h2>
  );
}

function InfoPanel({
  title,
  highlight,
  children,
}: {
  title: string;
  highlight?: string;
  children: ReactNode;
}) {
  return (
    <>
      <PanelHeading>{title}</PanelHeading>
      <div
        data-steam-obstacle
        className="group rounded-3xl border border-border/60 bg-card/80 p-6 shadow-lg backdrop-blur transition hover:border-primary/40"
      >
        <div className="space-y-3 text-left">
          <div>{children}</div>
        </div>
      </div>
    </>
  );
}

function EducationBadge({
  abbr,
  logo,
  children,
}: {
  abbr: string;
  logo?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm transition hover:border-primary/40">
      <div className="flex h-10 w-10 items-center justify-center overflow-hidden">
        {logo ? (
          <Image
            src={logo}
            alt={abbr}
            width={40}
            height={40}
            className=""
          />
        ) : (
          <span className="text-sm font-semibold text-primary">{abbr}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2">{children}</div>
    </div>
  );
}

function ContactCard({
  icon,
  label,
  value,
  href,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div
      data-steam-obstacle
      className="group flex h-full flex-col gap-4 rounded-3xl border border-border/60 bg-card/70 p-6 shadow-lg transition hover:border-primary/40"
    >
      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.4em] text-muted-foreground group-hover:text-primary">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </span>
        {label}
      </div>
      <p className="text-lg font-medium text-foreground group-hover:text-foreground">
        {value}
      </p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

function getInitials(value: string) {
  const words = value.split(/\s+/).filter(Boolean).slice(0, 2);
  if (words.length === 0) {
    return "ED";
  }
  return words
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("")
    .padEnd(2, "•");
}
