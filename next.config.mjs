/** @type {import('next').NextConfig} */
const nextConfig = {
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
