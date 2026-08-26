import type { Metadata } from "next";

import { LineArt } from "@/components/LineArt";
import { Reveal } from "@/components/Reveal";
import { ScallopFrame } from "@/components/ScallopFrame";
import { ButtonLink, Eyebrow, InstagramIcon, SectionHeading } from "@/components/ui";
import { faqs } from "@/content/faq";
import { site } from "@/content/site";
import { hasTestimonials, testimonials } from "@/content/testimonials";

export const metadata: Metadata = {
  title: "About",
  description: `The pastry chef behind ${site.fullName} — five-star resort kitchens in the UAE, now baking to order in ${site.address.locality}, ${site.address.city}.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <header className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <Eyebrow className="text-rust">The baker</Eyebrow>
            <h1 className="font-display mt-5 text-5xl font-semibold leading-[0.95] tracking-tight text-wine sm:text-7xl">
              Resort pastry,
              <br />
              home kitchen.
            </h1>
            <div className="mt-8 flex max-w-xl flex-col gap-5 text-lg leading-relaxed text-ink-soft">
              <p>
                LIHA is one pastry chef. She spent years on the pastry sections of five-star resorts
                in the UAE — the kind of kitchen where a dessert leaves the pass a hundred times a
                night and has to be identical every time.
              </p>
              <p>
                That is the standard the bakeshop runs on now, out of {site.address.locality} in{" "}
                {site.address.city}. Everything is baked to order rather than made ahead and frozen,
                which is why custom cakes need {site.customLeadTimeDays} days and why the menu is
                deliberately short.
              </p>
              <p>
                What she is best known for: the Dubai kunafa cake, brown butter cookies, and custom
                cakes built from a photograph someone sends her at eleven at night.
              </p>
            </div>
          </div>

          <div className="mx-auto w-full max-w-sm">
            <ScallopFrame size={30} className="bg-blush">
              <div className="flex aspect-square items-center justify-center p-8">
                <LineArt art="whisk" className="w-2/3 text-wine" strokeWidth={2} />
              </div>
            </ScallopFrame>
          </div>
        </div>
      </header>

      <section className="bg-wine px-5 py-20 text-cream sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-3">
          {[
            { label: "Trained", value: site.credentials.formerly },
            { label: "Based", value: `${site.address.locality}, ${site.address.city}` },
            {
              label: "Rated",
              value: `${site.foodpanda.rating}★ from ${site.foodpanda.reviewCount} reviews`,
            },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-butter">
                {stat.label}
              </p>
              <p className="font-display mt-3 text-2xl font-semibold leading-tight">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      {hasTestimonials ? (
        <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
          <Reveal>
            <SectionHeading eyebrow="In their words" title="What customers say" />
          </Reveal>
          <ul className="mt-14 grid gap-5 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Reveal as="li" key={testimonial.quote}>
                <ScallopFrame size={20} className="h-full bg-cream-deep">
                  <div className="flex h-full flex-col gap-4 px-5 py-5">
                    <p className="font-display text-lg leading-snug text-wine">
                      “{testimonial.quote}”
                    </p>
                    <p className="mt-auto text-sm text-ink-soft">
                      {testimonial.author}
                      {testimonial.context ? ` — ${testimonial.context}` : ""}
                    </p>
                  </div>
                </ScallopFrame>
              </Reveal>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mx-auto max-w-3xl px-5 py-24 sm:px-8">
        <Reveal>
          <SectionHeading eyebrow="Before you order" title="Questions she gets asked" />
        </Reveal>

        <div className="mt-12 flex flex-col gap-3">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-blob border-2 border-wine/12 bg-cream px-6 py-5 open:bg-blush/40"
            >
              <summary className="font-display cursor-pointer list-none text-xl font-semibold text-wine marker:content-none">
                <span className="flex items-start justify-between gap-4">
                  {faq.question}
                  <span
                    aria-hidden
                    className="mt-1 shrink-0 text-rust transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-4 leading-relaxed text-ink-soft">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
        <div className="rounded-blob bg-pistachio px-6 py-14 text-center text-[#1e2a17] sm:px-12">
          <h2 className="font-display mx-auto max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
            Ready when you are.
          </h2>
          <p className="mx-auto mt-5 max-w-lg leading-relaxed opacity-80">
            Menu items go out through Foodpanda. Custom cakes start with a brief. Everything else,
            just message her.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/custom" variant="wine">
              Design a cake
            </ButtonLink>
            <ButtonLink href={site.instagram.url} external variant="outline">
              <InstagramIcon className="size-4" />
              {site.instagram.handle}
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
