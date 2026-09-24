/**
 * Composes the pre-filled WhatsApp messages the whole site sends.
 *
 * Every order button and both forms route through here, so the phone number
 * and the message format have exactly one definition. Pure functions only —
 * no React, no DOM — which is what makes them testable without a browser.
 */

import { site } from "@/content/site";
import { formatLongDate, formatPKR } from "./format";

export type OrderPayload =
  | { kind: "general" }
  | {
      kind: "product";
      product: string;
      category: string;
      /** PKR. Omitted for quote-based items. */
      price?: number;
      note?: string;
    }
  | {
      kind: "custom";
      name: string;
      occasion: string;
      servings: string;
      flavour: string;
      /** `YYYY-MM-DD`. */
      date: string;
      budget: string;
      details?: string;
    }
  | {
      kind: "corporate";
      name: string;
      organisation: string;
      eventType: string;
      /** `YYYY-MM-DD`, or empty when the date is not fixed yet. */
      date?: string;
      quantity: string;
      details?: string;
    }
  | {
      kind: "cartOrder";
      reference: string;
      name: string;
      phone: string;
      address: string;
      /** Human label, e.g. "JazzCash". */
      paymentMethod: string;
      note?: string;
      discountCode?: string;
      items: Array<{
        name: string;
        qty: number;
        /** Names of the sauces added to this line. */
        addOns: string[];
        /** PKR for the whole line, add-ons included. */
        total: number;
      }>;
      subtotal: number;
      taxRatePercent: number;
      tax: number;
      total: number;
    };

/**
 * Joins message lines, dropping any that an optional field short-circuited to
 * `undefined` or `false` — so an absent field never leaves a dangling label.
 *
 * An empty string is kept: those are the deliberate blank lines that keep the
 * message readable in the chat. Filtering on truthiness would swallow them.
 */
function lines(...parts: Array<string | false | null | undefined>): string {
  return parts
    .filter((part): part is string => part !== null && part !== undefined && part !== false)
    .join("\n");
}

export function composeMessage(payload: OrderPayload): string {
  switch (payload.kind) {
    case "general":
      return `Hi ${site.name}! I found you through your website and I'd like to ask about an order.`;

    case "product":
      return lines(
        `Hi ${site.name}! I'd like to order from your menu:`,
        "",
        `• ${payload.product}${payload.note ? ` (${payload.note})` : ""}`,
        `  ${payload.category}${payload.price != null ? ` — ${formatPKR(payload.price)}` : ""}`,
        "",
        "Is this available?",
      );

    case "custom":
      return lines(
        `Hi ${site.name}! I'd like to order a custom cake.`,
        "",
        `Name: ${payload.name}`,
        `Occasion: ${payload.occasion}`,
        `Servings: ${payload.servings}`,
        `Flavour: ${payload.flavour}`,
        `Needed by: ${formatLongDate(payload.date)}`,
        `Budget: ${payload.budget}`,
        payload.details && "",
        payload.details && `Design notes: ${payload.details}`,
        "",
        "I'll send a reference picture in this chat.",
      );

    case "corporate":
      return lines(
        `Hi ${site.name}! I'd like to talk about a corporate or event order.`,
        "",
        `Name: ${payload.name}`,
        `Organisation: ${payload.organisation}`,
        `Type: ${payload.eventType}`,
        `Quantity: ${payload.quantity}`,
        payload.date && `Date: ${formatLongDate(payload.date)}`,
        payload.details && "",
        payload.details && `Details: ${payload.details}`,
      );

    // The whole checkout, written out so staff can work the order straight from
    // the chat without opening anything else. This message *is* the order record
    // until a backend exists, so nothing the customer entered is summarised away.
    case "cartOrder":
      return lines(
        `Hi ${site.name}! I'd like to place this order from your website.`,
        "",
        `Ref: ${payload.reference}`,
        "",
        ...payload.items.map((item) =>
          lines(
            `• ${item.qty} × ${item.name} — ${formatPKR(item.total)}`,
            item.addOns.length > 0 && `  with ${item.addOns.join(", ")}`,
          ),
        ),
        "",
        `Subtotal: ${formatPKR(payload.subtotal)}`,
        payload.taxRatePercent > 0 && `Tax (${payload.taxRatePercent}%): ${formatPKR(payload.tax)}`,
        `Total: ${formatPKR(payload.total)}`,
        "",
        `Name: ${payload.name}`,
        `Phone: ${payload.phone}`,
        `Address: ${payload.address}`,
        `Paying by: ${payload.paymentMethod}`,
        payload.discountCode && `Discount code: ${payload.discountCode}`,
        payload.note && `Note: ${payload.note}`,
        "",
        "Please confirm the delivery charge and send the payment details.",
      );
  }
}

/** `https://wa.me/923296286072?text=…` */
export function buildWhatsAppUrl(payload: OrderPayload): string {
  return `https://wa.me/${site.phone.wa}?text=${encodeURIComponent(composeMessage(payload))}`;
}

const SUBJECTS: Record<OrderPayload["kind"], string> = {
  general: "Order enquiry",
  product: "Menu order",
  custom: "Custom cake enquiry",
  corporate: "Corporate & events enquiry",
  cartOrder: "Website order",
};

/**
 * Desktop fallback for visitors without WhatsApp. Returns `null` when no email
 * address is on file, so callers can hide the option instead of rendering a
 * `mailto:` that goes nowhere.
 */
export function buildMailtoUrl(payload: OrderPayload): string | null {
  if (!site.email) return null;
  const subject = encodeURIComponent(`${SUBJECTS[payload.kind]} — ${site.fullName}`);
  const body = encodeURIComponent(composeMessage(payload));
  return `mailto:${site.email}?subject=${subject}&body=${body}`;
}
