import type { Config } from 'tailwindcss'

const config: Config = {
  // The 'content' section tells Tailwind where your classes will be used. Tailwind will scan these files to determine the classes it needs to generate.
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',      // Scans all JavaScript, TypeScript, JSX, TSX, and MDX files in your 'pages' directory.
    './src/components/**/*.{js,ts,jsx,tsx,mdx}', // Scans similar files in your 'components' directory.
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',        // Scans similar files in your 'app' directory.
  ],

  // The 'theme' section is where you define your customizations to the default Tailwind theme.
  theme: {
    // 'extend' allows you to add new values to existing Tailwind scales, or override default values.
    extend: {
      // Adding custom background images to the theme.
      backgroundImage: {
        // Custom radial gradient. You can use this class like 'bg-gradient-radial' in your project.
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',

        // Custom conic gradient. Use as 'bg-gradient-conic'.
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },

  // Plugins are JavaScript functions that are used to add new utilities, components, base styles, or variants to Tailwind.
  plugins: [],
}

export default config