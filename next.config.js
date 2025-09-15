/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['backend-inventaris-production.up.railway.app', 'localhost', '192.168.1.22'],
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
// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     domains: ['192.168.1.22'],
//     remotePatterns: [
//       {
//         protocol: 'http',
//         hostname: '192.168.1.22',
//         port: '7070',
//         pathname: '/**',
//       },
//     ],
//   }
// }

// module.exports = nextConfig

  //   remotePatterns: [
  //     {
  //       protocol: 'https',
  //       hostname: 'backend-inventaris-production.up.railway.app',
  //       port: '',
  //       pathname: '/**',
  //     },
  //   ],
  // }