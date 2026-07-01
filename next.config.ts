import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'export', // Netlify uchun statik faylga aylantirish
  images: {
    unoptimized: true,
  },
};

export default nextConfig;