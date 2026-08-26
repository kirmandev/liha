import { describe, expect, it } from "vitest";

import { site } from "@/content/site";
import { earliestOrderDate, formatLongDate, formatPKR } from "./format";
import { buildMailtoUrl, buildWhatsAppUrl, composeMessage } from "./whatsapp";

describe("formatPKR", () => {
  it("prefixes with Rs", () => {
    expect(formatPKR(650)).toBe("Rs 650");
  });

  it("separates thousands", () => {
    expect(formatPKR(1250)).toBe("Rs 1,250");
  });
});

describe("earliestOrderDate", () => {
  it("adds the lead time", () => {
    expect(earliestOrderDate(new Date(2026, 7, 26), 4)).toBe("2026-08-30");
  });

  it("rolls over month ends", () => {
    expect(earliestOrderDate(new Date(2026, 7, 30), 4)).toBe("2026-09-03");
  });

  it("rolls over year ends", () => {
    expect(earliestOrderDate(new Date(2026, 11, 30), 4)).toBe("2027-01-03");
  });

  it("handles leap days", () => {
    expect(earliestOrderDate(new Date(2028, 1, 26), 4)).toBe("2028-03-01");
  });

  it("ignores the time of day, so an evening visit does not lose a day", () => {
    const morning = new Date(2026, 7, 26, 1, 0, 0);
    const night = new Date(2026, 7, 26, 23, 59, 0);
    expect(earliestOrderDate(morning, 4)).toBe(earliestOrderDate(night, 4));
  });
});

describe("formatLongDate", () => {
  it("spells the date out", () => {
    expect(formatLongDate("2026-09-04")).toBe("Friday, 4 September 2026");
  });

  it("returns the input unchanged when it cannot be parsed", () => {
    expect(formatLongDate("not a date")).toBe("not a date");
  });
});

describe("composeMessage", () => {
  it("names the product, its category and its price", () => {
    const message = composeMessage({
      kind: "product",
      product: "Dubai Kunafa Cake",
      category: "Signature Cakes",
      price: 1250,
      note: "For two",
    });
    expect(message).toContain("Dubai Kunafa Cake");
    expect(message).toContain("(For two)");
    expect(message).toContain("Signature Cakes");
    expect(message).toContain("Rs 1,250");
  });

  it("omits the price for quote-based items rather than writing an empty one", () => {
    const message = composeMessage({
      kind: "product",
      product: "Custom cake",
      category: "Custom Cakes",
    });
    expect(message).not.toContain("Rs");
    expect(message).not.toContain("—");
  });

  it("writes the full custom brief with the date spelled out", () => {
    const message = composeMessage({
      kind: "custom",
      name: "Ayesha",
      occasion: "Birthday",
      servings: "10–15 people",
      flavour: "Pistachio",
      date: "2026-09-04",
      budget: "Rs 6,000 – 10,000",
      details: "Gold leaf on top",
    });
    expect(message).toContain("Name: Ayesha");
    expect(message).toContain("Flavour: Pistachio");
    expect(message).toContain("Needed by: Friday, 4 September 2026");
    expect(message).toContain("Design notes: Gold leaf on top");
  });

  it("keeps the blank lines that separate the greeting, the brief and the sign-off", () => {
    const message = composeMessage({
      kind: "custom",
      name: "Ayesha",
      occasion: "Birthday",
      servings: "10–15 people",
      flavour: "Pistachio",
      date: "2026-09-04",
      budget: "Guide me",
    });
    const [greeting, blank] = message.split("\n");
    expect(greeting).toMatch(/^Hi /);
    expect(blank).toBe("");
    expect(message).toContain("\n\nName: Ayesha");
  });

  it("separates the product block from the greeting and the question", () => {
    const message = composeMessage({
      kind: "product",
      product: "Matilda Cake",
      category: "Signature Cakes",
      price: 650,
    });
    expect(message).toContain("menu:\n\n• Matilda Cake");
    expect(message).toContain("\n\nIs this available?");
  });

  it("leaves no dangling label when optional fields are absent", () => {
    const message = composeMessage({
      kind: "custom",
      name: "Ayesha",
      occasion: "Birthday",
      servings: "10–15 people",
      flavour: "Pistachio",
      date: "2026-09-04",
      budget: "Guide me",
    });
    expect(message).not.toContain("Design notes:");
    expect(message).not.toMatch(/\n\n\n/);
  });

  it("omits the corporate date when it is not fixed yet", () => {
    const message = composeMessage({
      kind: "corporate",
      name: "Bilal",
      organisation: "Acme",
      eventType: "Product launch or exhibition",
      quantity: "120 boxes",
    });
    expect(message).toContain("Organisation: Acme");
    expect(message).not.toContain("Date:");
  });
});

describe("buildWhatsAppUrl", () => {
  it("targets her number in the digits-only form wa.me expects", () => {
    const url = buildWhatsAppUrl({ kind: "general" });
    expect(url.startsWith(`https://wa.me/${site.phone.wa}?text=`)).toBe(true);
    expect(site.phone.wa).toMatch(/^\d+$/);
  });

  it("round-trips the message through URL encoding intact", () => {
    const payload = {
      kind: "custom" as const,
      name: "Ayesha & Co",
      occasion: "Birthday",
      servings: "10–15 people",
      flavour: "Pistachio",
      date: "2026-09-04",
      budget: "Rs 6,000 – 10,000",
      details: "100% chocolate, #gold theme",
    };
    const text = new URL(buildWhatsAppUrl(payload)).searchParams.get("text");
    expect(text).toBe(composeMessage(payload));
  });

  it("escapes the characters that would otherwise truncate the query string", () => {
    const url = buildWhatsAppUrl({
      kind: "product",
      product: "Brookie & Brownie #1",
      category: "Brownies & Bars",
      price: 450,
    });
    expect(url).not.toContain("#1");
    expect(url).toContain("%23");
    expect(url).toContain("%26");
  });
});

describe("buildMailtoUrl", () => {
  it("returns null while no email address is on file, so the UI can hide the option", () => {
    expect(site.email).toBeNull();
    expect(buildMailtoUrl({ kind: "general" })).toBeNull();
  });
});
