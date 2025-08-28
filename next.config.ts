import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  /* config options here */
  images: {
    domains: ["res.cloudinary.com"], // allow Cloudinary images
  },
};

export default nextConfig;
