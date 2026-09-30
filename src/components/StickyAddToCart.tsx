"use client";

import { useEffect, useState } from "react";

import { useCart } from "@/lib/cart";
import { formatPKR } from "@/lib/format";

/**
 * A bottom bar on phones that appears once the main add-to-cart control has
 * scrolled out of view.
 *
 * On a phone the product's photograph, name, description and sauce options
 * push the real button a screen or more down. A visitor who has read enough
 * to decide should not have to scroll back to act on it.
 *
 * Adds the plain product with no sauces — anyone who wants a sauce has the
 * full control above, and a bar this small should do one thing well.
 */
export function StickyAddToCart({
  slug,
  name,
  price,
  watch,
}: {
  slug: string;
  name: string;
  price: number;
  /** The id of the element whose leaving the viewport reveals this bar. */
  watch: string;
}) {
  const { add } = useCart();
  const [shown, setShown] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const target = document.getElementById(watch);
    if (!target) return;

    // Shown only once the real control is *above* the viewport — scrolled past,
    // not merely not reached yet — so the bar never covers the hero photo.
    const observer = new IntersectionObserver(
      ([entry]) => setShown(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [watch]);

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 1800);
    return () => clearTimeout(timer);
  }, [added]);

  return (
    <div
      aria-hidden={!shown}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-wine/10 bg-cream/95 px-4 py-3 backdrop-blur-md transition-transform duration-300 md:hidden ${
        shown ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-wine">{name}</p>
          <p className="text-xs text-ink-soft">{formatPKR(price)}</p>
        </div>
        <button
          type="button"
          tabIndex={shown ? 0 : -1}
          onClick={() => {
            add(slug, [], 1);
            setAdded(true);
          }}
          className="shrink-0 rounded-full bg-wine px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-wine-deep"
        >
          {added ? "Added ✓" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}
