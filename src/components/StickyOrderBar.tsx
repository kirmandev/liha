"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { site } from "@/content/site";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { WhatsAppIcon } from "./ui";

/**
 * Mobile-only order bar. Appears once the visitor has scrolled past the hero,
 * so it never covers the first screen. Hidden on /custom, where the form is
 * already the primary action.
 */
export function StickyOrderBar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname === "/custom") return null;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-wine/10 bg-cream/95 px-4 py-3 backdrop-blur-md transition-transform duration-300 md:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex items-center gap-2">
        <a
          href={site.foodpanda.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-full bg-wine px-4 py-3 text-center text-sm font-semibold text-cream"
        >
          Order the menu
        </a>
        <a
          href={buildWhatsAppUrl({ kind: "general" })}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-pistachio px-4 py-3 text-sm font-semibold text-[#1e2a17]"
        >
          <WhatsAppIcon className="size-4" />
          WhatsApp
        </a>
      </div>
    </div>
  );
}
