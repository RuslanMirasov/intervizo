/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['api.dicebear.com', 'images.pexels.com', 'firebasestorage.googleapis.com'],
  },
};

export default nextConfig;
