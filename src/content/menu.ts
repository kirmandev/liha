/**
 * The catalogue, transcribed from the menu cards in her Instagram "Menu"
 * highlight. Prices are PKR.
 *
 * Adding an item is one object below. `accent` binds a category to a brand
 * colour so that the chip, the card and the section header all agree — colour
 * is navigation here, not decoration.
 */

export type Accent = "wine" | "rust" | "butter" | "pistachio" | "tangerine" | "blush";

export type Product = {
  id: string;
  name: string;
  /** PKR. Omitted for quote-based items. */
  price?: number;
  note?: string;
};

export type Category = {
  id: string;
  name: string;
  blurb: string;
  accent: Accent;
  /** Where the primary call-to-action sends people. */
  orderVia: "foodpanda" | "whatsapp";
  items: Product[];
};

export const categories: Category[] = [
  {
    id: "signature-cakes",
    name: "Signature Cakes",
    blurb:
      "The ones she is known for. Whole cakes, sized for one indulgence or for two to share.",
    accent: "wine",
    orderVia: "foodpanda",
    items: [
      { id: "matilda", name: "Matilda Cake", price: 650 },
      { id: "tiramisu", name: "Tiramisu", price: 900 },
      { id: "kunafa-1", name: "Dubai Kunafa Cake", price: 800, note: "Single" },
      { id: "kunafa-2", name: "Dubai Kunafa Cake", price: 1250, note: "For two" },
      { id: "crunchy-choc-1", name: "Crunchy Chocolate Cake", price: 750, note: "Single" },
      { id: "crunchy-choc-2", name: "Crunchy Chocolate Cake", price: 999, note: "For two" },
    ],
  },
  {
    id: "mini-loaves",
    name: "Mini Loaves",
    blurb: "Tea-time loaves, baked to slice. The quiet favourites.",
    accent: "pistachio",
    orderVia: "foodpanda",
    items: [
      { id: "butter-cake", name: "Butter Cake", price: 550 },
      { id: "banana-bread", name: "Chocolate Loaded Banana Bread", price: 750 },
      { id: "carrot-cake", name: "Carrot Cake", price: 700 },
      { id: "cinnamon-coffee", name: "Cinnamon Coffee Cake", price: 650 },
    ],
  },
  {
    id: "shot-boxes",
    name: "Shot Boxes",
    blurb: "Served with two kinds of chocolate sauce. Built for sharing, rarely shared.",
    accent: "tangerine",
    orderVia: "foodpanda",
    items: [
      { id: "cookie-shot-box", name: "Cookie Shot Box", price: 680 },
      { id: "brownie-shot-box", name: "Brownie Shot Box", price: 780 },
    ],
  },
  {
    id: "brownies-bars",
    name: "Brownies & Bars",
    blurb: "Dense, fudgy, unapologetic.",
    accent: "rust",
    orderVia: "foodpanda",
    items: [
      { id: "fudge-brownie", name: "Fudge Brownie", price: 350 },
      { id: "brookie", name: "Brookie", price: 450 },
    ],
  },
  {
    id: "cookies",
    name: "Cookies",
    blurb: "Brown butter, browned properly. Worth the extra step.",
    accent: "butter",
    orderVia: "foodpanda",
    items: [
      { id: "bb-choc-chip", name: "Brown Butter Chocolate Chip Cookie", price: 350 },
      { id: "bb-double-choc", name: "Brown Butter Double Chocolate", price: 350 },
      { id: "biscotti", name: "Almond & Chocolate Biscotti", price: 300 },
    ],
  },
  {
    id: "custom-cakes",
    name: "Custom Cakes",
    blurb:
      "Celebrate your way. Choose your flavour, share your design ideas, and she will bring it to life.",
    accent: "blush",
    orderVia: "whatsapp",
    items: [
      { id: "custom", name: "Custom cake", note: "Quoted to your brief" },
    ],
  },
];

/** Front-page picks. Ids must exist above; `signatureItems` throws at build if not. */
const SIGNATURE_IDS = ["kunafa-2", "tiramisu", "brookie", "banana-bread"] as const;

export const allProducts: Array<Product & { category: Category }> = categories.flatMap(
  (category) => category.items.map((item) => ({ ...item, category })),
);

export const signatureItems = SIGNATURE_IDS.map((id) => {
  const found = allProducts.find((product) => product.id === id);
  if (!found) throw new Error(`signatureItems: no product with id "${id}" in menu.ts`);
  return found;
});

export function priceRange(category: Category): string | null {
  const prices = category.items.map((item) => item.price).filter((p): p is number => p != null);
  if (prices.length === 0) return null;
  const low = Math.min(...prices);
  const high = Math.max(...prices);
  return low === high ? `Rs ${low}` : `Rs ${low}–${high}`;
}
