/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.amazonaws.com',
            },
            {
                protocol: 'https',
                hostname: '**.supabase.co',
            },
        ],
    },

    // Proxy /api/* → Vercel backend (server-side, no CORS).
    // The browser calls relative /api/projects; Next.js rewrites it transparently.
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'https://mind-stack-theta.vercel.app/api/:path*',
            },
        ];
    },

    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
