import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Explicitly allow local IP addresses
   

  /* config options here */
  images: {
    remotePatterns: [
     
      {
        protocol: 'http',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https', // Recommended to include both or just https
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
