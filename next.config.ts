import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: '**',
        pathname: '**',
      },
      {
        protocol: 'http',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/dsgqdey2a/image/upload/**', // Replace 'dsgqdey2a' with your Cloudinary cloud name
      },
    ],
  }
};

export default nextConfig;
