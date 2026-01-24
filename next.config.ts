import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**",
            },
        ],
    },
    // Enable static exports with ISR
    experimental: {
        staleTimes: {
            dynamic: 30,
            static: 180,
        },
    },
};

export default nextConfig;
