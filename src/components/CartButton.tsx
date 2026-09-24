"use client";

import Link from "next/link";

import { useCart } from "@/lib/cart";

/**
 * The cart link and its item-count badge.
 *
 * The badge renders only once the cart has hydrated from localStorage. Before
 * that the server and the client disagree about the count, and drawing it early
 * is a hydration mismatch — so the icon ships immediately and the number
 * arrives a tick later.
 */
export function CartButton({ className = "" }: { className?: string }) {
  const { count, hydrated } = useCart();

  return (
    <Link
      href="/cart"
      className={`relative flex size-11 items-center justify-center rounded-full text-wine transition-colors hover:bg-blush ${className}`}
      aria-label={hydrated && count > 0 ? `Cart, ${count} item${count === 1 ? "" : "s"}` : "Cart"}
    >
      <svg
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M4 7h16l-1.2 11a2 2 0 0 1-2 1.8H7.2a2 2 0 0 1-2-1.8Z" />
        <path d="M9 7V5.5a3 3 0 0 1 6 0V7" />
      </svg>

      {hydrated && count > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-rust px-1.5 text-[11px] font-bold leading-5 text-cream tabular-nums">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
