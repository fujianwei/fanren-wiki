import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bamboo: {
          50:  "#f2f5f0",
          100: "#e8ede4",
          200: "#d4e0cc",
          300: "#b8cdb0",
          400: "#7a9e72",
          500: "#5a7e52",
          600: "#3a5c32",
          700: "#2a4424",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Noto Serif SC", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
