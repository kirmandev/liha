"use client";

import { useMemo, useState } from "react";

import { priceRange, type CatalogueCategory } from "@/lib/catalogue";
import { ProductCard } from "./ProductCard";

/**
 * The catalogue as a photo grid with a category filter. Owns filter state and
 * nothing else — the categories arrive as a prop from the server, the card
 * markup comes from `ProductCard`, and adding to the cart happens on the
 * detail page.
 */
export function MenuBrowser({ categories }: { categories: CatalogueCategory[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const shown = useMemo(
    () => (activeId ? categories.filter((category) => category.id === activeId) : categories),
    [activeId, categories],
  );

  return (
    <div>
      <div
        className="sticky top-[73px] z-30 -mx-5 border-b border-wine/10 bg-cream/92 px-5 py-3 backdrop-blur-md sm:-mx-8 sm:px-8"
        role="group"
        aria-label="Filter by category"
      >
        {/* Horizontal scroll rather than wrapping: eleven chips would otherwise
            push the first row of photographs off a phone screen entirely. */}
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <FilterChip active={activeId === null} onClick={() => setActiveId(null)} accent="wine">
            Everything
          </FilterChip>
          {categories.map((category) => (
            <FilterChip
              key={category.id}
              active={activeId === category.id}
              onClick={() => setActiveId(category.id)}
              accent={category.accent}
            >
              {category.name}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="mt-12 flex flex-col gap-20">
        {shown.map((category) => (
          <CategorySection key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  accent,
  children,
}: {
  active: boolean;
  onClick: () => void;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`accent-${accent} shrink-0 whitespace-nowrap rounded-full border-2 px-4 py-2 text-sm font-semibold transition-colors ${
        active
          ? "border-transparent bg-(--accent) text-(--accent-on)"
          : "border-wine/20 text-ink hover:border-(--accent) hover:bg-(--accent-soft)"
      }`}
    >
      {children}
    </button>
  );
}

function CategorySection({ category }: { category: CatalogueCategory }) {
  const range = priceRange(category);

  return (
    <section
      id={category.slug}
      className={`accent-${category.accent} scroll-mt-36`}
      aria-labelledby={`${category.slug}-heading`}
    >
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b-2 border-(--accent) pb-4">
        <div>
          <h2
            id={`${category.slug}-heading`}
            className="font-display text-3xl font-semibold text-wine sm:text-4xl"
          >
            {category.name}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">{category.blurb}</p>
        </div>
        {range ? (
          <span className="rounded-full bg-(--accent-soft) px-3 py-1.5 text-xs font-bold text-ink">
            {range}
          </span>
        ) : null}
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
        {category.items.map((item) => (
          <li key={item.slug}>
            <ProductCard product={{ ...item, category }} />
          </li>
        ))}
      </ul>
    </section>
  );
}
