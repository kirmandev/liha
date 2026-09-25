import type { Metadata } from "next";

import { MenuBrowser } from "@/components/MenuBrowser";
import { ButtonLink, Eyebrow } from "@/components/ui";
import { site } from "@/content/site";
import { allEntries } from "@/lib/catalogue";
import { getCatalogue } from "@/lib/cms";

export async function generateMetadata(): Promise<Metadata> {
  const catalogue = await getCatalogue();
  const items = allEntries(catalogue);
  const lowest = items.length > 0 ? Math.min(...items.map((item) => item.price)) : 0;

  return {
    title: "Menu",
    description: `Signature cakes, brownies, brown butter cookies, loaves, shot boxes and sauces — baked to order in ${site.address.locality}, ${site.address.city}. ${items.length} items, from Rs ${lowest}.`,
    alternates: { canonical: "/menu" },
  };
}

export default async function MenuPage() {
  const catalogue = await getCatalogue();
  const items = allEntries(catalogue);
  const lowest = items.length > 0 ? Math.min(...items.map((item) => item.price)) : 0;

  return (
    <>
      <header className="bg-blush/45 px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <Eyebrow className="text-rust">Baked to order</Eyebrow>
          <h1 className="font-display mt-5 text-5xl font-semibold leading-[0.95] tracking-tight text-wine sm:text-7xl">
            The menu
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
            {items.length} things, from Rs {lowest}. Build a basket and check out here, or order
            through Foodpanda if you would rather they handled the delivery.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/custom" variant="wine">
              I want something custom
            </ButtonLink>
            <ButtonLink href={site.foodpanda.url} external variant="outline">
              Order on Foodpanda
            </ButtonLink>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <MenuBrowser categories={catalogue.categories} />
      </div>
    </>
  );
}
