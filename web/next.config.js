/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development practices
  reactStrictMode: true,

  // Configure allowed image domains
  images: {
    domains: [
      'api.dicebear.com',
      'images.unsplash.com',
      't9015838726.p.clickup-attachments.com'
    ],
  },

  // Optimize imports for specific packages
  experimental: {
    optimizePackageImports: ['@tabler/icons-react'],
  },

  // Transpile specific packages that need it
  transpilePackages: ['@tabler/icons-react'],

  // Webpack configuration for handling specific module issues
  webpack: (config) => {
    // Ensure proper handling of .mjs and .js files for ESM modules
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
      '.mjs': ['.mjs', '.mts', '.mtsx'],
    };
    return config;
  },
}

module.exports = nextConfig
