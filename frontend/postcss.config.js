module.exports = {
  // 'plugins' object is where PostCSS plugins used in the project are defined
  plugins: {
    // 'tailwindcss': This plugin integrates Tailwind CSS into your build process.
    // The empty object '{}' means you're using default configurations.
    // You can also pass a path to your Tailwind config file, e.g., 'tailwindcss: { config: './path/to/your/tailwind.config.js' }'.
    tailwindcss: {},

    // 'autoprefixer': This plugin automatically adds vendor prefixes to your CSS for better cross-browser compatibility.
    // For example, it can automatically transform 'display: flex' into '-webkit-display: flex', '-ms-display: flex', etc., as needed.
    // The empty object '{}' means you're using default configurations for autoprefixer.
    autoprefixer: {},
  },
}
