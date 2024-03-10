const path = require('path');

// Type for better IntelliSense support
/** @type { import('next').NextConfig } */

// Set to true to compile the app as a static page
const staticPage = false;

// Required for fetches to work if URL to frontend app is different than "/"
// By default all paths to the resources are expected to be relative to the root of the domain
// For example: In case of "www.myapp.com/myapp/finalversion" base path and asset prefix should be "/myapp/finalversion"
// For example: In case of D:/Programming/ReactPage/build base path and asset prefix should be "/Programming/ReactPage/build"
const assetPrefix = process.env.NEXT_PUBLIC_BASE_PATH || '';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

// Create next config using PWA setup function
const nextConfig = {

  // Compiling as a static page
  output: staticPage ? 'export' : undefined,
  // Image component optimization is not supported on static pages
  images: { unoptimized: staticPage }, 
  
  // Where the compiled app should be outputted
  distDir: 'build',

  assetPrefix: assetPrefix,
  basePath: basePath,

  // Webpack configuration
  webpack: (config, options) => {
    // Make @ alias for src folder, for the compiler to resolve
    config.resolve.alias['@'] = path.join(__dirname, 'src');
    // Required to load svg files on server side and be able change its color
    config.module.rules = [
      ...config.module.rules,
      // Load svg files with @svgr/webpack
      {
        test: /\.svg$/i,
        use: ['@svgr/webpack'],
      },
      // Load yaml files with yaml-loader (for i18n)
      {
        test: /\.yaml$/, // Match YAML files
        use: ['yaml-loader'], // Use yaml-loader for .yaml files
      }
    ];
    return config;
  },
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