import { afterEach, describe, expect, it, vi } from "vitest";

import { site } from "@/content/site";
import { indexProducts } from "./catalogue";
import { CAKE, SAUCE_A, SLICE, makeCatalogue } from "./fixtures";
import {
  buildHandoffUrl,
  newIdempotencyKey,
  paymentMethodLabel,
  submitOrder,
  validateDraft,
  type CustomerDetails,
  type OrderDraft,
  type PlacedOrder,
} from "./order";
import { createLine, orderTotals, resolveLines } from "./pricing";

const catalogue = makeCatalogue();
const index = indexProducts(catalogue);
const SETTINGS = { taxRatePercent: 0, minOrderValue: 500 };

function draft(
  overrides: Partial<CustomerDetails> = {},
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

const PLACED: PlacedOrder = {
  reference: "LIHA-260925-K7QF",
  status: "placed",
  subtotal: 700,
  tax: 0,
  taxRatePercent: 0,
  total: 700,
  discountApplied: false,
  items: [{ name: CAKE.name, quantity: 1, addOns: [], lineTotal: 700 }],
};

afterEach(() => {
  vi.unstubAllGlobals();
});

/** Captures what was posted, so the request body itself can be asserted on. */
function stubFetch(response: { status: number; body: unknown }) {
  const calls: Array<{ url: string; body: Record<string, unknown> }> = [];
  vi.stubGlobal("fetch", async (url: string, init: RequestInit) => {
    calls.push({ url, body: JSON.parse(String(init.body)) });
    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      json: async () => response.body,
    } as Response;
  });
  return calls;
}

describe("validateDraft", () => {
  it("accepts a complete order", () => {
    expect(validateDraft(draft(), 500)).toEqual({});
  });

  it("rejects a missing name", () => {
    expect(validateDraft(draft({ name: " " }), 500).name).toBeDefined();
  });

  it("rejects a phone number too short to call", () => {
    expect(validateDraft(draft({ phone: "12345" }), 500).phone).toBeDefined();
  });

  it("accepts a phone written with spaces, dashes or a country code", () => {
    expect(validateDraft(draft({ phone: "+92 329 6286072" }), 500).phone).toBeUndefined();
    expect(validateDraft(draft({ phone: "0329-628-6072" }), 500).phone).toBeUndefined();
  });

  it("rejects an address too short to deliver to", () => {
    expect(validateDraft(draft({ address: "Lahore" }), 500).address).toBeDefined();
  });

  it("rejects an empty cart", () => {
    expect(validateDraft(draft({}, []), 500).cart).toBeDefined();
  });

  it("blocks checkout below the minimum it is given", () => {
    const small = draft({}, [[SLICE.slug, []]]); // 150
    expect(validateDraft(small, 500).cart).toContain("500");
  });

  // The minimum is an admin setting, so it must not be compiled in.
  it("uses the minimum passed to it rather than a constant", () => {
    const small = draft({}, [[SLICE.slug, []]]); // 150
    expect(validateDraft(small, 100).cart).toBeUndefined();
  });

  // SRS §7 requires codes to be validated and burned server-side. The field is
  // captured and confirmed by staff; judging it here would ship every valid
  // code in the JavaScript bundle.
  it("does not judge the discount code", () => {
    expect(validateDraft(draft({ discountCode: "TOTALLY-FAKE" }), 500)).toEqual({});
  });
});

describe("newIdempotencyKey", () => {
  it("is different every time", () => {
    const keys = new Set(Array.from({ length: 100 }, newIdempotencyKey));
    expect(keys.size).toBe(100);
  });
});

describe("paymentMethodLabel", () => {
  it("resolves the human label", () => {
    expect(paymentMethodLabel("jazzcash")).toBe("JazzCash");
    expect(paymentMethodLabel("bank")).toBe("Bank transfer");
  });
});

describe("buildHandoffUrl", () => {
  const customer = draft().customer;

  it("points at LIHA's WhatsApp number", () => {
    expect(
      buildHandoffUrl(PLACED, customer).startsWith(`https://wa.me/${site.phone.wa}?text=`),
    ).toBe(true);
  });

  it("carries the server's reference and totals, not the cart's", () => {
    const text = decodeURIComponent(buildHandoffUrl(PLACED, customer).split("?text=")[1]);
    expect(text).toContain("LIHA-260925-K7QF");
    expect(text).toContain("Rs 700");
    expect(text).toContain("Ayesha Khan");
    expect(text).toContain("House 12, Street 4, Faisal Town, Lahore");
    expect(text).toContain("JazzCash");
  });

  it("names each add-on on its line", () => {
    const withSauce: PlacedOrder = {
      ...PLACED,
      items: [{ name: CAKE.name, quantity: 1, addOns: [SAUCE_A.name], lineTotal: 820 }],
    };
    const text = decodeURIComponent(buildHandoffUrl(withSauce, customer).split("?text=")[1]);
    expect(text).toContain(`with ${SAUCE_A.name}`);
    expect(text).toContain("Rs 820");
  });

  it("omits the tax line while the rate is off", () => {
    const text = decodeURIComponent(buildHandoffUrl(PLACED, customer).split("?text=")[1]);
    expect(text).not.toContain("Tax");
  });

  it("leaves out optional fields rather than printing an empty label", () => {
    const text = decodeURIComponent(
      buildHandoffUrl(PLACED, { ...customer, note: "", discountCode: "" }).split("?text=")[1],
    );
    expect(text).not.toContain("Note:");
    expect(text).not.toContain("Discount code:");
  });

  it("upper-cases the discount code so staff read one format", () => {
    const text = decodeURIComponent(
      buildHandoffUrl(PLACED, { ...customer, discountCode: " liha50 " }).split("?text=")[1],
    );
    expect(text).toContain("Discount code: LIHA50");
  });
});

describe("submitOrder", () => {
  it("posts to the storefront's own route, not the CMS directly", async () => {
    const calls = stubFetch({ status: 201, body: PLACED });
    await submitOrder(draft(), "key-1");
    expect(calls[0].url).toBe("/api/orders");
  });

  // The whole point of this phase: a browser cannot name its own price.
  it("sends slugs and quantities and never sends a price", async () => {
    const calls = stubFetch({ status: 201, body: PLACED });
    await submitOrder(draft({}, [[CAKE.slug, [SAUCE_A.slug]]]), "key-2");

    const body = calls[0].body;
    const serialised = JSON.stringify(body);

    expect(body.items).toEqual([{ slug: CAKE.slug, qty: 1, addOns: [SAUCE_A.slug] }]);
    expect(serialised).not.toContain("price");
    expect(serialised).not.toContain("unitPrice");
    expect(serialised).not.toContain("subtotal");
    expect(serialised).not.toContain("total");
  });

  it("sends the idempotency key it was given", async () => {
    const calls = stubFetch({ status: 201, body: PLACED });
    await submitOrder(draft(), "key-3");
    expect(calls[0].body.idempotencyKey).toBe("key-3");
  });

  it("returns the server's order and a handoff URL built from it", async () => {
    stubFetch({ status: 201, body: PLACED });
    const result = await submitOrder(draft(), "key-4");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.order.reference).toBe("LIHA-260925-K7QF");
    expect(result.handoffUrl).toContain("LIHA-260925-K7QF");
  });

  it("surfaces field errors from the server so the form can show them", async () => {
    stubFetch({ status: 422, body: { errors: { phone: "Please enter a valid phone number." } } });
    const result = await submitOrder(draft(), "key-5");

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.phone).toBe("Please enter a valid phone number.");
  });

  it("reports an item that sold out between browsing and checking out", async () => {
    stubFetch({
      status: 409,
      body: { errors: { cart: "No longer available: Brookie." }, unavailable: ["Brookie"] },
    });
    const result = await submitOrder(draft(), "key-6");

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.cart).toContain("Brookie");
  });

  it("fails gracefully when the network is down rather than throwing", async () => {
    vi.stubGlobal("fetch", async () => {
      throw new TypeError("Failed to fetch");
    });
    const result = await submitOrder(draft(), "key-7");

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.cart).toContain("could not reach");
  });

  it("gives a generic message when the server errors without detail", async () => {
    stubFetch({ status: 500, body: {} });
    const result = await submitOrder(draft(), "key-8");

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.cart).toBeTruthy();
  });

  it("flags a duplicate so a retry is not reported as a second order", async () => {
    stubFetch({ status: 200, body: { ...PLACED, duplicate: true } });
    const result = await submitOrder(draft(), "key-9");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.duplicate).toBe(true);
  });
});
