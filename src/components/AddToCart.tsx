"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useCart } from "@/lib/cart";
import { formatPKR } from "@/lib/format";
import { Button } from "./ui";

/**
 * Quantity, optional sauces, and the add-to-cart action for one product.
 *
 * Sauces are only offered on products the client's menu marks as add-on
 * eligible. Each is a real catalogue item with its own price, so adding one
 * here and buying one outright cost the same — which is why the add-on price
 * comes from the catalogue rather than a second hardcoded list.
 *
 * Takes flat primitives rather than a `CatalogueEntry`: an entry carries its
 * whole `category`, and a category carries every sibling item, so passing one
 * across the client boundary would serialise the neighbouring catalogue into
 * this page's payload for no benefit.
 */
export type AddToCartOption = { slug: string; name: string; price: number };

export function AddToCart({
  slug,
  price,
  pairsWithSauces = false,
  sauces,
}: {
  slug: string;
  price: number;
  pairsWithSauces?: boolean;
  sauces: AddToCartOption[];
}) {
  const { add } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [chosen, setChosen] = useState<string[]>([]);
  const [added, setAdded] = useState(false);

  const offerSauces = pairsWithSauces && sauces.length > 0;
  const addOnTotal = chosen.reduce(
    (sum, chosenSlug) => sum + (sauces.find((sauce) => sauce.slug === chosenSlug)?.price ?? 0),
    0,
  );
  const lineTotal = (price + addOnTotal) * qty;

  function toggleSauce(sauceSlug: string) {
    setChosen((current) =>
      current.includes(sauceSlug)
        ? current.filter((value) => value !== sauceSlug)
        : [...current, sauceSlug],
    );
    setAdded(false);
  }

  function handleAdd() {
    add(slug, chosen, qty);
    setAdded(true);
  }

  return (
    <div className="flex flex-col gap-6">
      {offerSauces ? (
        <fieldset className="border-0 p-0">
          <legend className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">
            Add a sauce
          </legend>
          <div className="mt-3 flex flex-col gap-2">
            {sauces.map((sauce) => {
              const active = chosen.includes(sauce.slug);
              return (
                <label
                  key={sauce.slug}
                  className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border-2 px-4 py-3 transition-colors ${
                    active ? "border-cocoa bg-cocoa-soft" : "border-wine/15 hover:border-wine/35"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleSauce(sauce.slug)}
                      className="size-4 accent-[#5b3a2e]"
                    />
                    <span className="text-sm font-semibold text-ink">{sauce.name}</span>
                  </span>
                  <span className="text-sm font-semibold text-ink-soft">
                    + {formatPKR(sauce.price)}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1 rounded-full border-2 border-wine/20 p-1">
          <StepperButton label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>
            −
          </StepperButton>
          <span aria-live="polite" className="w-9 text-center text-sm font-bold tabular-nums">
            {qty}
          </span>
          <StepperButton label="Increase quantity" onClick={() => setQty((q) => Math.min(99, q + 1))}>
            +
          </StepperButton>
        </div>

        <Button type="button" onClick={handleAdd} variant="wine" className="px-7 py-3.5">
          Add to cart — {formatPKR(lineTotal)}
        </Button>
      </div>

      {added ? (
        <div
          role="status"
          className="flex flex-wrap items-center gap-3 rounded-xl bg-pistachio/25 px-4 py-3 text-sm"
        >
          <span className="font-semibold text-ink">Added to your cart.</span>
          <button
            type="button"
            onClick={() => router.push("/cart")}
            className="font-semibold text-wine underline underline-offset-4"
          >
            Go to cart →
          </button>
        </div>
      ) : null}
    </div>
  );
}

function StepperButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-9 items-center justify-center rounded-full text-lg font-bold text-wine transition-colors hover:bg-wine hover:text-cream"
    >
      {children}
    </button>
  );
}
