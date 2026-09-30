import type { ResolvedLine } from "./pricing";

/**
 * Checking a discount code from the browser.
 *
 * The code is checked but never *applied* here — the amount that comes back is
 * for display, and the server recomputes it when the order is placed. A browser
 * that decided its own discount would be a browser that decided its own price.
 */

export type DiscountResult =
  | { valid: true; code: string; amount: number; newTotal: number }
  | { valid: false; message: string };

export async function checkDiscountCode(
  code: string,
  lines: readonly ResolvedLine[],
): Promise<DiscountResult> {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return { valid: false, message: "Enter a code." };

  let response: Response;
  try {
    response = await fetch("/api/discount", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: trimmed,
        items: lines.map((entry) => ({
          slug: entry.product.slug,
          qty: entry.line.qty,
          addOns: entry.addOns.map((addOn) => addOn.slug),
        })),
      }),
    });
  } catch {
    return { valid: false, message: "Could not check that code. Please check your connection." };
  }

  let payload: { valid?: boolean; amount?: number; newTotal?: number; message?: string } = {};
  try {
    payload = (await response.json()) as typeof payload;
  } catch {
    return { valid: false, message: "Could not check that code just now." };
  }

  if (payload.valid && typeof payload.amount === "number") {
    return {
      valid: true,
      code: trimmed,
      amount: payload.amount,
      newTotal: payload.newTotal ?? 0,
    };
  }

  return { valid: false, message: payload.message ?? "That code is not valid." };
}
