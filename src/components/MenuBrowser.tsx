"use client";

import { useMemo, useState } from "react";

import { categories, type Category } from "@/content/menu";
import { site } from "@/content/site";
import { formatPKR } from "@/lib/format";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { CATEGORY_ART, LineArt } from "./LineArt";
import { ScallopFrame } from "./ScallopFrame";
import { WhatsAppIcon } from "./ui";

/**
 * The catalogue with a category filter. Owns filter state and nothing else —
 * the data comes from `content/menu.ts` and the message text from
 * `lib/whatsapp.ts`.
 */
export function MenuBrowser() {
  const [activeId, setActiveId] = useState<string | null>(null);

  const shown = useMemo(
    () => (activeId ? categories.filter((category) => category.id === activeId) : categories),
    [activeId],
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
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

      <div className="mt-14 flex flex-col gap-20">
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
      className={`accent-${accent} rounded-full border-2 px-4 py-2 text-sm font-semibold transition-colors ${
        active
          ? "border-transparent bg-(--accent) text-(--accent-on)"
          : "border-wine/20 text-ink hover:border-(--accent) hover:bg-(--accent-soft)"
      }`}
    >
      {children}
    </button>
  );
}

function CategorySection({ category }: { category: Category }) {
  return (
    <section
      id={category.id}
      className={`accent-${category.accent} scroll-mt-28`}
      aria-labelledby={`${category.id}-heading`}
    >
      <div className="flex flex-wrap items-end justify-between gap-6 border-b-2 border-(--accent) pb-5">
        <div className="flex items-center gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-(--accent) text-(--accent-on)">
            <LineArt art={CATEGORY_ART[category.id] ?? "layerCake"} className="size-9" strokeWidth={2.6} />
          </span>
          <div>
            <h2
              id={`${category.id}-heading`}
              className="font-display text-3xl font-semibold text-wine sm:text-4xl"
            >
              {category.name}
            </h2>
            <p className="mt-1 max-w-xl text-ink-soft">{category.blurb}</p>
          </div>
        </div>
      </div>

      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {category.items.map((item) => (
          <li key={`${category.id}-${item.id}`}>
            <ScallopFrame size={18} className="h-full bg-(--accent-soft)">
              <div className="flex h-full flex-col gap-4 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl font-semibold leading-snug text-wine">
                      {item.name}
                    </h3>
                    {item.note ? (
                      <p className="mt-1 text-sm text-ink-soft">{item.note}</p>
                    ) : null}
                  </div>
                  {item.price != null ? (
                    <span className="shrink-0 rounded-full bg-(--accent) px-3 py-1 text-sm font-bold text-(--accent-on)">
                      {formatPKR(item.price)}
                    </span>
                  ) : null}
                </div>

                <div className="mt-auto flex flex-wrap gap-2">
                  {category.orderVia === "foodpanda" ? (
                    <a
                      href={site.foodpanda.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-wine px-4 py-2 text-xs font-semibold text-cream transition-colors hover:bg-wine-deep"
                    >
                      Order on Foodpanda
                    </a>
                  ) : (
                    <a
                      href="/custom"
                      className="rounded-full bg-wine px-4 py-2 text-xs font-semibold text-cream transition-colors hover:bg-wine-deep"
                    >
                      Start a brief
                    </a>
                  )}
                  <a
                    href={buildWhatsAppUrl({
                      kind: "product",
                      product: item.name,
                      category: category.name,
                      price: item.price,
                      note: item.note,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border-2 border-wine/25 px-4 py-2 text-xs font-semibold text-wine transition-colors hover:border-wine"
                  >
                    <WhatsAppIcon className="size-3.5" />
                    Message
                  </a>
                </div>
              </div>
            </ScallopFrame>
          </li>
        ))}
      </ul>
    </section>
  );
}
