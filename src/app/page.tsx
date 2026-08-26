import Link from "next/link";

import { LineArt } from "@/components/LineArt";
import { Reveal } from "@/components/Reveal";
import { ScallopFrame } from "@/components/ScallopFrame";
import { ButtonLink, Eyebrow, InstagramIcon, SectionHeading, WhatsAppIcon } from "@/components/ui";
import { CATEGORY_ART } from "@/components/LineArt";
import { HOW_IT_WORKS } from "@/content/custom";
import { categories, priceRange, signatureItems } from "@/content/menu";
import { site } from "@/content/site";
import { formatPKR } from "@/lib/format";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const MARQUEE_WORDS = [
  "Dubai Kunafa Cake",
  "Brown Butter Cookies",
  "Fudge Brownies",
  "Tiramisu",
  "Cinnamon Coffee Cake",
  "Shot Boxes",
  "Custom Cakes",
];

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <Categories />
      <Signatures />
      <CustomCakes />
      <Corporate />
      <Proof />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
      {/* Soft colour fields behind the type. Decorative only. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-10 size-96 rounded-full bg-blush/70 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-0 size-80 rounded-full bg-butter/40 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.15fr_1fr]">
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
            Town. Signature cakes and small-batch bakes on the menu — and custom cakes made to
            whatever you have in your head.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/custom" variant="wine" className="px-7 py-4 text-base">
              Design a custom cake
            </ButtonLink>
            <ButtonLink href="/menu" variant="outline" className="px-7 py-4 text-base">
              See the menu
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

        {/* Illustration panel. Stands in for photography, and stays even once
            photographs arrive — it is the brand mark, not a placeholder. */}
        <div className="relative mx-auto w-full max-w-md">
          <ScallopFrame size={34} className="bg-wine" variant="solid">
            <div className="flex aspect-square items-center justify-center px-6">
              <LineArt art="tieredCake" className="w-full text-cream" strokeWidth={1.6} />
            </div>
          </ScallopFrame>

          <div className="absolute -bottom-6 -left-6 flex size-28 items-center justify-center rounded-full bg-butter text-center sm:-left-10 sm:size-32">
            <span className="font-display text-sm font-semibold leading-tight text-ink">
              Made
              <br />
              to order
            </span>
          </div>

          <div className="absolute -right-3 -top-6 flex size-20 rotate-12 items-center justify-center rounded-full bg-pistachio sm:-right-6 sm:size-24">
            <LineArt art="bow" className="size-12 text-[#1e2a17]" strokeWidth={3} />
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

function Categories() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
      <Reveal>
        <SectionHeading
          eyebrow="The menu"
          title="Six things she does properly"
          intro="Everything on the menu is baked the day it goes out. Colour-coded here and everywhere else on the site, so you always know what you are looking at."
        />
      </Reveal>

      <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const range = priceRange(category);
          return (
            <Reveal as="li" key={category.id}>
              <Link
                href={`/menu#${category.id}`}
                className={`accent-${category.accent} group block h-full`}
              >
                <ScallopFrame size={22} className="h-full bg-(--accent)">
                  <div className="flex h-full flex-col gap-5 px-5 py-5 text-(--accent-on)">
                    <LineArt
                      art={CATEGORY_ART[category.id] ?? "layerCake"}
                      className="size-16 transition-transform duration-300 group-hover:-rotate-6 motion-reduce:group-hover:rotate-0"
                      strokeWidth={2.2}
                    />
                    <div>
                      <h3 className="font-display text-2xl font-semibold">{category.name}</h3>
                      <p className="mt-2 text-sm leading-relaxed opacity-85">{category.blurb}</p>
                    </div>
                    <p className="mt-auto text-sm font-semibold">
                      {range ?? "Quoted to your brief"}
                      <span className="ml-2 opacity-70 transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </p>
                  </div>
                </ScallopFrame>
              </Link>
            </Reveal>
          );
        })}
      </ul>
    </section>
  );
}

function Signatures() {
  return (
    <section className="bg-blush/45 px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeading
            eyebrow="Start here"
            title="If it is your first order"
            intro="The four people come back for. All available on Foodpanda, which is the quickest way to get one today."
          />
        </Reveal>

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {signatureItems.map((item) => (
            <Reveal as="li" key={item.id}>
              <div
                className={`accent-${item.category.accent} flex h-full flex-col gap-4 rounded-blob bg-cream p-6`}
              >
                <span className="inline-flex w-fit rounded-full bg-(--accent) px-3 py-1 text-xs font-semibold text-(--accent-on)">
                  {item.category.name}
                </span>
                <h3 className="font-display text-2xl font-semibold leading-tight text-wine">
                  {item.name}
                </h3>
                {item.note ? <p className="text-sm text-ink-soft">{item.note}</p> : null}
                <p className="font-display mt-auto text-3xl font-semibold text-rust">
                  {item.price != null ? formatPKR(item.price) : "On request"}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>

        <div className="mt-12 flex flex-wrap gap-3">
          <ButtonLink href={site.foodpanda.url} external variant="wine">
            Order on Foodpanda
          </ButtonLink>
          <ButtonLink href="/menu" variant="outline">
            Read the full menu
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
                <span className="text-butter">★</span> across{" "}
                {site.foodpanda.reviewCount} reviews, and a kitchen that trained on five-star resort
                pastry sections in the UAE.
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
