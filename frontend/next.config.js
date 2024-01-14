const path = require('path');

/** @type { import('next').NextConfig } */
const nextPWA = require("next-pwa");

console.log("pSSSSSSSSSSSSSSSSSSSSSSSSSSSSS" + process.env.FRONTEND_BASEPATH + "AAAAAAAAAA");




// Configuration for Progressive Web App (PWA) using next-pwa package
const usePWA = nextPWA(
  {
    disable: process.env.FRONTEND_MODE === "development",
    dest: "public",
    register: true,
    skipWaiting: false,
    runtimeCaching: require("next-pwa/cache"),
  }
);

// Create next config using PWA setup function
const nextConfig = usePWA(
  {
    // Required for fetches to work if URL to frontend app is different than "/"
    basePath: process.env.NEXT_PUBLIC_BASE_PATH || '/',

    // Rewrite incoming requests to different destination paths.
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
);

module.exports = nextConfig;
