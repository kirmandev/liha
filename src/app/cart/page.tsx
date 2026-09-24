import type { Metadata } from "next";

import { CartView } from "@/components/CartView";

export const metadata: Metadata = {
  title: "Your cart",
  description: "Review your order before checking out.",
  alternates: { canonical: "/cart" },
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <h1 className="font-display text-4xl font-semibold tracking-tight text-wine sm:text-5xl">
        Your cart
      </h1>
      <div className="mt-10">
        <CartView />
      </div>
    </div>
  );
}
