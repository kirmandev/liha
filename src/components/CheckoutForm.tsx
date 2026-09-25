"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { PAYMENT_METHODS, site, type PaymentMethod } from "@/content/site";
import { useCart } from "@/lib/cart";
import { useCatalogue } from "@/lib/catalogue-context";
import { formatPKR } from "@/lib/format";
import { storeSubmittedOrder } from "@/lib/orderHandoff";
import {
  newIdempotencyKey,
  submitOrder,
  validateDraft,
  type OrderDraft,
} from "@/lib/order";
import { Field, TextArea, TextInput } from "./FormControls";
import { Button, ButtonLink } from "./ui";

/**
 * Checkout. Collects everything the Website SRS §5 requires, then hands the
 * finished order to `submitOrder`.
 *
 * No payment is taken here and none is simulated — SRS §5 and §13 keep payment
 * off the site entirely in this phase. The customer picks a method, sees how it
 * will be settled, and staff confirm it by phone afterwards.
 */
export function CheckoutForm() {
  const { resolved, totals, hydrated, clear } = useCart();
  const { settings } = useCatalogue();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("jazzcash");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  // Generated once per mount, so a retry after a network wobble reuses it and
  // the server returns the original order rather than creating a second one.
  const [idempotencyKey] = useState(newIdempotencyKey);

  if (!hydrated) {
    return <div className="py-24 text-center text-ink-soft">Loading your cart…</div>;
  }

  if (resolved.length === 0) {
    return (
      <div className="rounded-3xl bg-cream-deep/50 px-6 py-20 text-center">
        <h2 className="font-display text-3xl font-semibold text-wine">Nothing to check out</h2>
        <p className="mt-3 text-ink-soft">Your cart is empty.</p>
        <div className="mt-8">
          <ButtonLink href="/menu" variant="wine">
            Browse the menu
          </ButtonLink>
        </div>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;

    const draft: OrderDraft = {
      customer: { name, phone, address, note, discountCode, paymentMethod },
      lines: resolved,
      totals,
    };

    const found = validateDraft(draft, settings.minOrderValue);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      return;
    }

    setSubmitting(true);
    const result = await submitOrder(draft, idempotencyKey);

    if (!result.ok) {
      // The cart is deliberately left intact: the order did not happen, and
      // emptying it would lose the customer's basket over a failed request.
      setErrors(result.errors);
      setSubmitting(false);
      document.querySelector<HTMLElement>("[role='alert']")?.scrollIntoView({ block: "center" });
      return;
    }

    // Persist before clearing: the confirmation page reads the order back from
    // here, and the cart must not survive as a duplicate of an order already
    // placed. Order matters — clearing first would leave nothing to show.
    storeSubmittedOrder(result.order, draft.customer, result.handoffUrl);
    clear();
    router.push("/order-confirmation");
  }

  const selected = PAYMENT_METHODS.find((method) => method.id === paymentMethod);

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:items-start">
      <div className="flex flex-col gap-10">
        <fieldset className="border-0 p-0">
          <legend className="font-display text-2xl font-semibold text-wine">
            Where is it going?
          </legend>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field label="Your name" htmlFor="name" error={errors.name}>
              <TextInput
                id="name"
                name="name"
                autoComplete="name"
                value={name}
                error={errors.name}
                onChange={(event) => setName(event.target.value)}
              />
            </Field>

            <Field
              label="Phone number"
              htmlFor="phone"
              error={errors.phone}
              hint="We call to confirm payment and delivery."
            >
              <TextInput
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="0300 1234567"
                value={phone}
                error={errors.phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </Field>

            <Field
              label="Delivery address"
              htmlFor="address"
              error={errors.address}
              className="sm:col-span-2"
              hint={`Delivery across ${site.address.city}. Include the area and any landmark.`}
            >
              <TextArea
                id="address"
                name="address"
                autoComplete="street-address"
                value={address}
                error={errors.address}
                onChange={(event) => setAddress(event.target.value)}
                className="min-h-24"
              />
            </Field>

            <Field
              label="Order note (optional)"
              htmlFor="note"
              className="sm:col-span-2"
              hint="Anything we should know — “ring the bell”, a message for the card, a delivery time."
            >
              <TextArea
                id="note"
                name="note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="min-h-20"
              />
            </Field>
          </div>
        </fieldset>

        <fieldset className="border-0 p-0">
          <legend className="font-display text-2xl font-semibold text-wine">How will you pay?</legend>
          <p className="mt-2 text-sm text-ink-soft">
            Nothing is charged here. Pick a method and we will send you the details to transfer to,
            then confirm once it lands.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {PAYMENT_METHODS.map((method) => {
              const active = paymentMethod === method.id;
              return (
                <label
                  key={method.id}
                  className={`flex cursor-pointer flex-col gap-1 rounded-2xl border-2 px-5 py-4 transition-colors ${
                    active ? "border-wine bg-wine-soft" : "border-wine/15 hover:border-wine/40"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={active}
                      onChange={() => setPaymentMethod(method.id)}
                      className="size-4 accent-[#6e1b2e]"
                    />
                    <span className="font-semibold text-ink">{method.label}</span>
                  </span>
                  <span className="pl-7 text-xs leading-relaxed text-ink-soft">{method.hint}</span>
                </label>
              );
            })}
          </div>

          {selected ? (
            <p className="mt-4 rounded-xl bg-cream-deep/70 px-4 py-3 text-sm text-ink-soft">
              {/* Account details come from the admin. While they are unset the
                  site says staff will send them, rather than printing a
                  placeholder someone might actually transfer money to. */}
              {paymentMethod === "jazzcash" && settings.jazzCashNumber
                ? `Send to ${settings.jazzCashNumber} and share the screenshot.`
                : paymentMethod === "bank" && settings.bankAccount
                  ? `Transfer to ${settings.bankAccount.bank}, ${settings.bankAccount.title} — ${settings.bankAccount.number}.`
                  : `We will send you the ${selected.label.toLowerCase()} details on WhatsApp as soon as the order comes through.`}
            </p>
          ) : null}
        </fieldset>

        <fieldset className="border-0 p-0">
          <legend className="font-display text-2xl font-semibold text-wine">
            Have a discount code?
          </legend>
          <div className="mt-5 max-w-sm">
            <Field
              label="Discount code"
              htmlFor="discountCode"
              hint="Codes are checked by hand right now — we will apply it and confirm your total before you pay."
            >
              <TextInput
                id="discountCode"
                name="discountCode"
                autoCapitalize="characters"
                placeholder="e.g. LIHA50"
                value={discountCode}
                onChange={(event) => setDiscountCode(event.target.value.toUpperCase())}
              />
            </Field>
          </div>
        </fieldset>
      </div>

      <aside className="rounded-3xl bg-cream-deep/60 p-6 sm:p-8 lg:sticky lg:top-28">
        <h2 className="font-display text-2xl font-semibold text-wine">Your order</h2>

        <ul className="mt-5 flex flex-col gap-3 border-b border-wine/15 pb-5 text-sm">
          {resolved.map(({ line, product, addOns, total }) => (
            <li key={line.id} className="flex items-baseline justify-between gap-4">
              <span className="min-w-0 text-ink">
                {line.qty} × {product.name}
                {addOns.length > 0 ? (
                  <span className="block text-xs text-ink-soft">
                    with {addOns.map((addOn) => addOn.name).join(", ")}
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 font-semibold tabular-nums">{formatPKR(total)}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-5 flex flex-col gap-3 text-sm">
          <div className="flex items-baseline justify-between">
            <dt className="text-ink-soft">Subtotal</dt>
            <dd className="font-semibold tabular-nums">{formatPKR(totals.subtotal)}</dd>
          </div>
          {totals.tax > 0 ? (
            <div className="flex items-baseline justify-between">
              <dt className="text-ink-soft">Tax ({totals.taxRatePercent}%)</dt>
              <dd className="font-semibold tabular-nums">{formatPKR(totals.tax)}</dd>
            </div>
          ) : null}
          <div className="flex items-baseline justify-between">
            <dt className="text-ink-soft">Delivery</dt>
            <dd className="text-right text-xs text-ink-soft">Confirmed before dispatch</dd>
          </div>
          <div className="mt-2 flex items-baseline justify-between border-t border-wine/15 pt-4">
            <dt className="font-display text-lg font-semibold text-wine">Total</dt>
            <dd className="font-display text-2xl font-semibold text-wine tabular-nums">
              {formatPKR(totals.total)}
            </dd>
          </div>
        </dl>

        <p className="mt-4 text-xs leading-relaxed text-ink-soft">
          Delivery depends on your area — LIHA covers {formatPKR(settings.deliverySubsidy)} of
          the rider fare and the rest is confirmed with you before dispatch.
        </p>

        {errors.cart ? (
          <p role="alert" className="mt-5 rounded-xl bg-butter/30 px-4 py-3 text-sm font-semibold text-ink">
            {errors.cart}
          </p>
        ) : null}

        <div className="mt-6">
          <Button type="submit" variant="wine" className="w-full py-4" disabled={submitting}>
            {submitting ? "Placing your order…" : "Place order"}
          </Button>
        </div>

        <p className="mt-4 text-center text-xs leading-relaxed text-ink-soft">
          Your order is recorded when you press this, and WhatsApp opens so we see it straight
          away.
        </p>

        <p className="mt-4 text-center text-xs text-ink-soft">
          <Link href="/cart" className="underline underline-offset-4 hover:text-wine">
            Back to cart
          </Link>
        </p>
      </aside>
    </form>
  );
}
