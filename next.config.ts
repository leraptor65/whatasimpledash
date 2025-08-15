/** @type {import('next').NextConfig} */
const nextConfig = {
  // This line is the fix
  output: 'standalone',
};

export default nextConfig;