import Image from "next/image";
import Link from "next/link";

import { LineArt } from "@/components/LineArt";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { ScallopFrame } from "@/components/ScallopFrame";
import { ButtonLink, Eyebrow, InstagramIcon, SectionHeading, WhatsAppIcon } from "@/components/ui";
import { HOW_IT_WORKS } from "@/content/custom";
import { site } from "@/content/site";
import {
  featuredEntries,
  findEntry,
  priceRange,
  primaryCategories,
  type Catalogue,
  type CatalogueCategory,
  type CatalogueEntry,
} from "@/lib/catalogue";
import { getCatalogue } from "@/lib/cms";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const MARQUEE_WORDS = [
  "Dubai Chocolate Cake",
  "Brown Butter Cookies",
  "The Milo Brownie",
  "Coffee Tiramisu",
  "New York Cheesecake",
  "Churros",
  "Shot Boxes",
  "Custom Cakes",
];

/** The three photographs that carry the hero. */
const HERO_SLUGS = ["dubai-chocolate-cake-for-one", "brookie", "churros-with-chocolate-sauce"];

export default async function Home() {
  const catalogue = await getCatalogue();

  return (
    <>
      <Hero catalogue={catalogue} />
      <Marquee />
      <Categories catalogue={catalogue} />
      <Signatures items={featuredEntries(catalogue)} />
      <CustomCakes />
      <Corporate />
      <Proof />
    </>
  );
}

function Hero({ catalogue }: { catalogue: Catalogue }) {
  const [lead, second, third] = HERO_SLUGS.map((slug) => findEntry(catalogue, slug));

  return (
    <section className="relative overflow-hidden bg-cream px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-10 size-96 rounded-full bg-blush/70 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-0 size-80 rounded-full bg-butter/40 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div>
          <Eyebrow className="text-rust">
            <span className="inline-block size-2 rounded-full bg-pistachio" />
            {site.address.locality}, {site.address.city}
          </Eyebrow>

          <h1 className="font-display mt-6 text-6xl font-semibold leading-[0.92] tracking-tight text-wine sm:text-7xl lg:text-8xl">
            Trained
            <br />
            in Dubai.
            <br />
            <span className="text-rust">Baked</span> in
            <br />
            Lahore.
          </h1>

          <p className="mt-8 max-w-lg text-lg leading-relaxed text-ink-soft">
            A pastry chef from five-star resorts in the UAE, now baking to order out of Faisal
            Town. Order the menu straight from here — or bring a picture and have a cake made to
            whatever you have in your head.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/menu" variant="wine" className="px-7 py-4 text-base">
              Order from the menu
            </ButtonLink>
            <ButtonLink href="/custom" variant="outline" className="px-7 py-4 text-base">
              Design a custom cake
            </ButtonLink>
          </div>

          <dl className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-5">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">
                Rated
              </dt>
              <dd className="font-display mt-1 text-2xl font-semibold text-wine">
                {site.foodpanda.rating}
                <span className="text-butter">★</span>
                <span className="ml-2 text-sm font-normal text-ink-soft">
                  from {site.foodpanda.reviewCount} reviews
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">
                Custom cakes
              </dt>
              <dd className="font-display mt-1 text-2xl font-semibold text-wine">
                {site.customLeadTimeDays} days
                <span className="ml-2 text-sm font-normal text-ink-soft">notice</span>
              </dd>
            </div>
          </dl>
        </div>

        {/* Three photographs, the largest scalloped so the frame that carries
            her Instagram identity survives the move to photography. */}
        <div className="relative mx-auto w-full max-w-lg">
          <div className="grid grid-cols-5 grid-rows-5 gap-3 sm:gap-4">
            {lead?.image ? (
              <Link
                href={`/product/${lead.slug}`}
                className="group col-span-5 row-span-3 sm:col-span-4"
                aria-label={lead.name}
              >
                <ScallopFrame size={26} className="h-full bg-wine" variant="solid">
                  <div className="photo-frame relative h-full min-h-56 w-full">
                    <Image
                      src={lead.image ?? ""}
                      alt={lead.imageAlt}
                      fill
                      priority
                      sizes="(min-width: 1024px) 40vw, 90vw"
                      className="photo-zoom object-cover"
                    />
                  </div>
                </ScallopFrame>
              </Link>
            ) : null}

            {second?.image ? (
              <Link
                href={`/product/${second.slug}`}
                className="group col-span-2 row-span-2 sm:col-span-2"
                aria-label={second.name}
              >
                <div className="photo-frame relative h-full min-h-32 w-full overflow-hidden rounded-2xl">
                  <Image
                    src={second.image ?? ""}
                    alt={second.imageAlt}
                    fill
                    priority
                    sizes="30vw"
                    className="photo-zoom object-cover"
                  />
                </div>
              </Link>
            ) : null}

            {third?.image ? (
              <Link
                href={`/product/${third.slug}`}
                className="group col-span-3 row-span-2 sm:col-span-2"
                aria-label={third.name}
              >
                <div className="photo-frame relative h-full min-h-32 w-full overflow-hidden rounded-2xl">
                  <Image
                    src={third.image ?? ""}
                    alt={third.imageAlt}
                    fill
                    sizes="30vw"
                    className="photo-zoom object-cover"
                  />
                </div>
              </Link>
            ) : null}
          </div>

          <div className="absolute -bottom-5 -left-3 flex size-24 rotate-[-8deg] items-center justify-center rounded-full bg-butter text-center sm:-left-7 sm:size-28">
            <span className="font-display text-sm font-semibold leading-tight text-ink">
              Made
              <br />
              to order
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const strip = [...MARQUEE_WORDS, ...MARQUEE_WORDS];
  return (
    <div className="overflow-hidden border-y-2 border-wine bg-wine py-4" aria-hidden>
      <div className="marquee-track">
        {strip.map((word, index) => (
          <span
            key={`${word}-${index}`}
            className="font-display flex shrink-0 items-center gap-6 px-6 text-xl font-semibold text-cream sm:text-2xl"
          >
            {word}
            <span className="text-butter">✳</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Categories({ catalogue }: { catalogue: Catalogue }) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
      <Reveal>
        <SectionHeading
          eyebrow="The menu"
          title="Everything she does properly"
          intro="Baked the day it goes out, in Faisal Town. Colour-coded here and everywhere else on the site, so you always know what you are looking at."
        />
      </Reveal>

      <ul className="mt-14 grid grid-cols-2 gap-x-5 gap-y-9 lg:grid-cols-4">
        {primaryCategories(catalogue).map((category) => (
          <Reveal as="li" key={category.id}>
            <CategoryCard category={category} />
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

/**
 * A category tile, fronted by its first product's photograph.
 *
 * The representative image is taken from the category rather than a hardcoded
 * map of slugs: the owner now controls both the categories and the order of
 * products within them, so any fixed mapping would rot the first time they
 * rename a section or reorder its items.
 */
function CategoryCard({ category }: { category: CatalogueCategory }) {
  const range = priceRange(category);
  const cover = category.items.find((item) => item.image);

  return (
    <Link
      href={`/menu#${category.slug}`}
      className={`accent-${category.accent} group flex h-full flex-col`}
    >
      <div className="photo-frame relative aspect-[4/5] w-full overflow-hidden rounded-2xl">
        {cover?.image ? (
          <Image
            src={cover.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="photo-zoom object-cover"
          />
        ) : (
          <div className="h-full w-full bg-(--accent-soft)" />
        )}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink/75 via-ink/25 to-transparent"
        />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="font-display text-xl font-semibold leading-tight text-cream">
            {category.name}
          </h3>
          {range ? <p className="mt-1 text-xs font-semibold text-cream/85">{range}</p> : null}
        </div>
        <span aria-hidden className="absolute right-3 top-3 size-3 rounded-full bg-(--accent)" />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{category.blurb}</p>
    </Link>
  );
}

function Signatures({ items }: { items: CatalogueEntry[] }) {
  if (items.length === 0) return null;

  return (
    <section className="bg-blush/45 px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeading
            eyebrow="Start here"
            title="If it is your first order"
            intro="The ones people come back for. Add them straight to your cart."
          />
        </Reveal>

        <ul className="mt-14 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {items.map((item) => (
            <Reveal as="li" key={item.slug}>
              <ProductCard product={item} />
            </Reveal>
          ))}
        </ul>

        <div className="mt-12 flex flex-wrap gap-3">
          <ButtonLink href="/menu" variant="wine">
            See the full menu
          </ButtonLink>
          <ButtonLink href={site.foodpanda.url} external variant="outline">
            Order on Foodpanda
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

function CustomCakes() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
      <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <Reveal>
          <SectionHeading
            eyebrow="Custom cakes"
            title={
              <>
                Bring a picture.
                <br />
                Leave with the cake.
              </>
            }
            intro="Birthdays, weddings, the office send-off. Choose from nine base flavours, describe what you want, and she builds it. Four days' notice, because it is made rather than taken off a shelf."
          />

          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/custom" variant="wine">
              Start a brief
            </ButtonLink>
            <ButtonLink href={buildWhatsAppUrl({ kind: "general" })} external variant="outline">
              <WhatsAppIcon className="size-4" />
              Just message her
            </ButtonLink>
          </div>
        </Reveal>

        <Reveal>
          <ol className="flex flex-col gap-4">
            {HOW_IT_WORKS.map((step) => (
              <li key={step.step}>
                <ScallopFrame size={20} className="bg-blush">
                  <div className="flex gap-5 px-5 py-4">
                    <span className="font-display text-3xl font-semibold text-rust">
                      {step.step}
                    </span>
                    <div>
                      <h3 className="font-display text-xl font-semibold text-wine">{step.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-ink-soft">{step.body}</p>
                    </div>
                  </div>
                </ScallopFrame>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}

function Corporate() {
  return (
    <section className="bg-wine px-5 py-24 text-cream sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <Reveal>
          <SectionHeading
            tone="cream"
            eyebrow="Corporate & events"
            title="Bulk orders, done to a brief"
            intro="Gift hampers, dessert tables, branded boxes and standing weekly orders — for offices, schools, launches and exhibitions across Lahore."
          />
          <div className="mt-10">
            <ButtonLink href="/corporate" variant="butter">
              Talk about an event
            </ButtonLink>
          </div>
        </Reveal>

        <Reveal className="flex justify-center">
          <div className="relative">
            <LineArt art="shotBox" className="size-56 text-cream/80 sm:size-64" strokeWidth={1.8} />
            <div className="slow-spin absolute -right-4 -top-4 flex size-24 items-center justify-center rounded-full border-2 border-butter/50">
              <LineArt art="cookie" className="size-12 text-butter" strokeWidth={2.6} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Proof() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
      <div className="grid gap-6 md:grid-cols-3">
        <Reveal className="md:col-span-2">
          <div className="flex h-full flex-col justify-between gap-8 rounded-blob bg-cream-deep p-8 sm:p-10">
            <div>
              <Eyebrow className="text-rust">Why people come back</Eyebrow>
              <p className="font-display mt-5 text-3xl font-semibold leading-tight text-wine sm:text-4xl">
                {site.foodpanda.rating}
                <span className="text-butter">★</span> across {site.foodpanda.reviewCount} reviews,
                and a kitchen that trained on five-star resort pastry sections in the UAE.
              </p>
            </div>
            <a
              href={site.foodpanda.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-rust underline underline-offset-4"
            >
              Read the reviews on Foodpanda →
            </a>
          </div>
        </Reveal>

        <Reveal>
          <div className="flex h-full flex-col justify-between gap-8 rounded-blob bg-pistachio p-8 text-[#1e2a17] sm:p-10">
            <div>
              <Eyebrow>Follow along</Eyebrow>
              <p className="font-display mt-5 text-3xl font-semibold leading-tight">
                Every bake goes up on Instagram first.
              </p>
            </div>
            <a
              href={site.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#1e2a17] px-5 py-3 text-sm font-semibold text-cream"
            >
              <InstagramIcon className="size-4" />
              {site.instagram.handle}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
