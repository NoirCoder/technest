import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "watdgihzwwumnvzimtsd.supabase.co",
                pathname: "/storage/v1/object/public/**",
            },
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
