import type { NextConfig } from "next";

/**
 * Product photographs are served by the CMS, not from this repo, so next/image
 * needs to be told those origins are allowed — it refuses to optimise a remote
 * URL that is not listed here.
 *
 * Derived from CMS_URL so development and production agree without a second
 * place to update. The fallback covers a local CMS started before .env exists.
 */
const cmsUrl = new URL(process.env.CMS_URL ?? "http://localhost:3005");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: cmsUrl.protocol.replace(":", "") as "http" | "https",
        hostname: cmsUrl.hostname,
        port: cmsUrl.port || undefined,
        pathname: "/api/media/**",
      },
    ],
  },
};

export default nextConfig;
