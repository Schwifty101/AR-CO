/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // In development, proxy to local backend
    // In production, use NEXT_PUBLIC_API_URL
    const apiUrl = process.env.API_BACKEND_URL || 'http://localhost:4000';

    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
