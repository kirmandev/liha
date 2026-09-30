import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";

import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { StickyOrderBar } from "@/components/StickyOrderBar";
import { site } from "@/content/site";
import { CatalogueProvider } from "@/lib/catalogue-context";
import { CmsUnavailableError, getCatalogue } from "@/lib/cms";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.fullName} — custom cakes & pastry in ${site.address.city}`,
    template: `%s — ${site.fullName}`,
  },
  description: site.shortDescription,
  keywords: [
    "custom cakes Lahore",
    "birthday cakes Lahore",
    "bakery Faisal Town",
    "pastry chef Lahore",
    "Dubai kunafa cake Lahore",
    "brownies Lahore",
  ],
  openGraph: {
    type: "website",
    locale: "en_PK",
    siteName: site.fullName,
    title: `${site.fullName} — custom cakes & pastry in ${site.address.city}`,
    description: site.shortDescription,
    url: site.url,
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

/**
 * Structured data. Only facts we can stand behind go in here — the address and
 * phone are confirmed; hours are omitted entirely rather than guessed, since a
 * wrong `openingHours` in search results is worse than none.
 */
function StructuredData() {
  const json = {
    "@context": "https://schema.org",
    "@type": "Bakery",
    name: site.fullName,
    description: site.shortDescription,
    url: site.url,
    telephone: site.phone.intl,
    priceRange: "Rs 120–1299",
    servesCuisine: "Bakery, Desserts, Patisserie",
    address: {
      "@type": "PostalAddress",
      addressLocality: `${site.address.locality}, ${site.address.city}`,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    areaServed: { "@type": "City", name: site.address.city },
    sameAs: [site.instagram.url, site.foodpanda.url],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: site.foodpanda.rating,
      reviewCount: site.foodpanda.reviewCount,
      bestRating: 5,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}

/**
 * Shown when the CMS cannot be reached at all.
 *
 * The whole shop reads its catalogue from one place, so there is no partial
 * degradation to offer — a menu with no prices is worse than an honest notice.
 * The phone number is hardcoded here rather than read from the CMS for the
 * obvious reason.
 */
function Unavailable() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 text-center">
      <div>
        <h1 className="font-display text-4xl font-semibold text-wine">Back shortly</h1>
        <p className="mt-4 max-w-sm text-ink-soft">
          Our menu is briefly unavailable. To place an order right now, message us on WhatsApp at{" "}
          <a className="font-semibold text-wine underline" href={`tel:${site.phone.intl}`}>
            {site.phone.display}
          </a>
          .
        </p>
      </div>
    </div>
  );
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Fetched once here and handed to every client component that needs prices,
  // so the cart never has to show a loading state to compute a total.
  let catalogue = null;
  try {
    catalogue = await getCatalogue();
  } catch (error) {
    if (!(error instanceof CmsUnavailableError)) throw error;
    // Logged for us, never shown to the visitor — the reason the CMS is
    // unreachable is operational detail, not customer-facing copy.
    console.error(`[storefront] catalogue unavailable: ${error.message}`);
  }

  if (!catalogue) {
    return (
      <html lang="en" className={`${fraunces.variable} ${jakarta.variable} h-full`}>
        <body className="flex min-h-full flex-col bg-cream">
          <Unavailable />
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className={`${fraunces.variable} ${jakarta.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-cream">
        <StructuredData />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-wine focus:px-5 focus:py-3 focus:text-cream"
        >
          Skip to content
        </a>
        <CatalogueProvider catalogue={catalogue}>
          <Nav />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
          <StickyOrderBar />
        </CatalogueProvider>
        {/* Clears the mobile sticky bar so it never covers the footer's last line. */}
        <div aria-hidden className="h-16 md:hidden" />
      </body>
    </html>
  );
}
