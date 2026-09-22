/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Optional: Disable image optimization if you aren't using a custom loader,
  // as standard Next.js image optimization relies on the Node.js server.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;