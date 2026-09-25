"use client";

import Image from "next/image";
import Link from "next/link";

import { useCart } from "@/lib/cart";
import { useCatalogue } from "@/lib/catalogue-context";
import { formatPKR } from "@/lib/format";
import { ButtonLink } from "./ui";

export function CartView() {
  const { resolved, totals, setQty, remove, hydrated } = useCart();
  const { settings } = useCatalogue();

  // Nothing renders until localStorage has been read, otherwise the page shows
  // an empty cart for a frame before the real one replaces it.
  if (!hydrated) {
    return <div className="py-24 text-center text-ink-soft">Loading your cart…</div>;
  }

  if (resolved.length === 0) {
    return (
      <div className="rounded-3xl bg-cream-deep/50 px-6 py-20 text-center">
        <h2 className="font-display text-3xl font-semibold text-wine">Your cart is empty</h2>
        <p className="mx-auto mt-3 max-w-sm text-ink-soft">
          Everything on the menu is baked the day it goes out. Pick something.
        </p>
        <div className="mt-8">
          <ButtonLink href="/menu" variant="wine">
            Browse the menu
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:items-start">
      <ul className="flex flex-col divide-y divide-wine/10 border-y border-wine/10">
        {resolved.map(({ line, product, addOns, total }) => {
          return (
            <li key={line.id} className="flex gap-4 py-5 sm:gap-6">
              <Link
                href={`/product/${product.slug}`}
                className="photo-frame relative size-24 shrink-0 overflow-hidden rounded-xl sm:size-28"
              >
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.imageAlt}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                ) : null}
              </Link>

              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Link
                      href={`/product/${product.slug}`}
                      className="font-display text-lg font-semibold leading-snug text-wine hover:text-rust"
                    >
                      {product.name}
                    </Link>
                    {product.note ? (
                      <p className="text-xs uppercase tracking-[0.12em] text-ink-soft">
                        {product.note}
                      </p>
                    ) : null}
                    {addOns.length > 0 ? (
                      <p className="mt-1 text-sm text-ink-soft">
                        with {addOns.map((addOn) => addOn.name).join(", ")}
                      </p>
                    ) : null}
                  </div>
                  <span className="shrink-0 font-bold tabular-nums text-ink">
                    {formatPKR(total)}
                  </span>
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1 rounded-full border-2 border-wine/20 p-0.5">
                    <QtyButton
                      label={`Decrease quantity of ${product.name}`}
                      onClick={() => setQty(line.id, line.qty - 1)}
                    >
                      −
                    </QtyButton>
                    <span className="w-8 text-center text-sm font-bold tabular-nums">
                      {line.qty}
                    </span>
                    <QtyButton
                      label={`Increase quantity of ${product.name}`}
                      onClick={() => setQty(line.id, line.qty + 1)}
                    >
                      +
                    </QtyButton>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(line.id)}
                    className="text-sm font-semibold text-ink-soft underline underline-offset-4 hover:text-rust"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <aside className="rounded-3xl bg-cream-deep/60 p-6 sm:p-8 lg:sticky lg:top-28">
        <h2 className="font-display text-2xl font-semibold text-wine">Summary</h2>

        <dl className="mt-6 flex flex-col gap-3 text-sm">
          <Row label="Subtotal" value={formatPKR(totals.subtotal)} />
          {totals.tax > 0 ? (
            <Row label={`Tax (${totals.taxRatePercent}%)`} value={formatPKR(totals.tax)} />
          ) : null}
          <Row label="Delivery" value="Confirmed before dispatch" muted />
          <div className="mt-2 flex items-baseline justify-between border-t border-wine/15 pt-4">
            <dt className="font-display text-lg font-semibold text-wine">Total</dt>
            <dd className="font-display text-2xl font-semibold text-wine tabular-nums">
              {formatPKR(totals.total)}
            </dd>
          </div>
        </dl>

        <p className="mt-4 text-xs leading-relaxed text-ink-soft">
          Delivery depends on your area — LIHA covers{" "}
          {formatPKR(settings.deliverySubsidy)} of it, and the rest is confirmed with you
          before dispatch.
        </p>

        {totals.meetsMinimum ? (
          <div className="mt-6">
            <ButtonLink href="/checkout" variant="wine" className="w-full py-4">
              Checkout
            </ButtonLink>
          </div>
        ) : (
          <div className="mt-6">
            <p className="rounded-xl bg-butter/30 px-4 py-3 text-sm font-semibold text-ink">
              Minimum order is {formatPKR(totals.minOrderValue)}. Add{" "}
              {formatPKR(totals.shortOfMinimum)} more to check out.
            </p>
            <div className="mt-3">
              <ButtonLink href="/menu" variant="outline" className="w-full py-3.5">
                Add something else
              </ButtonLink>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

function Row({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-ink-soft">{label}</dt>
      <dd className={muted ? "text-right text-xs text-ink-soft" : "font-semibold tabular-nums"}>
        {value}
      </dd>
    </div>
  );
}

function QtyButton({
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
      className="flex size-8 items-center justify-center rounded-full font-bold text-wine transition-colors hover:bg-wine hover:text-cream"
    >
      {children}
    </button>
  );
}
