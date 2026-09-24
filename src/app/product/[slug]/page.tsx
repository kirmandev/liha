import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCart } from "@/components/AddToCart";
import { ProductCard } from "@/components/ProductCard";
import { ButtonLink, Eyebrow } from "@/components/ui";
import { allProducts, findProduct, productImage, sauceAddOns } from "@/content/menu";
import { site } from "@/content/site";
import { formatPKR } from "@/lib/format";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function generateStaticParams() {
  return allProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) return { title: "Not found" };

  const image = productImage(product);
  return {
    title: product.name,
    description: product.description.slice(0, 155),
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: `${product.name} — ${site.fullName}`,
      description: product.description.slice(0, 155),
      url: `/product/${product.slug}`,
      images: image ? [{ url: image, width: 1200, height: 1200, alt: product.name }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) notFound();

  const image = productImage(product);
  const isCustom = product.category.orderVia === "whatsapp";

  // Flattened before crossing the client boundary — see AddToCart's note.
  const sauceOptions = sauceAddOns.map((sauce) => ({
    slug: sauce.slug,
    name: sauce.name,
    price: sauce.price ?? 0,
  }));

  // Siblings first, then anything else, so "more like this" is genuinely like this.
  const related = allProducts
    .filter(
      (entry) =>
        entry.slug !== product.slug &&
        entry.category.id === product.category.id &&
        entry.price != null,
    )
    .slice(0, 4);

  return (
    <>
      <div className={`accent-${product.category.accent}`}>
        <nav aria-label="Breadcrumb" className="mx-auto max-w-6xl px-5 pt-8 sm:px-8">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
            <li>
              <Link href="/menu" className="hover:text-wine">
                Menu
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href={`/menu#${product.category.id}`} className="hover:text-wine">
                {product.category.name}
              </Link>
            </li>
          </ol>
        </nav>

        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-16">
          <div className="photo-frame relative aspect-square w-full overflow-hidden rounded-3xl">
            {image ? (
              <Image
                src={image}
                alt={product.name}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-(--accent-soft) px-10 text-center">
                <span className="font-display text-3xl font-semibold text-wine">
                  Made to your brief
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <Eyebrow className="text-rust">{product.category.name}</Eyebrow>

            <h1 className="font-display mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-wine sm:text-5xl">
              {product.name}
            </h1>

            {product.note ? (
              <p className="mt-2 text-sm uppercase tracking-[0.14em] text-ink-soft">
                {product.note}
              </p>
            ) : null}

            <p className="font-display mt-5 text-3xl font-semibold text-rust">
              {product.price != null ? formatPKR(product.price) : "Quoted to your brief"}
            </p>

            <p className="mt-6 leading-relaxed text-ink-soft">{product.description}</p>

            <div className="mt-9">
              {isCustom ? (
                <div className="flex flex-wrap gap-3">
                  <ButtonLink href="/custom" variant="wine" className="px-7 py-3.5">
                    Start a brief
                  </ButtonLink>
                  <ButtonLink
                    href={buildWhatsAppUrl({ kind: "general" })}
                    external
                    variant="outline"
                  >
                    Message on WhatsApp
                  </ButtonLink>
                </div>
              ) : (
                <AddToCart
                  slug={product.slug}
                  price={product.price ?? 0}
                  pairsWithSauces={product.pairsWithSauces}
                  sauces={sauceOptions}
                />
              )}
            </div>

            <dl className="mt-10 grid gap-4 border-t border-wine/12 pt-8 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-ink">Delivery</dt>
                <dd className="mt-1 text-ink-soft">
                  Across {site.address.city}. LIHA covers {formatPKR(site.commerce.deliverySubsidy)}{" "}
                  of the rider fare; the rest is confirmed with you before dispatch.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Baked to order</dt>
                <dd className="mt-1 text-ink-soft">
                  Everything is made the day it goes out, from {site.address.locality}.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="border-t border-wine/10 bg-cream-deep/40 px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-2xl font-semibold text-wine sm:text-3xl">
              More {product.category.name.toLowerCase()}
            </h2>
            <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
              {related.map((entry) => (
                <li key={entry.slug}>
                  <ProductCard product={entry} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}
