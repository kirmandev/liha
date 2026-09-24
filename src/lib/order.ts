/**
 * Order submission — the seam between checkout and wherever orders actually go.
 *
 * Today that is a WhatsApp message to LIHA's number, which is how the business
 * already takes orders: the Website SRS has the site charge nobody (§5, §13),
 * staff phone the customer to confirm payment (§6), and delivery is quoted by
 * hand (§9). Nothing here needs a server.
 *
 * When order persistence lands, `submitOrder` is the only function that changes.
 * Checkout, the cart and the confirmation page all speak to this interface and
 * know nothing about the transport behind it.
 */

import { PAYMENT_METHODS, site, type PaymentMethod } from "@/content/site";
import type { OrderTotals, ResolvedLine } from "./pricing";
import { buildWhatsAppUrl } from "./whatsapp";

export type CustomerDetails = {
  name: string;
  phone: string;
  address: string;
  note?: string;
  discountCode?: string;
  paymentMethod: PaymentMethod;
};

export type OrderDraft = {
  customer: CustomerDetails;
  lines: ResolvedLine[];
  totals: OrderTotals;
};

export type SubmittedOrder = {
  /**
   * A short reference both sides can quote in the chat. Deliberately *not*
   * called an order number: without a backend nothing allocates or stores a
   * sequential one, and presenting a random string as an authoritative order
   * number would be a promise the site cannot keep.
   */
  reference: string;
  placedAt: string;
  /** Where the customer is sent to actually deliver the order. */
  handoffUrl: string;
  draft: OrderDraft;
};

const REFERENCE_ALPHABET = "ACDEFGHJKLMNPQRTUVWXY349";

/**
 * `LIHA-240926-K7QF`. Date first so staff can sort a chat backlog by eye;
 * four random characters after, from an alphabet with the glyphs people misread
 * over a phone (0/O, 1/I/L, 5/S, 8/B, 2/Z) removed.
 *
 * `at` and `random` are injected so this is deterministic under test.
 */
export function generateReference(at: Date = new Date(), random: () => number = Math.random): string {
  const yy = String(at.getFullYear()).slice(-2);
  const mm = String(at.getMonth() + 1).padStart(2, "0");
  const dd = String(at.getDate()).padStart(2, "0");
  let suffix = "";
  for (let i = 0; i < 4; i += 1) {
    suffix += REFERENCE_ALPHABET[Math.floor(random() * REFERENCE_ALPHABET.length)];
  }
  return `LIHA-${yy}${mm}${dd}-${suffix}`;
}

export function paymentMethodLabel(id: PaymentMethod): string {
  return PAYMENT_METHODS.find((method) => method.id === id)?.label ?? id;
}

/**
 * Validates a draft, returning field-keyed messages. Empty object means valid.
 *
 * Deliberately not validating the discount code: SRS §7 requires codes to be
 * checked against the backend and burned on redemption. There is no backend
 * yet, and shipping a client-side check would put every valid code in the
 * JavaScript bundle. The field is captured and passed to staff instead.
 */
export function validateDraft(draft: OrderDraft): Record<string, string> {
  const errors: Record<string, string> = {};
  const { name, phone, address } = draft.customer;

  if (name.trim().length < 2) errors.name = "Please tell us your name.";

  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 13) {
    errors.phone = "Please enter a valid phone number we can reach you on.";
  }

  if (address.trim().length < 10) {
    errors.address = "Please give a full address, including the area.";
  }

  if (draft.lines.length === 0) errors.cart = "Your cart is empty.";

  if (!draft.totals.meetsMinimum) {
    errors.cart = `Minimum order is Rs ${site.commerce.minOrderValue}. Add Rs ${draft.totals.shortOfMinimum} more to check out.`;
  }

  return errors;
}

/**
 * Hands the order off. Pure: it composes and returns, it does not navigate —
 * the caller decides when to open the URL, which keeps this testable.
 */
export function submitOrder(
  draft: OrderDraft,
  at: Date = new Date(),
  random: () => number = Math.random,
): SubmittedOrder {
  const reference = generateReference(at, random);

  const handoffUrl = buildWhatsAppUrl({
    kind: "cartOrder",
    reference,
    name: draft.customer.name.trim(),
    phone: draft.customer.phone.trim(),
    address: draft.customer.address.trim(),
    paymentMethod: paymentMethodLabel(draft.customer.paymentMethod),
    note: draft.customer.note?.trim() || undefined,
    discountCode: draft.customer.discountCode?.trim().toUpperCase() || undefined,
    items: draft.lines.map((entry) => ({
      name: entry.product.name,
      qty: entry.line.qty,
      addOns: entry.addOns.map((addOn) => addOn.name),
      total: entry.total,
    })),
    subtotal: draft.totals.subtotal,
    taxRatePercent: draft.totals.taxRatePercent,
    tax: draft.totals.tax,
    total: draft.totals.total,
  });

  return { reference, placedAt: at.toISOString(), handoffUrl, draft };
}
