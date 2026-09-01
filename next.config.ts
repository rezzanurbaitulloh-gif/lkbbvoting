import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: "/home/reja/lkbbvoting" },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "i.pravatar.cc" },
    ],
  },
};

export default nextConfig;
