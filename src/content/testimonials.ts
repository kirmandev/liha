/**
 * Customer quotes.
 *
 * Deliberately empty. Inventing testimonials for a real business would put
 * words in real customers' mouths, so nothing is written here that she has not
 * actually received. The social proof shown on the site is the attributable
 * Foodpanda aggregate in `site.ts`, linked to its source.
 *
 * To fill this: take real quotes from her Instagram "reviews" highlight or her
 * Foodpanda page, with the reviewer's first name and the item they ordered.
 * Sections check `hasTestimonials` and are omitted while this is empty.
 */

export type Testimonial = {
  quote: string;
  author: string;
  /** What they ordered, e.g. "Dubai Kunafa Cake". */
  context?: string;
  /** Where the quote came from, so it stays attributable. */
  source: "instagram" | "foodpanda" | "whatsapp";
};

export const testimonials: Testimonial[] = [];

export const hasTestimonials = testimonials.length > 0;
