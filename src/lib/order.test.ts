import { describe, expect, it } from "vitest";

import { site } from "@/content/site";
import { indexProducts } from "./catalogue";
import { CAKE, SAUCE_A, SLICE, makeCatalogue } from "./fixtures";
import {
  generateReference,
  paymentMethodLabel,
  submitOrder,
  validateDraft,
  type OrderDraft,
} from "./order";
import { createLine, orderTotals, resolveLines } from "./pricing";

const catalogue = makeCatalogue();
const index = indexProducts(catalogue);
const SETTINGS = { taxRatePercent: 0, minOrderValue: 500 };

function draft(
  overrides: Partial<OrderDraft["customer"]> = {},
  slugs = [[CAKE.slug, []]] as Array<[string, string[]]>,
): OrderDraft {
  const lines = resolveLines(
    slugs.map(([slug, addOns]) => createLine(slug, addOns, 1)),
    index,
  );
  return {
    customer: {
      name: "Ayesha Khan",
      phone: "0329 6286072",
      address: "House 12, Street 4, Faisal Town, Lahore",
      paymentMethod: "jazzcash",
      ...overrides,
    },
    lines,
    totals: orderTotals(lines, SETTINGS),
  };
}

describe("generateReference", () => {
  const at = new Date("2026-09-24T03:15:00Z");

  it("leads with the date so a chat backlog sorts by eye", () => {
    expect(generateReference(at, () => 0)).toMatch(/^LIHA-260924-/);
  });

  it("is deterministic given a fixed random source", () => {
    expect(generateReference(at, () => 0)).toBe(generateReference(at, () => 0));
  });

  it("avoids glyphs people misread over a phone", () => {
    const suffix = generateReference(at, () => 0.999).split("-")[2];
    expect(suffix).not.toMatch(/[01258BILOSZ]/);
  });

  it("produces a four-character suffix", () => {
    expect(generateReference(at, Math.random).split("-")[2]).toHaveLength(4);
  });
});

describe("validateDraft", () => {
  it("accepts a complete order", () => {
    expect(validateDraft(draft())).toEqual({});
  });

  it("rejects a missing name", () => {
    expect(validateDraft(draft({ name: " " })).name).toBeDefined();
  });

  it("rejects a phone number that is too short to call", () => {
    expect(validateDraft(draft({ phone: "12345" })).phone).toBeDefined();
  });

  it("accepts a phone number written with spaces or a country code", () => {
    expect(validateDraft(draft({ phone: "+92 329 6286072" })).phone).toBeUndefined();
    expect(validateDraft(draft({ phone: "0329-628-6072" })).phone).toBeUndefined();
  });

  it("rejects an address too short to deliver to", () => {
    expect(validateDraft(draft({ address: "Lahore" })).address).toBeDefined();
  });

  it("rejects an empty cart", () => {
    const empty = draft({}, []);
    expect(validateDraft(empty).cart).toBeDefined();
  });

  it("blocks checkout below the minimum order value", () => {
    const small = draft({}, [[SLICE.slug, []]]); // 150 against a 500 minimum
    expect(validateDraft(small).cart).toContain("500");
  });

  // SRS §7 requires codes to be validated and burned server-side. Until that
  // exists the field is captured, never judged — a client-side check would ship
  // every valid code in the bundle.
  it("does not judge the discount code", () => {
    expect(validateDraft(draft({ discountCode: "TOTALLY-FAKE" }))).toEqual({});
  });
});

describe("paymentMethodLabel", () => {
  it("resolves the human label", () => {
    expect(paymentMethodLabel("jazzcash")).toBe("JazzCash");
    expect(paymentMethodLabel("bank")).toBe("Bank transfer");
  });
});

describe("submitOrder", () => {
  const at = new Date("2026-09-24T03:15:00Z");
  const fixed = () => 0;

  it("returns a reference and echoes the draft back", () => {
    const order = submitOrder(draft(), at, fixed);
    expect(order.reference).toMatch(/^LIHA-260924-/);
    expect(order.draft.lines).toHaveLength(1);
    expect(order.placedAt).toBe(at.toISOString());
  });

  it("hands off to LIHA's WhatsApp number", () => {
    const order = submitOrder(draft(), at, fixed);
    expect(order.handoffUrl.startsWith(`https://wa.me/${site.phone.wa}?text=`)).toBe(true);
  });

  it("writes the whole order into the message", () => {
    const order = submitOrder(draft({ note: "Ring the bell" }), at, fixed);
    const text = decodeURIComponent(order.handoffUrl.split("?text=")[1]);

    expect(text).toContain(order.reference);
    expect(text).toContain(`1 × ${CAKE.name}`);
    expect(text).toContain("Rs 700");
    expect(text).toContain("Ayesha Khan");
    expect(text).toContain("House 12, Street 4, Faisal Town, Lahore");
    expect(text).toContain("JazzCash");
    expect(text).toContain("Ring the bell");
  });

  it("names each add-on on its line", () => {
    const order = submitOrder(draft({}, [[CAKE.slug, [SAUCE_A.slug]]]), at, fixed);
    const text = decodeURIComponent(order.handoffUrl.split("?text=")[1]);
    expect(text).toContain(`with ${SAUCE_A.name}`);
    expect(text).toContain("Rs 820"); // 700 + 120
  });

  it("omits the tax line entirely while the rate is off", () => {
    const order = submitOrder(draft(), at, fixed);
    const text = decodeURIComponent(order.handoffUrl.split("?text=")[1]);
    expect(text).not.toContain("Tax");
  });

  it("leaves out optional fields rather than printing an empty label", () => {
    const order = submitOrder(draft({ note: "", discountCode: "" }), at, fixed);
    const text = decodeURIComponent(order.handoffUrl.split("?text=")[1]);
    expect(text).not.toContain("Note:");
    expect(text).not.toContain("Discount code:");
  });

  it("upper-cases the discount code so staff read one format", () => {
    const order = submitOrder(draft({ discountCode: " liha50 " }), at, fixed);
    const text = decodeURIComponent(order.handoffUrl.split("?text=")[1]);
    expect(text).toContain("Discount code: LIHA50");
  });
});
