import Image from "next/image";
import Link from "next/link";

import { LineArt } from "@/components/LineArt";
import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { ScallopFrame } from "@/components/ScallopFrame";
import { ButtonLink, Eyebrow, InstagramIcon, SectionHeading, WhatsAppIcon } from "@/components/ui";
import { HOW_IT_WORKS } from "@/content/custom";
import { site } from "@/content/site";
import {
  allEntries,
  featuredEntries,
  findEntry,
  priceRange,
  primaryCategories,
  type Catalogue,
  type CatalogueCategory,
  type CatalogueEntry,
} from "@/lib/catalogue";
import { getCatalogue } from "@/lib/cms";
import { formatPKR } from "@/lib/format";
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

/**
 * The three photographs that carry the hero, lead first, used when the
 * catalogue does not name its own.
 *
 * Chosen for how they photograph, not for what sells most: the London Cake
 * cross-section shows its layers and reads as patisserie, where a cake in a
 * clear takeaway tub reads as a delivery-app listing. The Matilda tub brings
 * the branded packaging; the churros bring warmth and motion.
 */
const DEFAULT_HERO = ["the-london-cake", "matilda-cake", "churros-with-chocolate-sauce"];

export default async function Home() {
  const catalogue = await getCatalogue();

  return (
    <>
      <Hero catalogue={catalogue} />
      <Marquee />
      <FlavourOfTheMonth catalogue={catalogue} />
      <Categories catalogue={catalogue} />
      <Signatures items={featuredEntries(catalogue)} />
      <HowItWorks catalogue={catalogue} />
      <MeetTheBaker />
      <CustomCakes />
      <Corporate catalogue={catalogue} />
      <Proof />
    </>
  );
}

function Hero({ catalogue }: { catalogue: Catalogue }) {
  const slugs = catalogue.heroSlugs?.length ? catalogue.heroSlugs : DEFAULT_HERO;
  const [lead, second, third] = slugs.map((slug) => findEntry(catalogue, slug));

  return (
    <section className="relative overflow-hidden bg-cream px-5 pb-16 pt-6 sm:px-8 sm:pb-24 sm:pt-12 lg:pt-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-10 size-96 rounded-full bg-blush/70 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-0 size-80 rounded-full bg-butter/40 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        {/* Text second on small screens, first on large — see the photo block. */}
        <div className="order-last lg:order-first">
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
                {catalogue.settings.customLeadTimeDays} days
                <span className="ml-2 text-sm font-normal text-ink-soft">notice</span>
              </dd>
            </div>
          </dl>
        </div>

        {/* Three photographs, the largest scalloped so the frame that carries
            her Instagram identity survives the move to photography.

            Rendered above the headline on phones. Most visitors arrive from
            Instagram on a phone, and the first screen of a bakery site has to
            show cake. On desktop the text leads and the photos sit beside it. */}
        <div className="relative order-first mx-auto w-full max-w-lg lg:order-last">
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
                      src={lead.image}
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
                    src={second.image}
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
                    src={third.image}
                    alt={third.imageAlt}
                    fill
                    sizes="30vw"
                    className="photo-zoom object-cover"
                  />
                </div>
              </Link>
            ) : null}
          </div>

          <div className="absolute -left-3 -top-3 flex size-20 rotate-[-8deg] items-center justify-center rounded-full bg-butter text-center shadow-sm sm:-left-6 sm:-top-4 sm:size-24">
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

/**
 * This month's special, as a spotlight rather than a card among cards.
 *
 * Driven entirely by the catalogue: the section renders only while the
 * "Flavour of the Month" category has an item in it, and that item disappears
 * on its own when the owner's availability window closes. Nothing here has to
 * be remembered or taken down by hand — which is the point of a monthly item
 * having its own section instead of a tile someone forgets to update.
 */
function FlavourOfTheMonth({ catalogue }: { catalogue: Catalogue }) {
  const category = catalogue.categories.find((entry) => entry.slug === "flavour-of-the-month");
  const item = category?.items.find((entry) => entry.image) ?? category?.items[0];
  if (!category || !item) return null;

  return (
    <section className={`accent-${category.accent} px-5 py-20 sm:px-8 sm:py-24`}>
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="grid items-center gap-10 rounded-[2.5rem] bg-(--accent-soft) p-6 sm:p-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:p-14">
            <Link
              href={`/product/${item.slug}`}
              className="group relative mx-auto w-full max-w-md"
              aria-label={item.name}
            >
              <ScallopFrame size={26} className="bg-(--accent)" variant="solid">
                <div className="photo-frame relative aspect-square w-full">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.imageAlt}
                      fill
                      sizes="(min-width: 1024px) 40vw, 90vw"
                      className="photo-zoom object-cover"
                    />
                  ) : null}
                </div>
              </ScallopFrame>
              <span className="absolute -right-2 -top-3 rotate-6 rounded-full bg-wine px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cream shadow-sm sm:-right-4">
                Only while it lasts
              </span>
            </Link>

            <div>
              <Eyebrow className="text-(--accent)">
                <span className="inline-block size-2 rounded-full bg-(--accent)" />
                {category.name}
              </Eyebrow>
              <h2 className="font-display mt-4 text-4xl font-semibold leading-[1.02] tracking-tight text-wine sm:text-5xl lg:text-6xl">
                {item.name}
              </h2>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-soft">
                {item.description}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <ButtonLink href={`/product/${item.slug}`} variant="wine" className="px-7 py-3.5">
                  Order it — {formatPKR(item.price)}
                </ButtonLink>
                <p className="text-sm text-ink-soft">{category.blurb}</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Categories({ catalogue }: { catalogue: Catalogue }) {
  const everything = allEntries(catalogue);
  const lowest = everything.length ? Math.min(...everything.map((item) => item.price)) : 0;

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
        {primaryCategories(catalogue)
          // The month's special has its own spotlight above; a tile as well
          // would be the same photograph twice on one screen. An empty
          // category has nothing to show and would render as a blank box.
          .filter((category) => category.slug !== "flavour-of-the-month")
          .filter((category) => category.items.length > 0)
          .map((category) => (
            <Reveal as="li" key={category.id}>
              <CategoryCard category={category} />
            </Reveal>
          ))}

        {/* Fills the grid to a full row and doubles as the way in. The extras
            — sauces, gift notes, custom cakes — live only on the full menu. */}
        <Reveal as="li">
          <Link href="/menu" className="group flex h-full flex-col">
            <div className="relative flex aspect-[4/5] w-full flex-col justify-between overflow-hidden rounded-2xl bg-wine p-5 text-cream">
              <span
                aria-hidden
                className="pointer-events-none absolute -bottom-10 -right-10 size-40 rounded-full bg-rust/40 blur-2xl"
              />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-butter">
                The whole menu
              </span>
              <div>
                <p className="font-display text-5xl font-semibold leading-none">
                  {everything.length}
                </p>
                <p className="mt-2 text-sm text-cream/80">things, from {formatPKR(lowest)}</p>
              </div>
              <span className="font-display text-xl font-semibold transition-transform group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0">
                See everything →
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Sauces, gift notes and custom cakes are on the full menu.
            </p>
          </Link>
        </Reveal>
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

/**
 * How an order actually goes, in three steps.
 *
 * Nothing is charged on the site — staff confirm by phone and send payment
 * details — and a checkout that takes no card money surprises people. Saying
 * so plainly, before they reach it, turns that surprise into a reason to
 * trust the shop: a human will call.
 */
function HowItWorks({ catalogue }: { catalogue: Catalogue }) {
  const steps = [
    {
      art: "layerCake" as const,
      title: "Pick from the menu",
      body: "Build a basket here. Add a sauce, add a note, check out in a minute. No account needed.",
    },
    {
      art: "whisk" as const,
      title: "We confirm on WhatsApp",
      body: "Nothing is charged online. We call to confirm, send you the JazzCash or bank details, and get baking once it lands.",
    },
    {
      art: "shotBox" as const,
      title: `Delivered across ${site.address.city}`,
      body: `Baked the day it goes out. LIHA covers ${formatPKR(catalogue.settings.deliverySubsidy)} of the rider fare; the rest is confirmed with you before dispatch.`,
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
      <Reveal>
        <SectionHeading
          eyebrow="How it works"
          title="Three steps, one phone call"
          intro="No card is taken on the site. Here is what happens instead."
        />
      </Reveal>

      <ol className="mt-12 grid gap-5 md:grid-cols-3">
        {steps.map((step, index) => (
          <Reveal as="li" key={step.title}>
            <div className="flex h-full flex-col gap-5 rounded-blob border-2 border-wine/10 bg-cream-deep/50 p-7">
              <div className="flex items-center justify-between">
                <span className="flex size-12 items-center justify-center rounded-full bg-wine text-cream">
                  <LineArt art={step.art} className="size-7" strokeWidth={2.4} />
                </span>
                <span className="font-display text-3xl font-semibold text-rust/70">
                  0{index + 1}
                </span>
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold text-wine">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.body}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

/**
 * The person behind the shop.
 *
 * "Trained in Dubai" is the site's whole claim, and until now nothing on it
 * had a face. The portrait is a placeholder for the moment — a frame that is
 * the right size and in the right place, so the photograph drops in with no
 * layout change when it arrives. The copy is hers already, from the About page.
 */
function MeetTheBaker() {
  return (
    <section className="bg-wine-soft/60 px-5 py-24 sm:px-8">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <Reveal className="mx-auto w-full max-w-sm lg:max-w-none">
          <div className="relative">
            <PhotoPlaceholder label="Her portrait, coming soon" art="whisk" />
            <div className="absolute -bottom-4 -right-2 rotate-3 rounded-full bg-butter px-5 py-3 text-center shadow-sm sm:-right-5">
              <p className="font-display text-sm font-semibold leading-tight text-ink">
                {site.credentials.formerly}
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <SectionHeading
            eyebrow="The baker"
            title={
              <>
                One pastry chef.
                <br />
                Every single bake.
              </>
            }
            intro="LIHA is one person. She spent years on the pastry sections of five-star resorts in the UAE — the kind of kitchen where a dessert leaves the pass a hundred times a night and has to be identical every time."
          />
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">
            That is the standard the bakeshop runs on now, out of {site.address.locality}.
            Everything is baked to order rather than made ahead and frozen, which is why the menu
            is deliberately short and why custom cakes need a few days.
          </p>

          <dl className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              { label: "Trained", value: site.credentials.formerly },
              { label: "Based", value: `${site.address.locality}, ${site.address.city}` },
              {
                label: "Rated",
                value: `${site.foodpanda.rating}★ · ${site.foodpanda.reviewCount} reviews`,
              },
            ].map((stat) => (
              <div key={stat.label} className="border-l-2 border-rust/40 pl-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
                  {stat.label}
                </dt>
                <dd className="font-display mt-1 text-lg font-semibold leading-snug text-wine">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/about" variant="wine">
              Read her story
            </ButtonLink>
            <ButtonLink href={site.instagram.url} external variant="outline">
              <InstagramIcon className="size-4" />
              {site.instagram.handle}
            </ButtonLink>
          </div>
        </Reveal>
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

function Corporate({ catalogue }: { catalogue: Catalogue }) {
  // A shot box is a gift box: the natural image for corporate orders. Falls
  // back to the line-art only if both products are withdrawn from the menu.
  const box =
    findEntry(catalogue, "brownie-shot-box") ?? findEntry(catalogue, "cookie-shot-box");

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
          {box?.image ? (
            <Link
              href={`/product/${box.slug}`}
              className="group w-full max-w-sm"
              aria-label={box.name}
            >
              <ScallopFrame size={24} className="bg-butter" variant="solid">
                <div className="photo-frame relative aspect-square w-full">
                  <Image
                    src={box.image}
                    alt={box.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 30vw, 80vw"
                    className="photo-zoom object-cover"
                  />
                </div>
              </ScallopFrame>
            </Link>
          ) : (
            <LineArt art="shotBox" className="size-56 text-cream/80 sm:size-64" strokeWidth={1.8} />
          )}
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
