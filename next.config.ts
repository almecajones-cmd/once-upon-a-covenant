import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/v78xwhwr/image/upload/**",
      },
    ],
  },
};

export default nextConfig;
