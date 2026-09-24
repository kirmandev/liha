/**
 * The catalogue. Transcribed from the client's authoritative Foodpanda export
 * (32 items, 10 categories), which supersedes the Instagram menu cards the
 * first build worked from. Prices are PKR.
 *
 * Adding an item is one object below. `accent` binds a category to a brand
 * colour so that the chip, the card and the section header all agree — colour
 * is navigation here, not decoration. Ten categories share eight accents in
 * deliberate families; see the design spec.
 *
 * Every non-custom product has a photograph at `public/products/<slug>.jpg`,
 * downloaded by `scripts/fetch-product-images.sh`. `menu.test.ts` fails the
 * build if one is missing.
 */

export type Accent =
  | "wine"
  | "rust"
  | "butter"
  | "pistachio"
  | "tangerine"
  | "blush"
  | "cocoa"
  | "plum";

export type Product = {
  /** URL segment and image filename. Unique across the whole catalogue. */
  slug: string;
  name: string;
  /** PKR. Omitted for quote-based items. */
  price?: number;
  description: string;
  /** Foodpanda offers sauces as a paid add-on on these items. */
  pairsWithSauces?: boolean;
  note?: string;
  /** True for items with no photograph — currently only custom cakes. */
  noPhoto?: boolean;
  /**
   * Internal flag: the supplied copy is known-wrong and needs replacing by the
   * client. Never rendered. `description` holds a neutral stand-in meanwhile.
   */
  copyTodo?: string;
};

export type Category = {
  id: string;
  name: string;
  blurb: string;
  accent: Accent;
  /** Where the secondary "order elsewhere" call-to-action sends people. */
  orderVia: "foodpanda" | "whatsapp";
  /** Extras browse below the main menu rather than alongside it. */
  secondary?: boolean;
  items: Product[];
};

export const categories: Category[] = [
  {
    id: "flavour-of-the-month",
    name: "Flavour of the Month",
    blurb: "One dessert, on the menu only while it lasts. Then it makes way for the next.",
    accent: "tangerine",
    orderVia: "foodpanda",
    items: [
      {
        slug: "banoffee-dome",
        name: "Banoffee Dome",
        price: 400,
        description:
          "Reconstructed banoffee pie. Caramelised banana purée, velvety whipped cream mousse and a buttery biscuit base. Served frozen — let it sit for five minutes before enjoying.",
        pairsWithSauces: true,
      },
    ],
  },
  {
    id: "signature-cakes",
    name: "Signature Cakes",
    blurb: "The ones she is known for. Each one sized for one indulgence.",
    accent: "wine",
    orderVia: "foodpanda",
    items: [
      {
        slug: "matilda-cake",
        name: "Matilda Cake",
        price: 699,
        description:
          "A gooey, ultra-chocolatey cake inspired by the iconic Matilda moment. Rich, moist layers covered in thick chocolate fudge frosting and finished with a generous pour of chocolate sauce on top. Deep cocoa flavour, soft crumb, and chocolate in every bite.",
        pairsWithSauces: true,
      },
      {
        slug: "dubai-chocolate-cake-for-one",
        name: "Dubai Chocolate Cake For One",
        price: 800,
        description:
          "Soft, moist chocolate mud cake layered with rich pistachio cream and buttery crunchy kunafa, topped with silky milk chocolate ganache. Inspired by the famous Dubai chocolate dessert.",
        pairsWithSauces: true,
      },
      {
        slug: "the-london-cake",
        name: "The London Cake",
        price: 775,
        note: "Whipped caramel & chocolate ganache",
        description:
          "This viral London cake lives up to every bit of the hype, and is now available by the slice. Rich chocolate cake with pillowy whipped salted caramel and a luxurious pour of chocolate ganache.",
      },
      {
        slug: "crunchy-chocolate-cake-for-one",
        name: "Crunchy Chocolate Cake For One",
        price: 750,
        description:
          "Soft, moist chocolate mud cake, layered with silky milk chocolate cream and topped with crunchy chocolate — the viral chocolate cake everyone is craving.",
        pairsWithSauces: true,
      },
      {
        slug: "new-york-cheesecake",
        name: "New York Cheesecake",
        price: 699,
        description:
          "Rich and creamy baked cheesecake made with high-quality cream cheese, finished with a signature golden top and buttery biscuit base. Silky, indulgent, and even better paired with your favourite sauce.",
        pairsWithSauces: true,
      },
      {
        slug: "coffee-tiramisu-for-one",
        name: "Coffee Tiramisu for One",
        price: 900,
        description:
          "Coffee-soaked sponge layered with mascarpone cream. Made fresh, sized for one.",
        pairsWithSauces: true,
        // The client's export carries Matilda Cake's description verbatim on this
        // item and flagged it themselves. A neutral stand-in runs until real copy
        // arrives — describing the wrong cake is worse than describing it plainly.
        copyTodo:
          "Awaiting real tiramisu copy from Fahad; Foodpanda currently shows Matilda Cake's text.",
      },
    ],
  },
  {
    id: "brownies-bars",
    name: "Brownies & Bars",
    blurb: "Dense, fudgy, unapologetic.",
    accent: "cocoa",
    orderVia: "foodpanda",
    items: [
      {
        slug: "upgraded-fudgy-brownie",
        name: "Upgraded Fudgy Brownie",
        price: 399,
        description:
          "You spoke, we listened. We have revamped our recipe to give you the ultimate brownie experience: deeper, richer chocolate with a perfectly balanced sweetness, and that dense, melt-in-your-mouth fudgy texture you have been craving.",
        pairsWithSauces: true,
      },
      {
        slug: "brookie",
        name: "Brookie",
        price: 499,
        description:
          "The best of both worlds in one indulgent bite. A rich, fudgy chocolate brownie base topped with a soft, chewy chocolate-chip cookie layer. Crisp edges, gooey centre, loaded with real chocolate. Warm it up for maximum indulgence.",
        pairsWithSauces: true,
      },
      {
        slug: "the-milo-brownie",
        name: "The Milo Brownie",
        price: 550,
        description:
          "An absolute burst of Milo in every single bite. Our ultra-fudgy Milo brownie is smothered in rich chocolate ganache and loaded with crunchy chocolate-coated Milo balls. A nostalgic chocolatey masterpiece.",
        pairsWithSauces: true,
      },
      {
        slug: "walnut-brownie",
        name: "Walnut Brownie",
        price: 450,
        description:
          "Rich and fudgy brownie loaded with crunchy walnuts for a delightful texture and nutty flavour. A perfect indulgent treat that melts in your mouth.",
      },
    ],
  },
  {
    id: "shot-boxes",
    name: "Shot Boxes",
    blurb: "Served with two kinds of chocolate sauce. Built for sharing, rarely shared.",
    accent: "rust",
    orderVia: "foodpanda",
    items: [
      {
        slug: "brownie-shot-box",
        name: "Brownie Shot Box",
        price: 780,
        description:
          "Ten fudgy brownie bites coated in chocolate and served with two rich dipping sauces — milk chocolate and semi-sweet chocolate. Perfect for dunking.",
        pairsWithSauces: true,
      },
      {
        slug: "cookie-shot-box",
        name: "Cookie Shot Box",
        price: 680,
        description:
          "Two kinds of bite-sized cookies — classic chocolate chip and double chocolate — paired with milk chocolate and semi-sweet chocolate dips. Crisp, chocolate-loaded, and made for serious dunking.",
        pairsWithSauces: true,
      },
    ],
  },
  {
    id: "cookies",
    name: "Cookies",
    blurb: "Brown butter, browned properly. Worth the extra step.",
    accent: "butter",
    orderVia: "foodpanda",
    items: [
      {
        slug: "brown-butter-chocolate-chip-cookie",
        name: "Brown Butter Chocolate Chip Cookie",
        price: 360,
        description:
          "No gimmicks. No unnecessary mix-ins. Just a perfectly baked cookie that reminds you what a real cookie is supposed to taste like. Made with brown butter for a deeper, toasted flavour, lightly crisp with a soft bite, with semi-sweet and milk chocolate chunks.",
        pairsWithSauces: true,
      },
      {
        slug: "brown-butter-double-chocolate-cookie",
        name: "Brown Butter Double Chocolate Cookie",
        price: 360,
        description:
          "Balanced sweetness, clean flavours, and a texture that hits exactly right. Made with brown butter, packed with cocoa and generous chunks of chocolate. Lightly crisp with a soft bite, deep chocolate flavour in every mouthful.",
        pairsWithSauces: true,
      },
    ],
  },
  {
    id: "loaves",
    name: "Loaves — Whole & Slices",
    blurb: "Tea-time loaves, baked to slice. Take the whole loaf or just the slice.",
    accent: "pistachio",
    orderVia: "foodpanda",
    items: [
      {
        slug: "chocolate-banana-bread-mini-loaf",
        name: "Chocolate Banana Bread Mini Loaf",
        price: 750,
        note: "Whole mini loaf",
        description:
          "Soft and moist, made with ripe bananas, nutty brown butter and plenty of chocolate. Naturally sweet, rich and comforting — a classic banana bread with a chocolate-heavy twist.",
      },
      {
        slug: "chocolate-banana-bread-slice",
        name: "Chocolate Banana Bread Slice",
        price: 300,
        note: "Single slice",
        description:
          "Soft and moist, made with ripe bananas, nutty brown butter and plenty of chocolate. Naturally sweet, rich and comforting — a classic banana bread with a chocolate-heavy twist.",
      },
      {
        slug: "butter-cake-mini-loaf",
        name: "Butter Cake Mini Loaf",
        price: 550,
        note: "Whole mini loaf",
        description:
          "A classic soft and moist mini loaf made with real butter and whole milk for a rich, delicate flavour. Light crumb, gently sweet, and ideal with tea or coffee.",
      },
      {
        slug: "butter-cake-slice",
        name: "Butter Cake Slice",
        price: 150,
        note: "Single slice",
        description:
          "A soft, moist slice made with real butter and whole milk for a rich, classic flavour. Light crumb, gently sweet, and perfectly comforting. A timeless cake for any time of day.",
      },
      {
        slug: "cinnamon-coffee-cake-slice",
        name: "Cinnamon Coffee Cake Slice",
        price: 250,
        note: "Single slice",
        description:
          "A soft, moist slice layered with warm cinnamon sugar and finished with a buttery streusel crumble on top. Tender crumb, gently sweet, and made to pair beautifully with tea or coffee.",
      },
    ],
  },
  {
    id: "hot-desserts",
    name: "Hot Desserts",
    blurb: "Fried to order. Eat them where you stand.",
    accent: "tangerine",
    orderVia: "foodpanda",
    items: [
      {
        slug: "churros-with-chocolate-sauce",
        name: "Churros with Chocolate Sauce",
        price: 549,
        description:
          "Six pieces of our famous fried-to-order churros, dusted in sweet cinnamon sugar. Includes a rich, velvety chocolate dipping sauce. Hot, fresh, and dangerously addictive.",
      },
    ],
  },
  {
    id: "signature-combos",
    name: "Signature Combos",
    blurb: "Two or three of the good things, at a better price than buying them apart.",
    accent: "plum",
    orderVia: "foodpanda",
    items: [
      {
        slug: "matilda-cookie-shot-box",
        name: "Matilda & Cookie Shot Box",
        price: 1299,
        description: "Chocolate, cake, cookies… and zero regrets.",
      },
      {
        slug: "brownie-brookie-duo",
        name: "Brownie & Brookie Duo",
        price: 830,
        description: "Our upgraded fudge brownie paired with a brookie.",
      },
      {
        slug: "brown-butter-cookie-duo",
        name: "Brown Butter Cookie Duo",
        price: 750,
        description: "One chocolate chip, one double chocolate. Both brown butter.",
      },
      {
        slug: "trio-of-cake-slices",
        name: "Trio of Cake Slices",
        price: 600,
        description:
          "Rich chocolate cake, sweet banana and warm cinnamon tea cake, and the simply elegant butter cake. A combination that delivers a moist, tender crumb and aromatic warmth in every bite.",
      },
      {
        slug: "chocolate-sauce-duo",
        name: "Chocolate Sauce Duo",
        price: 240,
        description: "Two signature chocolate sauces, crafted to elevate your treats.",
      },
    ],
  },
  {
    id: "signature-sauces",
    name: "Signature Sauces",
    blurb: "Add one to anything above. Made in the same kitchen, for dunking and pouring.",
    accent: "cocoa",
    orderVia: "foodpanda",
    secondary: true,
    items: [
      {
        slug: "milk-chocolate-sauce",
        name: "Milk Chocolate Sauce",
        price: 120,
        description: "A creamy milk chocolate sauce, crafted to complement our baked treats.",
      },
      {
        slug: "semi-sweet-chocolate-sauce",
        name: "Semi-Sweet Chocolate Sauce",
        price: 120,
        description: "A silky, semi-sweet chocolate sauce, perfect with our baked treats.",
      },
      {
        slug: "strawberry-sauce",
        name: "Strawberry Sauce",
        price: 120,
        description:
          "A rich and fruity strawberry topping made with fresh strawberries, offering the perfect balance of sweetness and flavour. Pair with our cheesecake or the dessert of your choice.",
      },
    ],
  },
  {
    id: "add-a-note",
    name: "Add a Note",
    blurb: "A handwritten card, tucked in with the order. Say the thing.",
    accent: "blush",
    orderVia: "foodpanda",
    secondary: true,
    items: [
      {
        slug: "a-little-note",
        name: "A Little Note",
        price: 150,
        description: "Mini floral card, perfect for any message. Simple, elegant and thoughtful.",
      },
      {
        slug: "happy-birthday",
        name: "Happy Birthday",
        price: 150,
        description: "Mini birthday card with a cake design. Perfect for a sweet birthday wish.",
      },
      {
        slug: "with-love",
        name: "With Love",
        price: 150,
        description: "Mini card with a soft pink border and heart. A simple way to send love.",
      },
    ],
  },
  {
    id: "custom-cakes",
    name: "Custom Cakes",
    blurb:
      "Celebrate your way. Choose your flavour, share your design ideas, and she will bring it to life.",
    accent: "blush",
    orderVia: "whatsapp",
    secondary: true,
    items: [
      {
        slug: "custom-cake",
        name: "Custom cake",
        note: "Quoted to your brief",
        description:
          "Birthdays, weddings, the office send-off. Describe what you want and she builds it — four days' notice, because it is made rather than taken off a shelf.",
        noPhoto: true,
      },
    ],
  },
];

/** Front-page picks. Slugs must exist above; `signatureItems` throws at build if not. */
const SIGNATURE_SLUGS = [
  "dubai-chocolate-cake-for-one",
  "brookie",
  "matilda-cake",
  "brown-butter-chocolate-chip-cookie",
] as const;

export type CatalogueEntry = Product & { category: Category };

export const allProducts: CatalogueEntry[] = categories.flatMap((category) =>
  category.items.map((item) => ({ ...item, category })),
);

/** Categories that lead the menu, as opposed to the extras that follow it. */
export const primaryCategories = categories.filter((category) => !category.secondary);
export const secondaryCategories = categories.filter((category) => category.secondary);

export const signatureItems = SIGNATURE_SLUGS.map((slug) => {
  const found = allProducts.find((product) => product.slug === slug);
  if (!found) throw new Error(`signatureItems: no product with slug "${slug}" in menu.ts`);
  return found;
});

/** The sauces offered as a paid add-on on eligible products. */
export const sauceAddOns: CatalogueEntry[] = allProducts.filter(
  (product) => product.category.id === "signature-sauces",
);

export function findProduct(slug: string): CatalogueEntry | undefined {
  return allProducts.find((product) => product.slug === slug);
}

/** Path to a product's photograph, or null for items that have none. */
export function productImage(product: Product): string | null {
  return product.noPhoto ? null : `/products/${product.slug}.jpg`;
}

export function priceRange(category: Category): string | null {
  const prices = category.items.map((item) => item.price).filter((p): p is number => p != null);
  if (prices.length === 0) return null;
  const low = Math.min(...prices);
  const high = Math.max(...prices);
  return low === high ? `Rs ${low}` : `Rs ${low}–${high}`;
}
