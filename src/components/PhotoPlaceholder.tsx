import { LineArt, type ArtKey } from "./LineArt";
import { ScallopFrame } from "./ScallopFrame";

/**
 * A deliberate space for a photograph that does not exist yet.
 *
 * Built to look intentional rather than broken: the scalloped frame the site
 * already uses, a dashed inner ring, one of the brand's line drawings, and a
 * quiet caption. A visitor reads it as "portrait to follow", not "image
 * failed to load" — and the frame's size and position are already right, so
 * when the photograph arrives it drops in with no layout change.
 *
 * Swap for a real image by replacing this component with `next/image` inside
 * the same `ScallopFrame`.
 */
export function PhotoPlaceholder({
  label = "Photograph to follow",
  art = "whisk",
  aspect = "aspect-[4/5]",
  className = "",
}: {
  label?: string;
  art?: ArtKey;
  /** Tailwind aspect class; portraits default to 4:5. */
  aspect?: string;
  className?: string;
}) {
  return (
    <ScallopFrame size={28} className={`bg-blush ${className}`} variant="solid">
      <div className={`relative ${aspect} w-full p-3`}>
        <div className="flex h-full w-full flex-col items-center justify-center gap-5 rounded-[1.5rem] border-2 border-dashed border-wine/30 bg-blush/60 px-6 text-center">
          <LineArt art={art} className="w-2/5 max-w-40 text-wine/70" strokeWidth={1.8} />
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-wine/70">{label}</p>
        </div>
      </div>
    </ScallopFrame>
  );
}
