# Storefront: real catalogue, photography, and an ordering cart

Supersedes the catalogue and "working without photography" sections of
`2026-08-26-liha-bakery-site-design.md`. Everything else in that spec — brand,
scallop, honesty constraints, SEO, isolation — still holds.

## What changed since the first build

Two things the original spec listed as missing have arrived:

1. **Photography.** All 32 live products now have real photographs. The first
   build was deliberately illustration-led because there were none; that
   constraint is gone, and the design should now lead with the food.
2. **The real catalogue.** The first build transcribed 18 items from Instagram
   menu cards. The client has since supplied the authoritative Foodpanda
   catalogue: 32 items across 10 categories, with descriptions, current prices
   and an add-on flag.

Prices moved (Matilda 650→699, Fudge Brownie 350→399), items appeared (Banoffee
Dome, New York Cheesecake, The London Cake, Milo and Walnut Brownies, Churros,
Sauces, Combos, gift notes) and items were withdrawn (Carrot Cake, Biscotti,
Mango Cake, Ice Pops — the last two seasonal, per the Ingredient SRS §4.3).

## Scope

In scope: the catalogue rewrite, photography, a photo-led redesign of home and
menu, product detail pages, and a working cart and checkout that hands the
finished order to WhatsApp.

Out of scope, deferred to its own spec: order persistence, order numbers,
backend discount-code validation, loyalty points, phone/OTP accounts, and the
admin panel. See "The backend seam" below.

## Ordering: why WhatsApp is the transport

The Website SRS already says the site never charges anyone (§5, §13) — checkout
records a stated payment method, shows the JazzCash/bank instructions, and staff
then phone the customer to confirm (§6). So the only things a checkout strictly
needs a database for are persistent order numbers, single-use discount codes
(§7 demands backend validation, immediate burn and rate-limiting — a
client-side check would publish the codes to anyone who opens devtools), and the
admin panel to read orders back (§10).

None of those are required for a customer to place an order. So this phase
builds the entire cart and checkout for real, and submits the finished order as
a structured WhatsApp message to LIHA's number. That matches how the business
already operates, needs no server, and deploys to Vercel's free tier.

The discount field is rendered but explicitly labelled as confirmed by staff,
not applied on-screen. Claiming a discount the site cannot verify would be
worse than not offering one.

### The backend seam

Checkout calls a single `submitOrder(draft)` function that returns a
`SubmittedOrder`. The WhatsApp handoff is one implementation of it. Swapping in
a real backend means replacing that function and nothing else — no page, form
or cart code changes. This is the whole point of isolating it.

## Design direction

Adopt the discipline of a photo-led bakery storefront — square photographs on a
consistent grid, generous whitespace, calm hierarchy — while keeping LIHA's
existing identity. Wine, cream and blush stay. Fraunces stays. The scallop
survives as an accent on the hero and on category headers rather than wrapping
every card, because a scalloped mask fights a square photograph.

Colour remains navigation: every category binds to an accent that its chip,
header and cards all share. Ten categories need more than the original six
accents, so two are added (`cocoa`, `plum`) and three categories deliberately
share an accent with a sibling to form families: Hot Desserts with Flavour of
the Month (limited/hot), Sauces with Brownies & Bars (chocolate), Add a Note
with Custom Cakes (gifting).

## Data

`src/content/menu.ts` stays the single typed source. A product gains `slug`,
`description`, `image` and `pairsWithSauces`. Adding a product remains one
object; the build still fails on a missing field.

Photographs are **copied** into `public/products/<slug>.jpg` rather than
hotlinked from Foodpanda's CDN, so the site does not break when those paths
rotate and `next/image` can optimise them. `scripts/fetch-product-images.sh` is
re-runnable and fails loudly on a dead URL.

### Honesty constraints (carried forward)

- Coffee Tiramisu for One currently carries Matilda Cake's description verbatim
  on Foodpanda — the client flagged this themselves. It is marked `copyTodo` in
  the data and shows a neutral fallback description rather than text about a
  different cake. The flag is never rendered to customers.
- Butter Cake's vanilla quantity, delivery zones, cutoff times and opening hours
  remain unconfirmed and stay `null`/absent rather than invented.
- The Rs 500 minimum and Rs 100 delivery subsidy are SRS *recommendations*, not
  confirmed policy. They live in `site.ts` as named settings so one edit changes
  them everywhere.

## Pages

| Route | State | Purpose |
|---|---|---|
| `/` | rebuilt | Photo-led hero, category grid, signature picks |
| `/menu` | rebuilt | Filterable photo grid, all 32 items |
| `/product/[slug]` | new | Photo, description, sauce add-ons, quantity, add to cart |
| `/cart` | new | Line items, quantity, remove, subtotal |
| `/checkout` | new | Delivery details, payment method, note, discount field |
| `/order-confirmation` | new | On-screen summary + WhatsApp handoff |
| `/custom`, `/corporate`, `/about` | kept | Unchanged |

Website SRS §17 flags the `/custom` page's "earliest available" date as
hardcoded and stale. Verified against this codebase: it is **already** computed
live from `site.customLeadTimeDays` via `earliestOrderDate`. The SRS is
describing the older deployed prototype, not this repo. No change needed —
recorded here so nobody "fixes" working code.

## Isolation

- `content/menu.ts` — data only, no React
- `lib/cart.tsx` — cart state, localStorage persistence, line identity
- `lib/order.ts` — the `submitOrder` seam and order-message composition
- `lib/pricing.ts` — subtotal, add-on and tax arithmetic, pure functions
- `components/*` — presentation, reading from the above

Cart lines are identified by product slug plus sorted add-on slugs, so the same
cake ordered twice with different sauces stays two lines, and with the same
sauces merges into one.

## Testing

Vitest over the arithmetic and the data, which is where this can silently go
wrong: line-identity merging, subtotal and add-on totals, minimum-order
threshold, tax at 0% and at a set rate, catalogue integrity (unique slugs, every
non-custom product has a downloaded photo on disk, signature picks resolve), and
order-message composition. No component or E2E tests — proportionate, same as
the original spec.

## Not doing

Branch selection at checkout (SRS §8: the storefront stays one unified menu and
admin assigns the branch), stock or availability checks (§8: deliberately not
tracked by the site), pickup (§9: delivery only), and stacking discounts with
loyalty (§15: mutually exclusive, and neither exists yet).
