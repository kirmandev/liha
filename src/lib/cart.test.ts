import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The cart store is a module-level singleton, so every test gets a fresh copy
 * via `vi.resetModules()` and a dynamic import. `window.localStorage` is stubbed
 * because the store only ever touches that one browser API — enough to exercise
 * hydration and persistence for real without pulling in a DOM environment.
 */

const STORAGE_KEY = "liha.cart.v1";

type Store = Record<string, string>;

function installStorage(initial: Store = {}, opts: { throwOnWrite?: boolean } = {}) {
  const data: Store = { ...initial };
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => (key in data ? data[key] : null),
      setItem: (key: string, value: string) => {
        if (opts.throwOnWrite) throw new Error("QuotaExceededError");
        data[key] = value;
      },
      removeItem: (key: string) => delete data[key],
    },
  });
  return data;
}

/** Fresh module instance, subscribed so the store hydrates from storage. */
async function loadCart() {
  vi.resetModules();
  const mod = await import("./cart");
  return mod;
}

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("persistence", () => {
  it("writes lines to localStorage on every mutation", async () => {
    const data = installStorage();
    const { cartActions } = await loadCart();

    cartActions.add("matilda-cake", [], 2);

    const saved = JSON.parse(data[STORAGE_KEY]);
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ slug: "matilda-cake", qty: 2 });
  });

  it("survives a write that throws, so a full quota cannot break the cart", async () => {
    installStorage({}, { throwOnWrite: true });
    const { cartActions } = await loadCart();

    expect(() => cartActions.add("matilda-cake", [], 1)).not.toThrow();
  });
});

describe("mutations", () => {
  it("merges an identical line rather than adding a second row", async () => {
    const data = installStorage();
    const { cartActions } = await loadCart();

    cartActions.add("matilda-cake", [], 1);
    cartActions.add("matilda-cake", [], 2);

    const saved = JSON.parse(data[STORAGE_KEY]);
    expect(saved).toHaveLength(1);
    expect(saved[0].qty).toBe(3);
  });

  it("keeps the same product with different sauces as separate lines", async () => {
    const data = installStorage();
    const { cartActions } = await loadCart();

    cartActions.add("matilda-cake", ["milk-chocolate-sauce"], 1);
    cartActions.add("matilda-cake", [], 1);

    expect(JSON.parse(data[STORAGE_KEY])).toHaveLength(2);
  });

  it("removes a line and empties the cart", async () => {
    const data = installStorage();
    const { cartActions } = await loadCart();

    cartActions.add("matilda-cake", [], 1);
    cartActions.remove("matilda-cake");
    expect(JSON.parse(data[STORAGE_KEY])).toEqual([]);

    cartActions.add("brookie", [], 1);
    cartActions.clear();
    expect(JSON.parse(data[STORAGE_KEY])).toEqual([]);
  });
});

describe("reading a stored cart back", () => {
  async function restoredLines(raw: string) {
    installStorage({ [STORAGE_KEY]: raw });
    const { cartActions } = await loadCart();
    // Any mutation forces the store to hydrate first, then re-persist what it
    // restored — which is what we assert on.
    cartActions.add("brookie", [], 1);
    const data = JSON.parse(
      (window as unknown as { localStorage: Storage }).localStorage.getItem(STORAGE_KEY) as string,
    );
    return data as Array<{ slug: string; qty: number; addOns: string[] }>;
  }

  it("restores a previously saved cart", async () => {
    const lines = await restoredLines(
      JSON.stringify([{ id: "matilda-cake", slug: "matilda-cake", qty: 2, addOns: [] }]),
    );
    expect(lines.find((line) => line.slug === "matilda-cake")?.qty).toBe(2);
  });

  it("ignores malformed JSON instead of throwing", async () => {
    const lines = await restoredLines("{not json");
    expect(lines.map((line) => line.slug)).toEqual(["brookie"]);
  });

  it("ignores a stored value that is not an array", async () => {
    const lines = await restoredLines(JSON.stringify({ slug: "matilda-cake" }));
    expect(lines.map((line) => line.slug)).toEqual(["brookie"]);
  });

  it("drops entries missing a slug or with a non-positive quantity", async () => {
    const lines = await restoredLines(
      JSON.stringify([
        { slug: "matilda-cake", qty: 0, addOns: [] },
        { qty: 3, addOns: [] },
        { slug: "cookie-shot-box", qty: 1, addOns: [] },
      ]),
    );
    expect(lines.map((line) => line.slug).sort()).toEqual(["brookie", "cookie-shot-box"]);
  });

  it("strips non-string add-ons", async () => {
    const lines = await restoredLines(
      JSON.stringify([{ slug: "matilda-cake", qty: 1, addOns: ["milk-chocolate-sauce", 42, null] }]),
    );
    expect(lines.find((line) => line.slug === "matilda-cake")?.addOns).toEqual([
      "milk-chocolate-sauce",
    ]);
  });

  it("floors a fractional quantity", async () => {
    const lines = await restoredLines(
      JSON.stringify([{ slug: "matilda-cake", qty: 2.7, addOns: [] }]),
    );
    expect(lines.find((line) => line.slug === "matilda-cake")?.qty).toBe(2);
  });
});
