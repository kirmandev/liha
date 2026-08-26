import Link from "next/link";

import { NAV_LINKS, site } from "@/content/site";
import { LineArt } from "./LineArt";
import { Wordmark } from "./Wordmark";
import { InstagramIcon, WhatsAppIcon } from "./ui";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 bg-wine text-cream">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Wordmark className="text-4xl text-cream" />
            <p className="mt-4 max-w-sm text-cream/75 leading-relaxed">{site.shortDescription}</p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href={site.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-cream/30 p-2.5 transition-colors hover:bg-cream hover:text-wine"
                aria-label={`${site.name} on Instagram`}
              >
                <InstagramIcon />
              </a>
              <a
                href={`https://wa.me/${site.phone.wa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-cream/30 p-2.5 transition-colors hover:bg-cream hover:text-wine"
                aria-label={`Message ${site.name} on WhatsApp`}
              >
                <WhatsAppIcon />
              </a>
            </div>
          </div>

          <nav aria-label="Footer">
            <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-butter">
              Explore
            </h2>
            <ul className="mt-5 flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-cream/80 transition-colors hover:text-cream">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-butter">
              Find her
            </h2>
            <ul className="mt-5 flex flex-col gap-3 text-cream/80">
              <li>
                <a href={`tel:${site.phone.intl.replace(/\s/g, "")}`} className="hover:text-cream">
                  {site.phone.display}
                </a>
              </li>
              <li>
                {site.address.locality}, {site.address.city}
              </li>
              <li>
                <a
                  href={site.foodpanda.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cream"
                >
                  Order on Foodpanda
                </a>
              </li>
              {site.openingHours ? null : (
                <li className="text-cream/50">Hours on request — just message.</li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center gap-6 border-t border-cream/15 pt-8 sm:flex-row sm:justify-between">
          <p className="text-sm text-cream/55">
            © {year} {site.fullName}. Baked in {site.address.city}.
          </p>
          <LineArt art="whisk" className="size-10 text-cream/30" strokeWidth={2.5} />
        </div>
      </div>
    </footer>
  );
}
