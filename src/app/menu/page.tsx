import type { Metadata } from "next";

import { MenuBrowser } from "@/components/MenuBrowser";
import { ButtonLink, Eyebrow } from "@/components/ui";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Signature cakes, mini loaves, shot boxes, brownies and brown butter cookies, baked to order in Faisal Town, Lahore. Prices from Rs 300.",
  alternates: { canonical: "/menu" },
};

export default function MenuPage() {
  return (
    <>
      <header className="bg-blush/50 px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <Eyebrow className="text-rust">Baked to order</Eyebrow>
          <h1 className="font-display mt-5 text-5xl font-semibold leading-[0.95] tracking-tight text-wine sm:text-7xl">
            The menu
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
            Everything below is available on Foodpanda, which handles delivery and skips the
            back-and-forth. If you would rather message, every item has a WhatsApp button that
            writes the order out for you.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={site.foodpanda.url} external variant="wine">
              Order on Foodpanda
            </ButtonLink>
            <ButtonLink href="/custom" variant="outline">
              I want something custom
            </ButtonLink>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <MenuBrowser />
      </div>
    </>
  );
}
