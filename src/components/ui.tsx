/** Shared primitives: buttons, section headers, eyebrows. */

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-wide transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 motion-reduce:hover:translate-y-0";

const BUTTON_VARIANTS = {
  wine: "bg-wine text-cream hover:bg-wine-deep",
  tangerine: "bg-tangerine text-ink hover:brightness-105",
  butter: "bg-butter text-ink hover:brightness-105",
  cream: "bg-cream text-wine hover:bg-cream-deep",
  outline: "border-2 border-wine text-wine hover:bg-wine hover:text-cream",
  outlineCream: "border-2 border-cream/70 text-cream hover:bg-cream hover:text-wine",
} as const;

type Variant = keyof typeof BUTTON_VARIANTS;

export function ButtonLink({
  variant = "wine",
  className = "",
  external = false,
  href,
  children,
  ...rest
}: {
  variant?: Variant;
  className?: string;
  external?: boolean;
  href: string;
  children: ReactNode;
} & Omit<ComponentProps<"a">, "href" | "children" | "className">) {
  const classes = `${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${className}`;

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}

export function Button({
  variant = "wine",
  className = "",
  children,
  ...rest
}: { variant?: Variant; className?: string; children: ReactNode } & Omit<
  ComponentProps<"button">,
  "className" | "children"
>) {
  return (
    <button className={`${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function Eyebrow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] ${className}`}
    >
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  tone = "ink",
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  tone?: "ink" | "cream";
}) {
  const alignment = align === "center" ? "text-center mx-auto items-center" : "items-start";
  const titleTone = tone === "cream" ? "text-cream" : "text-wine";
  const introTone = tone === "cream" ? "text-cream/80" : "text-ink-soft";
  const eyebrowTone = tone === "cream" ? "text-butter" : "text-rust";

  return (
    <div className={`flex max-w-2xl flex-col gap-4 ${alignment}`}>
      {eyebrow ? <Eyebrow className={eyebrowTone}>{eyebrow}</Eyebrow> : null}
      <h2
        className={`font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl ${titleTone}`}
      >
        {title}
      </h2>
      {intro ? <p className={`text-lg leading-relaxed ${introTone}`}>{intro}</p> : null}
    </div>
  );
}

/** Instagram glyph, used in the nav and footer. */
export function InstagramIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.2.05 1.8.25 2.2.42.6.22 1 .48 1.4.9.43.42.7.83.92 1.4.17.42.37 1.05.42 2.24.06 1.28.07 1.66.07 4.88s0 3.6-.07 4.88c-.05 1.19-.25 1.82-.42 2.24-.22.57-.49.98-.91 1.4-.43.42-.84.68-1.4.9-.43.17-1.06.37-2.25.42-1.27.06-1.65.07-4.87.07s-3.6 0-4.88-.07c-1.19-.05-1.82-.25-2.24-.42a3.8 3.8 0 0 1-1.4-.9 3.8 3.8 0 0 1-.91-1.4c-.17-.42-.37-1.05-.42-2.24C2.2 15.6 2.2 15.22 2.2 12s0-3.6.07-4.88c.05-1.19.25-1.82.42-2.24.22-.57.48-.98.9-1.4a3.8 3.8 0 0 1 1.41-.9c.42-.18 1.05-.38 2.24-.43C8.4 2.2 8.78 2.2 12 2.2Zm0 1.98c-3.17 0-3.54.01-4.79.07-1.15.05-1.78.24-2.19.4-.55.22-.95.47-1.36.88-.41.41-.66.8-.88 1.36-.16.41-.35 1.04-.4 2.19-.06 1.25-.07 1.62-.07 4.79s.01 3.54.07 4.79c.05 1.15.24 1.78.4 2.19.22.55.47.95.88 1.36.41.41.81.66 1.36.88.41.16 1.04.35 2.19.4 1.25.06 1.62.07 4.79.07s3.54-.01 4.79-.07c1.15-.05 1.78-.24 2.19-.4.55-.22.95-.47 1.36-.88.41-.41.66-.81.88-1.36.16-.41.35-1.04.4-2.19.06-1.25.07-1.62.07-4.79s-.01-3.54-.07-4.79c-.05-1.15-.24-1.78-.4-2.19a3.66 3.66 0 0 0-.88-1.36 3.66 3.66 0 0 0-1.36-.88c-.41-.16-1.04-.35-2.19-.4-1.25-.06-1.62-.07-4.79-.07Zm0 3.37a5.45 5.45 0 1 1 0 10.9 5.45 5.45 0 0 1 0-10.9Zm0 8.99a3.54 3.54 0 1 0 0-7.08 3.54 3.54 0 0 0 0 7.08Zm6.94-9.21a1.27 1.27 0 1 1-2.55 0 1.27 1.27 0 0 1 2.55 0Z" />
    </svg>
  );
}

export function WhatsAppIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.47 1.34 4.98L2 22l5.2-1.36a9.94 9.94 0 0 0 4.84 1.24h.01c5.49 0 9.95-4.46 9.95-9.96 0-2.66-1.04-5.16-2.92-7.04A9.88 9.88 0 0 0 12.04 2Zm0 18.13h-.01a8.26 8.26 0 0 1-4.21-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.24 8.24 0 0 1-1.26-4.4c0-4.56 3.71-8.27 8.28-8.27 2.21 0 4.28.86 5.84 2.43a8.2 8.2 0 0 1 2.42 5.85c0 4.56-3.71 8.25-8.27 8.25Zm4.53-6.18c-.25-.13-1.47-.72-1.7-.8-.22-.09-.39-.13-.55.12-.16.25-.63.8-.77.96-.14.17-.28.19-.53.06-.25-.12-1.05-.38-2-1.23a7.5 7.5 0 0 1-1.38-1.72c-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.09-.16.04-.31-.02-.44-.06-.12-.55-1.34-.76-1.83-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.42.06-.64.31-.22.25-.84.82-.84 2s.86 2.32.98 2.48c.12.17 1.7 2.6 4.12 3.64.58.25 1.02.4 1.37.51.58.19 1.1.16 1.52.1.46-.07 1.42-.58 1.62-1.15.2-.56.2-1.05.14-1.15-.06-.1-.22-.16-.47-.28Z" />
    </svg>
  );
}
