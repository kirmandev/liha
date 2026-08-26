import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { site } from "@/content/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${site.fullName} — custom cakes and pastry in ${site.address.city}`;

/**
 * Satori ships no serif, so the brand face is loaded from the repo rather than
 * named in CSS. The file is committed (OFL) to keep the build hermetic — no
 * network call at build time.
 */
async function displayFont() {
  return readFile(join(process.cwd(), "src/app/_og-fonts/Fraunces-SemiBold.woff"));
}

const SWATCHES = ["#6e1b2e", "#b0532c", "#ee8a4f", "#f2c14e", "#8fbf6b", "#f7dcd8"];

/**
 * Share card in the brand palette. This is the first impression whenever the
 * link is forwarded on WhatsApp, which is how most of her orders start.
 *
 * Satori supports flexbox only — no grid — so the layout here is flat by
 * necessity, and every text run is explicitly `nowrap` to keep rows from
 * colliding.
 */
export default async function OpengraphImage() {
  const fraunces = await displayFont();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fdf6ef",
          padding: "70px 72px",
          fontFamily: "Fraunces",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 46, color: "#6e1b2e", letterSpacing: "0.1em" }}>
            LIHA
          </div>
          <div
            style={{
              display: "flex",
              background: "#f2c14e",
              color: "#2a1a1c",
              padding: "12px 30px",
              borderRadius: 999,
              fontSize: 24,
            }}
          >
            {site.address.locality}, {site.address.city}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{ display: "flex", fontSize: 100, color: "#6e1b2e", lineHeight: 1.04 }}
          >
            Trained in Dubai.
          </div>
          <div style={{ display: "flex", fontSize: 100, color: "#b0532c", lineHeight: 1.04 }}>
            Baked in Lahore.
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 26,
              fontSize: 29,
              color: "#6b5457",
              whiteSpace: "nowrap",
            }}
          >
            Custom cakes · Signature bakes · Corporate orders
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          {SWATCHES.map((colour) => (
            <div
              key={colour}
              style={{
                display: "flex",
                width: 52,
                height: 52,
                borderRadius: 999,
                background: colour,
                marginRight: 16,
              }}
            />
          ))}
          <div
            style={{
              display: "flex",
              marginLeft: "auto",
              fontSize: 27,
              color: "#6e1b2e",
              whiteSpace: "nowrap",
            }}
          >
            {/* Kept to characters the embedded latin subset covers — anything
                outside it makes Satori reach for a font over the network. */}
            Rated {site.foodpanda.rating} · {site.instagram.handle}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Fraunces", data: fraunces, weight: 600, style: "normal" }],
    },
  );
}
