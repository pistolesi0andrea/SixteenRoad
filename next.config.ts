import type { NextConfig } from "next";

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  {
    protocol: "https",
    hostname: "images.unsplash.com",
  },
  {
    protocol: "https",
    hostname: "picsum.photos",
  },
  {
    protocol: "https",
    hostname: "cdn.shopify.com",
  },
];

if (process.env.SHOPIFY_STORE_DOMAIN) {
  remotePatterns.push({
    protocol: "https",
    hostname: process.env.SHOPIFY_STORE_DOMAIN,
  });
}

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    remotePatterns,
  },
};

export default nextConfig;
