/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['backend-inventaris-production.up.railway.app', 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'backend-inventaris-production.up.railway.app',
        port: '',
        pathname: '/**',
      },
    ],
  }
}

module.exports = nextConfig