# LIHA | bakeshop — website design

Date: 2026-08-26
Status: approved, building

## Context

LIHA is a one-person pastry operation in Faisal Town, Lahore, run by a chef who previously worked at five-star resorts in the UAE. The business currently lives on Instagram (`@lihabakeshop`, 152 posts, 696 followers) and Foodpanda (4.9 stars from 37 reviews). Orders arrive as Instagram DMs.

The site replaces the DM-and-screenshot workflow with something that can be linked from the Instagram bio, ranks for "custom cakes Lahore", and routes each kind of order to the channel that actually suits it.

## Constraints

- No backend, no database, no auth. Static output, deployable to Vercel's free tier.
- One person maintains it. Editing the menu must mean editing one typed file.
- Photography is not yet available. The design must look finished without it.
- Instagram's API is not accessible (see "Rejected approaches").

## Brand

She already has a visual identity, visible in her Instagram menu cards: a scalloped cloud border tied with a bow, hand-drawn line-art pastries, script headings, rendered in rust on pale blush. The site extends that identity rather than replacing it.

### Palette

Her existing warm colours are the base. Two pops are grafted on — green and yellow, the two hues that extend a warm scheme instead of fighting it. A cold pink or cyan would have read as a different brand.

| Token | Hex | Role |
|---|---|---|
| `wine` | `#6E1B2E` | Logo, primary text, nav, footer |
| `rust` | `#B0532C` | Her menu ink; borders, line art |
| `blush` | `#F7DCD8` | Her menu ground; soft fields |
| `cream` | `#FDF6EF` | Page canvas |
| `ink` | `#2A1A1C` | Body copy |
| `butter` | `#F2C14E` | Pop |
| `pistachio` | `#8FBF6B` | Pop |
| `tangerine` | `#EE8A4F` | Pop |

**Contrast rule that shapes the system:** the four pops fail WCAG AA as small text on cream. They are therefore only ever backgrounds, fills, and display-size type. Body copy is always ink-on-cream or cream-on-wine.

### Colour carries meaning

Each pop is bound to a product category — the filter chip, the card, the category header and the menu page all inherit it. Colour becomes navigation, not decoration. This is what separates "pops with colour" from "is loud".

### Type

- **Fraunces** — variable display serif with `SOFT` and `WONK` axes. Warm and slightly wobbly. Matches the serif of the LIHA wordmark, and is not the exhausted Playfair.
- **Plus Jakarta Sans** — UI and body.

Both self-hosted via `next/font`, zero layout shift. No script face: the scalloped frames already carry the handmade feel, and free scripts age badly.

### The scallop motif

The scalloped border is rebuilt as a reusable component and applied to category cards, the enquiry form, and section frames. Someone arriving from her Instagram sees the same frame and knows it is the same shop. It is implemented in pure CSS (a tiled `radial-gradient` mask unioned with a `content-box` fill), so it is responsive and costs no images.

## Ordering: two paths

Her catalogue items run 300–1250 PKR. Negotiating a Rs 350 brownie over WhatsApp is friction, and Foodpanda already solves delivery for those.

- **Catalogue items → Foodpanda.** Instant, delivery handled, no back-and-forth.
- **Custom cakes and corporate → WhatsApp** (`+92 329 6286072`), pre-filled by a form. High-ticket, genuinely needs a conversation.

Catalogue cards offer Foodpanda as primary and WhatsApp as secondary, for anyone who prefers to message.

### The WhatsApp mechanism

One pure function in `src/lib/whatsapp.ts`:

```ts
buildWhatsAppUrl(payload: OrderPayload): string   // → https://wa.me/92…?text=…
```

`OrderPayload` is a discriminated union — `product` | `custom` | `corporate` | `general` — each with its own message template. Every order button and both forms call it, so the phone number and message format have exactly one definition. It is pure, so it is unit-testable without a browser.

The custom-cake form is a client component that submits nowhere: it validates inline, then opens WhatsApp pre-filled. Desktop visitors without WhatsApp get a `mailto:` fallback and copy-to-clipboard of the same text.

## Menu (transcribed from her Instagram menu cards)

| Category | Items | Range (PKR) | Accent |
|---|---|---|---|
| Signature Cakes | Matilda 650, Tiramisu 900, Dubai Kunafa 800/1250, Crunchy Chocolate 750/999 | 650–1250 | wine |
| Mini Loaves | Butter 550, Chocolate Loaded Banana Bread 750, Carrot 700, Cinnamon Coffee 650 | 550–750 | pistachio |
| Shot Boxes | Cookie 680, Brownie 780 (2 chocolate sauces) | 680–780 | tangerine |
| Brownies & Bars | Fudge Brownie 350, Brookie 450 | 350–450 | rust |
| Cookies | Brown Butter Choc Chip 350, Brown Butter Double Chocolate 350, Almond & Chocolate Biscotti 300 | 300–350 | butter |
| Custom Cakes | Quote-based | — | blush |

Two rules from her menu card become **functional requirements**, not copy:

1. **Four-day minimum lead time on custom cakes.** The form's date input sets `min` to today + 4 days and explains why. Validation, not a footnote.
2. **Nine base flavours** — Chocolate, Chocolate Malt, Chocolate Fudge, Lotus, Pistachio, Caramel, Honey, Red Velvet, Vanilla. That is the exact dropdown, not free text.

## Architecture

Next.js 16 App Router on the existing scaffold, TypeScript, Tailwind v4 CSS-first tokens. Server Components by default; client components only where interaction demands it (mobile nav, menu filter, both forms, sticky bar).

```
src/
  content/     site.ts menu.ts flavours.ts faq.ts corporate.ts testimonials.ts gallery.ts
  lib/         whatsapp.ts format.ts
  components/  Wordmark ScallopFrame LineArt Nav Footer StickyOrderBar
               ProductCard MenuBrowser CustomCakeForm Reveal Stars
  app/         / /menu /custom /corporate /about  + sitemap robots icon opengraph-image
```

Content lives in typed modules. Adding a product is one object in `menu.ts`; the build fails if a field is missing. No CMS — that can come later if she wants to self-edit.

### Isolation

Each content module owns one kind of fact. `lib/whatsapp.ts` owns message composition and knows nothing about React. `ScallopFrame` and `LineArt` are presentational and take no data. `MenuBrowser` owns filter state and nothing else. Every unit can be understood without reading the others.

## Working without photography

The design is illustration-led, not photo-led: colour blocking, display type, line art, and scalloped frames carry it. `src/content/gallery.ts` ships empty, and the gallery section renders only when it has entries — so the site never shows a broken or half-built grid. When photos land in `public/gallery/`, each one is a single line in that file and the section appears.

## Honesty constraints

- **No fabricated testimonials.** `testimonials.ts` ships empty. Social proof on the site is the real, attributable Foodpanda aggregate (4.9 from 37 reviews), linked to its source.
- **Corporate client names** (HGR by Marriott, Radisson Blu, LGS Grammar, Haryali) are inferred from her Instagram highlight titles and are marked for verification before launch.
- **Unknown facts** (opening hours, delivery charges, delivery radius) are marked `TODO` in `site.ts` and the UI degrades gracefully when they are null, rather than inventing values.

## SEO

`Bakery` + `LocalBusiness` JSON-LD with the Faisal Town address, per-route metadata, generated OG images in the brand palette, `sitemap.ts`, `robots.ts`. The whole SEO job is winning "custom cakes Lahore" and "birthday cakes Lahore".

## Testing

Vitest over the pure logic: `buildWhatsAppUrl` message composition for each payload variant, phone-number encoding, price formatting, and the lead-time date floor. Proportionate to a static marketing site — no component tests, no E2E harness.

## Rejected approaches

**Full cart and online checkout.** Needs a backend, a database, a payment merchant account, and daily operational attention from a one-person business. Wrong shape for a 350-rupee brownie.

**Instagram Graph API feed.** Requires a Business account linked to a Facebook Page, a Meta app, and a 60-day token with a refresh cron. Her grid also mixes story reposts, menu screenshots and event clips with the hero shots, so a raw feed would lower the site's quality bar rather than raise it. Curating locally wins on both effort and result. Revisit if she wants it hands-off.

**Scraping Instagram for the logo and posts.** Attempted via the profile page, `/embed/`, `?__a=1`, and `web_profile_info` with a browser UA and the public app-id header. All return the logged-out shell. Instagram gates this behind auth, and routing around it would breach their terms. The logo is supplied manually into `public/brand/`; until then a vector wordmark stands in.

## Outstanding inputs

Opening hours · delivery areas and charges · logo file · photography · verification of the corporate client list · real reviews to quote.
