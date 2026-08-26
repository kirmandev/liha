/**
 * The scalloped cloud frame from her Instagram menu cards, rebuilt in CSS.
 *
 * `solid` fills the shape. `outline` nests a second scalloped layer to leave a
 * ring of the frame colour showing — closest to the printed menu card.
 *
 * Purely presentational: takes no data, only children.
 */

import type { CSSProperties, ReactNode } from "react";

type ScallopFrameProps = {
  children: ReactNode;
  variant?: "solid" | "outline";
  /** Scallop diameter. Smaller reads as lace, larger as clouds. */
  size?: number;
  /** Background of the shape (solid) or of the ring (outline). */
  className?: string;
  /** Inner fill, outline variant only. */
  innerClassName?: string;
  style?: CSSProperties;
};

export function ScallopFrame({
  children,
  variant = "solid",
  size = 24,
  className = "bg-blush",
  innerClassName = "bg-cream",
  style,
}: ScallopFrameProps) {
  const scallop = { "--scallop": `${size}px`, ...style } as CSSProperties;

  if (variant === "solid") {
    return (
      <div className={`scallop ${className}`} style={scallop}>
        {children}
      </div>
    );
  }

  return (
    <div className={`scallop ${className}`} style={scallop}>
      <div className={`scallop ${innerClassName}`} style={scallop}>
        {children}
      </div>
    </div>
  );
}
