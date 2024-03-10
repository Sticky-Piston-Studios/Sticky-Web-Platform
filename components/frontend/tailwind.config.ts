import type { Config } from "tailwindcss";

const config: Config = {
  // If "dark" keyword is detected in className of parent element tree then use classes with "dark:" prefix.
  darkMode: "class",

  // The 'content' section tells Tailwind where your classes will be used. Tailwind will scan these files to determine the classes it needs to generate.
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}", // Scans similar files in your 'components' directory.
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}", // Scans similar files in your 'app' directory.
  ],

  // The 'theme' section is where you define your customizations to the default Tailwind theme.
  theme: {
    // 'extend' allows you to add new values to existing Tailwind scales, or override default values.
    extend: {
      textColor: {
        transparent: "transparent",
      },
      fontFamily: {
        poppins: "var(--font-poppins)",
        montserrat: "var(--font-montserrat)",
        inter: "var(--font-inter)",
        comfortaa: "var(--font-comfortaa)",
      },
    },
    screens: {
      sm: "640px",
      // => @media (min-width: 640px) { ... }

      md: "768px",
      // => @media (min-width: 768px) { ... }

      lg: "1024px",
      // => @media (min-width: 1024px) { ... }

      xl: "1280px",
      // => @media (min-width: 1280px) { ... }

      "2xl": "1436px",
      // => @media (min-width: 1536px) { ... }
    },
    colors: {
      netural: {
        0: "#ffffff",
        50: "#fafafa",
        100: "#f5f5f5",
        200: "#e5e5e5",
        300: "#d4d4d4",
        400: "#a3a3a3",
        500: "#737373",
        600: "#525252",
        700: "#404040",
        800: "#262626",
        900: "#171717",
        950: "#0a0a0a",
      },

      white: "#ffffff",
      black: "#000000",

      "sticky-blue": "#5556F7",
      "sticky-pink": "#FF1DBB",
      "sticky-orange": "#FFB413",

      "sticky-gradient":
        "linear-gradient(164deg, #5556F7 0%, #FF1DBB 35%, #FFB413 100%)",
      "sticky-gradient-horizontal":
        "linear-gradient(270deg, #7744dc 0%, #FF1DBB 35%, #e98559 100%)",
      "sticky-gradient-rotated":
        "linear-gradient(217deg, #5556F7 0%, #FF1DBB 35%, #FFB413 100%)",
      "sticky-gradient-strong":
        "linear-gradient(164deg, #1A1AFF 0%, #FF1DBB 33%, #FF2AAC 62%, #FFE713 100%)",
      "sticky-gradient-border":
        "linear-gradient(#050505, #050505) padding-box, linear-gradient(164deg, #1A1AFF 0%, #FF1DBB 33%, #FF2AAC 62%, #FFE713 100%) border-box",
    },
  },

  // Plugins are JavaScript functions that are used to add new utilities, components, base styles, or variants to Tailwind.
  plugins: [],
};

export default config;
