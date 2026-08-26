import type { Metadata } from "next";

import { CustomCakeForm } from "@/components/CustomCakeForm";
import { LineArt } from "@/components/LineArt";
import { Reveal } from "@/components/Reveal";
import { ScallopFrame } from "@/components/ScallopFrame";
import { Eyebrow, SectionHeading } from "@/components/ui";
import { BASE_FLAVOURS, HOW_IT_WORKS } from "@/content/custom";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Custom cakes",
  description: `Custom birthday, wedding and celebration cakes in ${site.address.city}. Nine base flavours, designed to your brief, ${site.customLeadTimeDays} days' notice.`,
  alternates: { canonical: "/custom" },
};

export default function CustomPage() {
  return (
    <>
      <header className="relative overflow-hidden px-5 py-16 sm:px-8 sm:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 top-0 size-80 rounded-full bg-blush/60 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <Eyebrow className="text-rust">Custom cakes</Eyebrow>
            <h1 className="font-display mt-5 text-5xl font-semibold leading-[0.95] tracking-tight text-wine sm:text-7xl">
              Tell her what
              <br />
              you picture.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
              Fill this in once and it becomes a complete WhatsApp message — occasion, size,
              flavour, date and budget — so the first reply you get is a quote instead of a
              question.
            </p>
          </div>

          <div className="hidden justify-center lg:flex">
            <LineArt art="tieredCake" className="size-64 text-wine/25" strokeWidth={1.6} />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <CustomCakeForm />
      </div>

      <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <Reveal>
          <SectionHeading eyebrow="How it works" title="Three steps, no deposit up front" />
        </Reveal>
        <ol className="mt-12 grid gap-5 md:grid-cols-3">
          {HOW_IT_WORKS.map((step) => (
            <Reveal as="li" key={step.step}>
              <ScallopFrame size={20} className="h-full bg-cream-deep">
                <div className="flex h-full flex-col gap-3 px-5 py-5">
                  <span className="font-display text-4xl font-semibold text-rust">{step.step}</span>
                  <h3 className="font-display text-xl font-semibold text-wine">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-ink-soft">{step.body}</p>
                </div>
              </ScallopFrame>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="bg-wine px-5 py-24 text-cream sm:px-8">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionHeading
              tone="cream"
              eyebrow="Base flavours"
              title="Nine to build on"
              intro="Pick the base here. Fillings, frostings and finishes get worked out with you once she has seen the brief."
            />
          </Reveal>
          <ul className="mt-12 flex flex-wrap gap-3">
            {BASE_FLAVOURS.map((flavour) => (
              <li
                key={flavour}
                className="font-display rounded-full border-2 border-cream/25 px-6 py-3 text-xl font-semibold"
              >
                {flavour}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
