import Image from "next/image";
import Link from "next/link";

import type { CatalogueEntry } from "@/lib/catalogue";
import { formatPKR } from "@/lib/format";

/**
 * One product in a grid. The whole card is the link to the detail page; adding
 * to the cart happens there, where the sauce add-ons can actually be chosen.
 *
 * `priority` should be set on the handful of cards above the fold so Next
 * preloads them — everything below lazy-loads by default.
 */
export function ProductCard({
  product,
  priority = false,
}: {
  product: CatalogueEntry;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className={`accent-${product.category.accent} group flex h-full flex-col`}
    >
      <div className="photo-frame relative aspect-square w-full rounded-2xl">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.imageAlt}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="photo-zoom object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-(--accent-soft) px-6 text-center">
            <span className="font-display text-lg font-semibold text-wine">
              Photograph coming
            </span>
          </div>
        )}

        {product.pairsWithSauces ? (
          <span className="absolute left-3 top-3 rounded-full bg-cream/92 px-2.5 py-1 text-[11px] font-semibold text-cocoa backdrop-blur-sm">
            + sauces
          </span>
        ) : null}

        {/* Sold out, as opposed to off-menu: the product keeps its page and
            stays listed, it just cannot be ordered today. */}
        {!product.available ? (
          <span className="absolute right-3 top-3 rounded-full bg-ink/85 px-2.5 py-1 text-[11px] font-semibold text-cream">
            Sold out
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1 pt-4">
        <h3 className="font-display text-lg font-semibold leading-snug text-wine group-hover:text-rust">
          {product.name}
        </h3>
        {product.note ? (
          <p className="text-xs uppercase tracking-[0.12em] text-ink-soft">{product.note}</p>
        ) : null}
        <p className="mt-auto pt-2 text-sm font-bold text-ink">{formatPKR(product.price)}</p>
      </div>
    </Link>
  );
}
