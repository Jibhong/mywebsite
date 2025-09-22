/** @type {import('next').NextConfig} */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dcet4rnv2wp0nxq3.public.blob.vercel-storage.com',
        pathname: '/**', // allow all paths
      },
    ],
  },
};

export default nextConfig;
