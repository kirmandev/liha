import type { Metadata } from "next";

import { OrderConfirmation } from "@/components/OrderConfirmation";

export const metadata: Metadata = {
  title: "Order placed",
  description: "Your order summary.",
  alternates: { canonical: "/order-confirmation" },
  robots: { index: false, follow: false },
};

export default function OrderConfirmationPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <OrderConfirmation />
    </div>
  );
}
