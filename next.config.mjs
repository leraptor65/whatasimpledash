/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  webpack: (config, { isServer }) => {
    // This is the recommended way to enable polling for file watching
    if (!isServer) {
      config.watchOptions = {
        poll: 1000, // Check for changes every second
        aggregateTimeout: 200, // Add a small delay before rebuilding
      };
    }
    return config;
  },
};

export default nextConfig;