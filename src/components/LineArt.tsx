/**
 * Line drawings in the style of the hand-drawn pastries on her Instagram menu
 * cards: single weight, round caps, no fill except for accents.
 *
 * Presentational and data-free. If she supplies the original artwork these can
 * be swapped one for one.
 */

export type ArtKey =
  | "layerCake"
  | "tieredCake"
  | "cookie"
  | "loaf"
  | "brownie"
  | "shotBox"
  | "bow"
  | "whisk";

type ArtProps = { className?: string; strokeWidth?: number };

function Frame({
  children,
  className = "",
  strokeWidth = 2,
}: ArtProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

const DRAWINGS: Record<ArtKey, React.ReactNode> = {
  layerCake: (
    <>
      <ellipse cx="50" cy="32" rx="30" ry="9" />
      <path d="M20 32v32c0 5 13.4 9 30 9s30-4 30-9V32" />
      <path d="M20 48c0 5 13.4 9 30 9s30-4 30-9" />
      <path d="M50 23V14" />
      <circle cx="50" cy="11" r="4" fill="currentColor" stroke="none" />
      <path d="M12 73h76" />
    </>
  ),
  tieredCake: (
    <>
      <ellipse cx="50" cy="20" rx="13" ry="4.5" />
      <path d="M37 20v10c0 2.5 5.8 4.5 13 4.5s13-2 13-4.5V20" />
      <ellipse cx="50" cy="38" rx="21" ry="6" />
      <path d="M29 38v12c0 3.3 9.4 6 21 6s21-2.7 21-6V38" />
      <ellipse cx="50" cy="60" rx="30" ry="8.5" />
      <path d="M20 60v14c0 4.7 13.4 8.5 30 8.5s30-3.8 30-8.5V60" />
      <path d="M50 15V8" />
      <circle cx="50" cy="6" r="3.4" fill="currentColor" stroke="none" />
    </>
  ),
  cookie: (
    <>
      <circle cx="50" cy="50" r="30" />
      <circle cx="39" cy="41" r="4" fill="currentColor" stroke="none" />
      <circle cx="60" cy="38" r="3.2" fill="currentColor" stroke="none" />
      <circle cx="55" cy="57" r="4.4" fill="currentColor" stroke="none" />
      <circle cx="37" cy="60" r="3" fill="currentColor" stroke="none" />
      <circle cx="66" cy="56" r="2.6" fill="currentColor" stroke="none" />
      <circle cx="48" cy="27" r="2.4" fill="currentColor" stroke="none" />
    </>
  ),
  loaf: (
    <>
      <path d="M20 66V50c0-13 11-21 30-21s30 8 30 21v16z" />
      <path d="M34 66V50c0-8 5-13 8-15" />
      <path d="M52 66V50c0-8 5-13 8-15" />
      <path d="M12 66h76" />
      <path d="M18 66c4 7 13 9 32 9s28-2 32-9" />
    </>
  ),
  brownie: (
    <>
      <rect x="24" y="52" width="52" height="19" rx="3" />
      <rect x="30" y="34" width="44" height="18" rx="3" />
      <path d="M30 43h44" />
      <circle cx="52" cy="28" r="3.4" fill="currentColor" stroke="none" />
      <path d="M16 76h68" />
    </>
  ),
  shotBox: (
    <>
      <path d="M22 48h56v24a5 5 0 0 1-5 5H27a5 5 0 0 1-5-5z" />
      <path d="M22 48l6-11h44l6 11" />
      <path d="M33 37l3 11h7l3-11" />
      <path d="M53 37l3 11h7l3-11" />
      <path d="M22 60h56" />
    </>
  ),
  bow: (
    <>
      <path d="M50 34c-13-15-29-10-27 2 2 10 17 10 27 0z" />
      <path d="M50 34c13-15 29-10 27 2-2 10-17 10-27 0z" />
      <circle cx="50" cy="35" r="4.5" />
      <path d="M45 40c-4 12-10 19-15 23" />
      <path d="M55 40c4 12 10 19 15 23" />
    </>
  ),
  whisk: (
    <>
      <path d="M46 74l-9 14" />
      <path d="M44 70c-9-12-9-30 4-42 13 12 13 30 4 42a6 6 0 0 1-8 0z" />
      <path d="M48 28v42" />
      <path d="M37 42c8 4 14 4 22 0" />
    </>
  ),
};

export function LineArt({ art, className, strokeWidth }: ArtProps & { art: ArtKey }) {
  return (
    <Frame className={className} strokeWidth={strokeWidth}>
      {DRAWINGS[art]}
    </Frame>
  );
}

/** Which drawing stands in for each menu category. */
export const CATEGORY_ART: Record<string, ArtKey> = {
  "signature-cakes": "layerCake",
  "mini-loaves": "loaf",
  "shot-boxes": "shotBox",
  "brownies-bars": "brownie",
  cookies: "cookie",
  "custom-cakes": "tieredCake",
};
