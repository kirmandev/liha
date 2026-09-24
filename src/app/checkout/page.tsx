import type { Metadata } from "next";

import { CheckoutForm } from "@/components/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Delivery details and payment method for your order.",
  alternates: { canonical: "/checkout" },
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <h1 className="font-display text-4xl font-semibold tracking-tight text-wine sm:text-5xl">
        Checkout
      </h1>
      <p className="mt-3 max-w-lg text-ink-soft">
        Nothing is charged on this page. We confirm your total and send payment details before
        anything is baked.
      </p>
      <div className="mt-10">
        <CheckoutForm />
      </div>
    </div>
  );
}
