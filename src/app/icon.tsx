import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Wine ground, cream wordmark in the brand serif — legible at 16px in a tab strip. */
export default async function Icon() {
  const fraunces = await readFile(
    join(process.cwd(), "src/app/_og-fonts/Fraunces-SemiBold.woff"),
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#6e1b2e",
          color: "#fdf6ef",
          fontSize: 42,
          fontFamily: "Fraunces",
        }}
      >
        L
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Fraunces", data: fraunces, weight: 600, style: "normal" }],
    },
  );
}
