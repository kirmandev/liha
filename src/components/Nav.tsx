"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { NAV_LINKS, site } from "@/content/site";
import { Wordmark } from "./Wordmark";
import { ButtonLink, InstagramIcon } from "./ui";

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // The drawer closes on the link press itself rather than by watching
  // `pathname` in an effect — same result, one render instead of a cascade.
  const close = () => setOpen(false);

  // Lock scroll only while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-wine/10 bg-cream/85 backdrop-blur-md">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8"
      >
        <Link href="/" className="text-wine" aria-label={`${site.fullName} — home`}>
          <Wordmark className="text-2xl" />
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    active ? "bg-wine text-cream" : "text-ink hover:bg-blush"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href={site.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full p-2 text-wine transition-colors hover:bg-blush"
            aria-label={`${site.name} on Instagram`}
          >
            <InstagramIcon />
          </a>
          <ButtonLink href="/custom" variant="wine" className="px-5 py-2.5">
            Order a cake
          </ButtonLink>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="flex size-11 items-center justify-center rounded-full text-wine transition-colors hover:bg-blush md:hidden"
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-wine/10 bg-cream px-5 pb-6 pt-2 md:hidden"
      >
        <ul className="flex flex-col">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={close}
                aria-current={pathname === link.href ? "page" : undefined}
                className="font-display block border-b border-wine/10 py-4 text-2xl font-semibold text-wine"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-col gap-3">
          <ButtonLink href="/custom" variant="wine" onClick={close}>
            Order a custom cake
          </ButtonLink>
          <ButtonLink href={site.instagram.url} external variant="outline">
            <InstagramIcon className="size-4" />
            {site.instagram.handle}
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
