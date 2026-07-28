const path = require("path");

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
    cleanupOutdatedCaches: true,
    skipWaiting: true,
    clientsClaim: true,
  },
});

/** @type {import('next').NextConfig} */

const nextConfig = {
    outputFileTracingRoot: path.join(__dirname, './'),

    typescript: {
        ignoreBuildErrors: true,
    },

    // Only allow dev-mode origins when explicitly in development
    allowedDevOrigins: process.env.NODE_ENV === "development"
        ? ['localhost', '127.0.0.1', 'prolx.cloud', '*.prolx.cloud']
        : [],

    compiler: {
        // Strip console.* calls in production to avoid leaking data
        removeConsole: process.env.NODE_ENV === "production",
    },

    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
            {
                protocol: 'https',
                hostname: 'kwovoytawechpatjfevi.supabase.co',
            },
            {
                protocol: 'https',
                hostname: 'api.dicebear.com',
            }
        ],
    },

    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
        },
    },

    devIndicators: {
        buildActivity: false,
        appIsrStatus: false,
    },

    // Required for proper Turbopack/Webpack coexistence (silence warning in dev)
    turbopack: {},
};

module.exports = withPWA(nextConfig);