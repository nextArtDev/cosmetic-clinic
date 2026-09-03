/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for the Docker deploy: produces .next/standalone/server.js
  // which the runner stage executes with `node server.js`.
  output: 'standalone',
  allowedDevOrigins: ['192.168.1.159'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.qwenlm.ai',
        port: '',
        pathname: '/public_source/**',
        search: '',
      },
    ],
  },
}

export default nextConfig
