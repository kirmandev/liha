"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

import { useCatalogue } from "@/lib/catalogue-context";
import { formatPKR } from "@/lib/format";
import { paymentMethodLabel } from "@/lib/order";
import { readSubmittedOrder, type StoredOrder } from "@/lib/orderHandoff";
import { ButtonLink, WhatsAppIcon } from "./ui";

/**
 * sessionStorage read as an external store rather than an effect, so the value
 * is available on the first client render instead of arriving a paint later.
 *
 * The snapshot is memoised at module level because `getSnapshot` must return a
 * stable reference — re-reading and re-parsing on every call would hand React a
 * new object each time and loop forever. The order never changes once written,
 * so caching it is also simply correct.
 */
type Snapshot = { order: StoredOrder | null; ready: boolean };

const PENDING: Snapshot = { order: null, ready: false };
let cached: Snapshot | null = null;

function subscribe(): () => void {
  // Nothing mutates this after checkout wrote it, so there is nothing to notify.
  return () => {};
}

function getSnapshot(): Snapshot {
  cached ??= { order: readSubmittedOrder(), ready: true };
  return cached;
}

function getServerSnapshot(): Snapshot {
  return PENDING;
}

export function OrderConfirmation() {
  const { order, ready } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { settings } = useCatalogue();
  const opened = useRef(false);

  useEffect(() => {
    // Open WhatsApp once, automatically — this is the moment the order actually
    // reaches LIHA, so leaving it to a click risks orders that were "placed"
    // and never arrived. The button below stays for popup blockers and for
    // anyone who closed the tab by accident.
    if (order && !opened.current) {
      opened.current = true;
      window.open(order.handoffUrl, "_blank", "noopener,noreferrer");
    }
  }, [order]);

  if (!ready) {
    return <div className="py-24 text-center text-ink-soft">Loading…</div>;
  }

  if (!order) {
    return (
      <div className="rounded-3xl bg-cream-deep/50 px-6 py-20 text-center">
        <h1 className="font-display text-3xl font-semibold text-wine">No recent order</h1>
        <p className="mx-auto mt-3 max-w-sm text-ink-soft">
          We could not find an order from this visit. If you already sent one on WhatsApp it is
          safely with us — otherwise start again from the menu.
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
    <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-start">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full bg-pistachio/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#1e2a17]">
          Order placed
        </span>

        <h1 className="font-display mt-5 text-4xl font-semibold leading-[1.05] tracking-tight text-wine sm:text-5xl">
          Thank you, {order.name.split(" ")[0]}.
        </h1>

        <p className="mt-5 max-w-lg leading-relaxed text-ink-soft">
          Your order has been written out and sent to us on WhatsApp. We will confirm the delivery
          charge and send you the {paymentMethodLabel(
            order.paymentMethod as "jazzcash" | "bank",
          ).toLowerCase()}{" "}
          details, then get baking.
        </p>

        <dl className="mt-8 flex flex-col gap-1 rounded-2xl bg-cream-deep/60 px-5 py-4">
          <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Your reference
          </dt>
          <dd className="font-display text-2xl font-semibold tracking-wide text-wine">
            {order.reference}
          </dd>
          <dd className="mt-1 text-xs leading-relaxed text-ink-soft">
            Quote this if you message us about the order.
          </dd>
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href={order.handoffUrl} external variant="wine" className="px-7 py-3.5">
            <WhatsAppIcon className="size-4" />
            Open WhatsApp again
          </ButtonLink>
          <ButtonLink href="/menu" variant="outline">
            Back to the menu
          </ButtonLink>
        </div>

        <p className="mt-5 max-w-lg text-xs leading-relaxed text-ink-soft">
          If WhatsApp did not open, use the button above — your order only reaches us once that
          message is sent.
        </p>
      </div>

      <aside className="rounded-3xl bg-cream-deep/60 p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold text-wine">Order summary</h2>

        <ul className="mt-5 flex flex-col gap-3 border-b border-wine/15 pb-5 text-sm">
          {order.items.map((item, index) => (
            <li key={`${item.name}-${index}`} className="flex items-baseline justify-between gap-4">
              <span className="min-w-0 text-ink">
                {item.qty} × {item.name}
                {item.addOns.length > 0 ? (
                  <span className="block text-xs text-ink-soft">
                    with {item.addOns.join(", ")}
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 font-semibold tabular-nums">{formatPKR(item.total)}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-5 flex flex-col gap-2.5 text-sm">
          <div className="flex items-baseline justify-between">
            <dt className="text-ink-soft">Subtotal</dt>
            <dd className="font-semibold tabular-nums">{formatPKR(order.subtotal)}</dd>
          </div>
          {order.tax > 0 ? (
            <div className="flex items-baseline justify-between">
              <dt className="text-ink-soft">Tax ({order.taxRatePercent}%)</dt>
              <dd className="font-semibold tabular-nums">{formatPKR(order.tax)}</dd>
            </div>
          ) : null}
          <div className="mt-1 flex items-baseline justify-between border-t border-wine/15 pt-3">
            <dt className="font-display text-base font-semibold text-wine">Total</dt>
            <dd className="font-display text-xl font-semibold text-wine tabular-nums">
              {formatPKR(order.total)}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-col gap-2 border-t border-wine/15 pt-5 text-sm">
          <Detail label="Delivering to" value={order.address} />
          <Detail label="Phone" value={order.phone} />
          <Detail
            label="Paying by"
            value={paymentMethodLabel(order.paymentMethod as "jazzcash" | "bank")}
          />
          {order.discountCode ? <Detail label="Code" value={order.discountCode} /> : null}
          {order.note ? <Detail label="Note" value={order.note} /> : null}
        </div>

        <p className="mt-5 text-xs leading-relaxed text-ink-soft">
          Delivery is charged separately — LIHA covers {formatPKR(settings.deliverySubsidy)}{" "}
          and we confirm the rest with you before dispatch.
        </p>
      </aside>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-wrap text-ink">{value}</dd>
    </div>
  );
}
