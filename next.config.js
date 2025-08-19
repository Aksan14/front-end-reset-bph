/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['backend-inventaris-production.up.railway.app'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'backend-inventaris-production.up.railway.app',
        port: '8080',
        pathname: '/uploads/',
      },
    ],
  },
}

module.exports = nextConfig