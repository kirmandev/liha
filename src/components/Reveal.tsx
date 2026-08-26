/**
 * Scroll-reveal wrapper. The animation runs on the CSS view() timeline, so
 * there is no JavaScript, no observer and no hydration cost. Where the browser
 * lacks the timeline — or the visitor prefers reduced motion — the rule never
 * matches and children render plainly visible.
 */

import type { ReactNode } from "react";

export function Reveal({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "header";
}) {
  return <Tag className={`reveal ${className}`}>{children}</Tag>;
}
