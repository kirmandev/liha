/**
 * Stand-in for the LIHA logo: the serif wordmark with the flower dot over the
 * "i", drawn in type + SVG so it stays crisp at any size and inherits colour.
 *
 * When the original artwork lands in `public/brand/`, swap this component's
 * internals for an <Image>; every call site keeps working.
 */

type WordmarkProps = {
  className?: string;
  /** Height of the flower relative to the text. */
  petalScale?: number;
};

function Flower({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      {[0, 72, 144, 216, 288].map((angle) => (
        <ellipse
          key={angle}
          cx="12"
          cy="6.2"
          rx="3.1"
          ry="5"
          transform={`rotate(${angle} 12 12)`}
        />
      ))}
      <circle cx="12" cy="12" r="2.6" className="text-cream" fill="var(--color-cream)" />
    </svg>
  );
}

export function Wordmark({ className = "", petalScale = 0.34 }: WordmarkProps) {
  return (
    <span
      className={`font-display inline-flex items-baseline leading-none font-semibold tracking-[0.06em] ${className}`}
    >
      <span aria-hidden="true">L</span>
      <span className="relative" aria-hidden="true">
        i
        <Flower
          className="absolute left-1/2 -translate-x-1/2"
          // Sits where the tittle of the "i" would be.
          {...{
            style: {
              width: `${petalScale}em`,
              height: `${petalScale}em`,
              bottom: "0.72em",
            },
          }}
        />
      </span>
      <span aria-hidden="true">HA</span>
      <span className="sr-only">LIHA</span>
    </span>
  );
}
