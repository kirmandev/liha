/**
 * Corporate and event work.
 *
 * VERIFY BEFORE LAUNCH — the client names below are inferred from her Instagram
 * highlight titles ("Corporate", "Haryali Nov-25", "Haryali Feb-25",
 * "LGS Grammar Fest") and a summary of her profile. They have not been
 * confirmed by the owner. Set `verified: true` on each one she confirms, and
 * delete any she does not. `clients` only renders the verified entries.
 */

export type Client = { name: string; context: string; verified: boolean };

const CLIENT_CANDIDATES: Client[] = [
  { name: "HGR by Marriott", context: "Hospitality", verified: false },
  { name: "Radisson Blu", context: "Hospitality", verified: false },
  { name: "LGS Grammar", context: "School festival", verified: false },
  { name: "Haryali", context: "Seasonal exhibition, Nov 2025 & Feb 2026", verified: false },
];

export const clients = CLIENT_CANDIDATES.filter((client) => client.verified);

/** True while the client list is still unverified — used to keep the page honest. */
export const hasVerifiedClients = clients.length > 0;

export type CorporateOffer = {
  id: string;
  title: string;
  body: string;
  accent: "wine" | "rust" | "butter" | "pistachio" | "tangerine" | "blush";
};

export const offers: CorporateOffer[] = [
  {
    id: "hampers",
    title: "Gift hampers",
    body: "Eid, Christmas, year-end and client thank-yous. Mixed boxes of cookies, brownies and loaves, packed to give away rather than to carry home.",
    accent: "wine",
  },
  {
    id: "dessert-tables",
    title: "Dessert tables",
    body: "Launches, exhibitions and office events. Quantities scaled to your headcount, styled to sit together on one table.",
    accent: "tangerine",
  },
  {
    id: "branded",
    title: "Branded boxes",
    body: "Your logo on the packaging, your colours on the cake. Useful when the dessert is the marketing.",
    accent: "pistachio",
  },
  {
    id: "bulk",
    title: "Bulk & recurring",
    body: "Standing weekly or monthly orders for offices and cafés. Fixed pricing once volumes are agreed.",
    accent: "butter",
  },
];

export const EVENT_TYPES = [
  "Office or corporate gifting",
  "Product launch or exhibition",
  "School or university event",
  "Wedding or large celebration",
  "Recurring or wholesale supply",
  "Something else",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];
