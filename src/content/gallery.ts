/**
 * Curated photographs of her work.
 *
 * Ships empty on purpose. Instagram's API is not reachable without a Business
 * account, a linked Facebook Page and a refreshing token, and a raw feed would
 * pull in story reposts and menu screenshots alongside the good shots. So this
 * is hand-picked instead.
 *
 * To add a photo:
 *   1. Save it into `public/gallery/` (JPEG or WebP, at least 1200px wide).
 *   2. Add one entry below with its real pixel dimensions.
 *
 * Every gallery section checks `hasGallery` first, so the site simply omits
 * those sections until photos exist rather than rendering an empty grid.
 */

export type GalleryImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
};

export const gallery: GalleryImage[] = [
  // Example — delete this comment and uncomment when a real file is in place:
  // {
  //   src: "/gallery/kunafa-cake.jpg",
  //   alt: "Dubai kunafa cake, cut to show the pistachio and kataifi layers",
  //   width: 1200,
  //   height: 1500,
  //   caption: "Dubai kunafa cake",
  // },
];

export const hasGallery = gallery.length > 0;
