"use client";

/**
 * Cart state, persisted to localStorage.
 *
 * localStorage is an external store, so the cart is modelled as one and read
 * through `useSyncExternalStore` rather than pulled into state by an effect.
 * That is what React's own guidance asks for, and it removes the cascading
 * render an effect-plus-setState would cause on every mount.
 *
 * All the arithmetic lives in `pricing.ts`; this file only holds the lines and
 * survives a refresh. Keeping the two apart is what lets the money be tested
 * without a browser.
 */

import { useMemo, useSyncExternalStore } from "react";

import {
  addLine,
  createLine,
  itemCount,
  orderTotals,
  removeLine,
  resolveLines,
  setLineQty,
  type CartLine,
  type OrderTotals,
  type ResolvedLine,
} from "./pricing";

const STORAGE_KEY = "liha.cart.v1";

type CartState = {
  lines: CartLine[];
  /**
   * False until localStorage has been read. Components that render a count must
   * wait for this, or the server's empty cart and the client's restored one
   * disagree and React reports a hydration mismatch.
   */
  hydrated: boolean;
};

/**
 * The snapshot React sees while server-rendering and during hydration. A single
 * frozen value, because `getServerSnapshot` must return a stable reference or
 * React re-renders forever.
 */
const SERVER_STATE: CartState = { lines: [], hydrated: false };

let state: CartState = SERVER_STATE;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

/** Reads persisted lines, tolerating anything that is not the shape we wrote. */
function readStoredLines(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((entry): CartLine[] => {
      if (typeof entry !== "object" || entry === null) return [];
      const { slug, qty, addOns } = entry as Record<string, unknown>;
      if (typeof slug !== "string" || typeof qty !== "number" || qty <= 0) return [];
      const cleanAddOns = Array.isArray(addOns)
        ? addOns.filter((value): value is string => typeof value === "string")
        : [];
      return [createLine(slug, cleanAddOns, Math.floor(qty))];
    });
  } catch {
    // Private mode, disabled storage, or hand-edited JSON. An empty cart is the
    // correct fallback; a thrown error here would take the whole page down.
    return [];
  }
}

function persist(lines: CartLine[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Storage full or blocked. The cart still works for this session.
  }
}

/** Loads from storage on the first subscription, and only then. */
function hydrateOnce() {
  if (state.hydrated) return;
  state = { lines: readStoredLines(), hydrated: true };
}

function setLines(next: CartLine[]) {
  state = { lines: next, hydrated: true };
  persist(next);
  emit();
}

/**
 * The current lines, guaranteeing storage has been read first.
 *
 * Every mutation goes through this rather than reading `state` directly. Without
 * it, an action firing before any component had subscribed would compute from
 * the empty initial state and persist that — silently wiping a returning
 * visitor's saved cart.
 */
function currentLines(): CartLine[] {
  hydrateOnce();
  return state.lines;
}

function subscribe(listener: () => void): () => void {
  hydrateOnce();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): CartState {
  return state;
}

function getServerSnapshot(): CartState {
  return SERVER_STATE;
}

// Mutations are module-level and identity-stable, so components never re-render
// because a handler was recreated.
export const cartActions = {
  add(slug: string, addOns: string[] = [], qty = 1) {
    setLines(addLine(currentLines(), createLine(slug, addOns, qty)));
  },
  setQty(id: string, qty: number) {
    setLines(setLineQty(currentLines(), id, qty));
  },
  remove(id: string) {
    setLines(removeLine(currentLines(), id));
  },
  clear() {
    setLines([]);
  },
};

export type UseCart = {
  lines: CartLine[];
  resolved: ResolvedLine[];
  totals: OrderTotals;
  count: number;
  hydrated: boolean;
} & typeof cartActions;

export function useCart(): UseCart {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return useMemo(() => {
    const resolved = resolveLines(snapshot.lines);
    return {
      lines: snapshot.lines,
      resolved,
      totals: orderTotals(resolved),
      count: itemCount(snapshot.lines),
      hydrated: snapshot.hydrated,
      ...cartActions,
    };
  }, [snapshot]);
}
