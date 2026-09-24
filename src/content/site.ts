/**
 * Single source of truth for business facts.
 *
 * Anything not yet confirmed by the owner is `null` and marked TODO. The UI
 * hides those sections rather than inventing a value — see AGENTS notes in the
 * design spec under "Honesty constraints".
 */

export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type OpeningHours = Record<Weekday, { open: string; close: string } | null>;

export const site = {
  name: "LIHA",
  fullName: "LIHA | bakeshop",
  tagline: "Trained in Dubai. Baked in Lahore.",
  shortDescription:
    "Pastry chef and custom baker in Faisal Town, Lahore. Signature cakes, mini loaves, shot boxes, brownies and cookies — plus custom cakes made to your brief.",

  /** TODO: replace once the domain is registered. Used by sitemap, robots and OG tags. */
  url: "https://lihabakeshop.com",

  phone: {
    /** As she writes it locally. */
    display: "0329 6286072",
    /** E.164, for `tel:` links and structured data. */
    intl: "+92 329 6286072",
    /** Digits only, no plus — the format wa.me expects. */
    wa: "923296286072",
  },

  /** TODO: confirm — no public email found. Powers the desktop no-WhatsApp fallback. */
  email: null as string | null,

  instagram: {
    url: "https://www.instagram.com/lihabakeshop/",
    handle: "@lihabakeshop",
  },

  foodpanda: {
    url: "https://www.foodpanda.pk/shop/u18n/liha-bakeshop",
    /** Verified 2026-08-26 via search listing. Shown as attributed social proof. */
    rating: 4.9,
    reviewCount: 37,
  },

  address: {
    locality: "Faisal Town",
    city: "Lahore",
    region: "Punjab",
    country: "PK",
    countryName: "Pakistan",
  },

  /** TODO: confirm with owner. Rendered only when non-null. */
  openingHours: null as OpeningHours | null,

  /** TODO: confirm delivery radius and charges. Rendered only when non-null. */
  delivery: null as { areas: string[]; charge: string; note?: string } | null,

  /** From her menu card: "Please place your order, for a custom cake 4 days in advance." */
  customLeadTimeDays: 4,

  credentials: {
    formerly: "Five-star resorts, UAE",
    now: "Faisal Town, Lahore",
  },

  /**
   * Checkout settings. Every number here is a policy decision, not a constant —
   * kept in one place so changing it is one edit, and so the values the SRS only
   * *recommends* are visibly distinguishable from the ones it confirms.
   */
  commerce: {
    /** SRS §9 recommends Rs 500 as a starting default. TODO: confirm with owner. */
    minOrderValue: 500,
    /** SRS §9: LIHA contributes a fixed amount; the customer covers the rest. Confirmed. */
    deliverySubsidy: 100,
    /**
     * SRS §5 wants checkout built tax-ready with an admin-configurable rate that
     * defaults to off, pending advice on Punjab Sales Tax on Services. A tax line
     * appears only when this is greater than zero.
     */
    taxRatePercent: 0,
    /**
     * TODO: owner to provide the actual account details (SRS §13). Until then the
     * checkout tells the customer staff will send them rather than showing a
     * number we invented.
     */
    payment: {
      jazzCashNumber: null as string | null,
      bankAccount: null as { bank: string; title: string; number: string } | null,
    },
  },
} as const;

export type PaymentMethod = "jazzcash" | "bank";

export const PAYMENT_METHODS: ReadonlyArray<{
  id: PaymentMethod;
  label: string;
  hint: string;
}> = [
  {
    id: "jazzcash",
    label: "JazzCash",
    hint: "Send the amount to our JazzCash number, then share the screenshot.",
  },
  {
    id: "bank",
    label: "Bank transfer",
    hint: "Transfer to our account, then share the screenshot.",
  },
];

export const NAV_LINKS = [
  { href: "/menu", label: "Menu" },
  { href: "/custom", label: "Custom cakes" },
  { href: "/corporate", label: "Corporate" },
  { href: "/about", label: "About" },
] as const;
