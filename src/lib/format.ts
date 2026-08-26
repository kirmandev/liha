/** Pure formatting helpers. No React, no DOM. */

/** `650` → `"Rs 650"`. Thousands get a separator: `1250` → `"Rs 1,250"`. */
export function formatPKR(amount: number): string {
  return `Rs ${amount.toLocaleString("en-PK")}`;
}

/** `"2026-09-04"` → `"Friday, 4 September 2026"`. Returns the input if unparseable. */
export function formatLongDate(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * The earliest date an order can be placed for, as `YYYY-MM-DD`.
 *
 * Takes `today` explicitly so it is deterministic under test and so the caller
 * decides whether "today" means the server's clock or the browser's.
 */
export function earliestOrderDate(today: Date, leadDays: number): string {
  const target = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  target.setDate(target.getDate() + leadDays);
  const month = String(target.getMonth() + 1).padStart(2, "0");
  const day = String(target.getDate()).padStart(2, "0");
  return `${target.getFullYear()}-${month}-${day}`;
}
