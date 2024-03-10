module.exports = {
  // 'plugins' object is where PostCSS plugins used in the project are defined
  // The empty object '{}' means you're using default configurations.
  plugins: {
    // 'postcss-import': This plugin allows you to use @import to import other CSS files into your CSS files.
    'postcss-import': {},

    // 'tailwindcss': This plugin integrates Tailwind CSS into your build process.
    // You can also pass a path to your Tailwind config file, e.g., 'tailwindcss: { config: './path/to/your/tailwind.config.js' }'.
    'tailwindcss': {},

    // 'autoprefixer': This plugin automatically adds vendor prefixes to your CSS for better cross-browser compatibility.
    // The empty object '{}' means you're using default configurations for autoprefixer.
    'autoprefixer': {},
  },
}
