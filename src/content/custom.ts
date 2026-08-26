/** Options for the custom-cake enquiry form. */

/** Exactly the nine base flavours listed on her menu card — not free text. */
export const BASE_FLAVOURS = [
  "Chocolate",
  "Chocolate Malt",
  "Chocolate Fudge",
  "Lotus",
  "Pistachio",
  "Caramel",
  "Honey",
  "Red Velvet",
  "Vanilla",
] as const;

export const OCCASIONS = [
  "Birthday",
  "Anniversary",
  "Wedding or engagement",
  "Baby shower",
  "Graduation",
  "Corporate or office",
  "Just because",
] as const;

export const SERVING_SIZES = [
  "6–8 people",
  "10–15 people",
  "20–30 people",
  "40+ people",
  "Not sure yet",
] as const;

export const BUDGET_BANDS = [
  "Under Rs 3,000",
  "Rs 3,000 – 6,000",
  "Rs 6,000 – 10,000",
  "Rs 10,000+",
  "Guide me",
] as const;

export type BaseFlavour = (typeof BASE_FLAVOURS)[number];
export type Occasion = (typeof OCCASIONS)[number];
export type ServingSize = (typeof SERVING_SIZES)[number];
export type BudgetBand = (typeof BUDGET_BANDS)[number];

export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Tell her the brief",
    body: "Occasion, how many people, the flavour you want, and the date. Send a reference picture if you have one — most people do.",
  },
  {
    step: "02",
    title: "Get a quote",
    body: "She replies on WhatsApp with a price and confirms the design is doable for your date. No deposit until you are happy.",
  },
  {
    step: "03",
    title: "Collect or have it delivered",
    body: "Cakes are made fresh to your date, never made ahead and frozen.",
  },
] as const;
