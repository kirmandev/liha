"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import { indexProducts, type Catalogue, type ProductIndex, type StoreSettings } from "./catalogue";

/**
 * Makes the catalogue available to client components.
 *
 * The cart stores slugs and quantities; turning those into money needs prices,
 * and prices now live in the CMS. Rather than having the cart fetch them — which
 * would mean a loading state on every page that shows a total — the server
 * passes the catalogue it already fetched down through this provider.
 *
 * The product index is memoised on the catalogue object, so it is rebuilt when
 * the data actually changes and not on every render.
 */

type CatalogueContextValue = {
  catalogue: Catalogue;
  index: ProductIndex;
  settings: StoreSettings;
};

const CatalogueContext = createContext<CatalogueContextValue | null>(null);

export function CatalogueProvider({
  catalogue,
  children,
}: {
  catalogue: Catalogue;
  children: ReactNode;
}) {
  const value = useMemo<CatalogueContextValue>(
    () => ({ catalogue, index: indexProducts(catalogue), settings: catalogue.settings }),
    [catalogue],
  );

  return <CatalogueContext.Provider value={value}>{children}</CatalogueContext.Provider>;
}

export function useCatalogue(): CatalogueContextValue {
  const context = useContext(CatalogueContext);
  if (!context) {
    throw new Error(
      "useCatalogue must be used inside <CatalogueProvider>. The layout supplies it.",
    );
  }
  return context;
}
