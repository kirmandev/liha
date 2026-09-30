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
    /**
     * Next 16 refuses to optimise an upstream image whose host resolves to a
     * private address, as SSRF protection. In development the CMS *is*
     * localhost, so this has to be allowed — but only there.
     *
     * In production it must stay off, which means the CMS's public hostname
     * (its NEXT_PUBLIC_SERVER_URL) is what media URLs are built from, even when
     * both apps share a box. Pointing CMS_URL at localhost in production would
     * break every product photo, quietly, with only a server-side log to say why.
     */
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
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
