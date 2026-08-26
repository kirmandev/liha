import type { Metadata } from "next";

import { CorporateForm } from "@/components/CorporateForm";
import { LineArt } from "@/components/LineArt";
import { Reveal } from "@/components/Reveal";
import { ScallopFrame } from "@/components/ScallopFrame";
import { Eyebrow, SectionHeading } from "@/components/ui";
import { clients, hasVerifiedClients, offers } from "@/content/corporate";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Corporate & events",
  description: `Corporate gifting, dessert tables, branded boxes and bulk orders for offices, schools and events in ${site.address.city}.`,
  alternates: { canonical: "/corporate" },
};

export default function CorporatePage() {
  return (
    <>
      <header className="bg-butter px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <Eyebrow className="text-wine">Corporate &amp; events</Eyebrow>
            <h1 className="font-display mt-5 text-5xl font-semibold leading-[0.95] tracking-tight text-wine sm:text-7xl">
              Dessert, at
              <br />
              scale.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink">
              Hampers for a hundred, a dessert table for a launch, branded boxes with your logo on
              the lid, or a standing weekly order. Tell her the headcount and the date and she will
              price it.
            </p>
          </div>
          <div className="hidden justify-center lg:flex">
            <LineArt art="brownie" className="size-56 text-wine/40" strokeWidth={2} />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <Reveal>
          <SectionHeading eyebrow="What she takes on" title="Four ways this usually goes" />
        </Reveal>

        <ul className="mt-14 grid gap-5 sm:grid-cols-2">
          {offers.map((offer) => (
            <Reveal as="li" key={offer.id}>
              <div className={`accent-${offer.accent} h-full`}>
                <ScallopFrame size={22} className="h-full bg-(--accent)">
                  <div className="flex h-full flex-col gap-3 px-6 py-6 text-(--accent-on)">
                    <h3 className="font-display text-2xl font-semibold">{offer.title}</h3>
                    <p className="text-sm leading-relaxed opacity-90">{offer.body}</p>
                  </div>
                </ScallopFrame>
              </div>
            </Reveal>
          ))}
        </ul>

        {hasVerifiedClients ? (
          <div className="mt-20">
            <Eyebrow className="text-rust">Worked with</Eyebrow>
            <ul className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
              {clients.map((client) => (
                <li key={client.name}>
                  <span className="font-display text-2xl font-semibold text-wine">
                    {client.name}
                  </span>
                  <span className="ml-3 text-sm text-ink-soft">{client.context}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="bg-blush/50 px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Get a quote"
              title="Send the brief"
              intro="Six fields. It opens WhatsApp with everything written out."
            />
          </Reveal>
          <div className="mt-12">
            <CorporateForm />
          </div>
        </div>
      </section>
    </>
  );
}
