const path = require('path');

// Type for better IntelliSense support
/** @type { import('next').NextConfig } */

// Create next config using PWA setup function
const nextConfig = {
  // Uncomment to compile the app to static page
  output: 'export',

  // Where the compiled app should be outputted
  distDir: 'build',

  // Required for fetches to work if URL to frontend app is different than "/"
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',

  // Rewrite incoming requests to different destination paths
  async rewrites() {
    return [
      { source: '/old-test-route', destination: '/new-test-route' },
    ];
  },

  // Webpack Configuration
  webpack: (config, options) => {
    // Make @ alias for src folder, for the compiler to resolve
    config.resolve.alias['@'] = path.join(__dirname, 'src');
    return config;
  }
}

// Configuration for Progressive Web App (PWA) using next-pwa package
const nextPWA = require("next-pwa");
const usePWA = nextPWA(
  {
    disable: process.env.FRONTEND_MODE === "development",
    dest: "public",
    register: true,
    skipWaiting: false,
    runtimeCaching: require("next-pwa/cache"),
  }
);

// To enable PWA change "module.exports = nextConfig;" to "module.exports = usePWA(nextConfig);"
module.exports = nextConfig;

// Many more options are available: https://nextjs.org/docs/pages/api-reference/next-config-js