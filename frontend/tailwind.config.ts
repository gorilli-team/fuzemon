import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        dark: {
          900: "#010213",
          800: "#171835",
          700: "#2A2447",
          600: "#38305F",
          500: "#4F437F",
          400: "#8B7CC5",
          300: "#C0B5ED",
          200: "#D8D0F5",
          100: "#F3F0FF",
          50: "#F9FAFB",
          primary: "#010213",
          secondary: "#171835",
          tertiary: "#2A2447",
        },
        "dark-text": {
          primary: "#FFFFFF",
          secondary: "#B0B0C0",
        },
        accent: {
          purple: "#843DFF",
          orange: "#FF4500",
          blue: "#00CED1",
          yellow: "#FFD700",
        },
        purple: {
          500: "#9061F9",
          600: "#843DFF",
          700: "#791AFF",
        },
        silver: {
          600: "#C0C0C0",
        },
        yellow: {
          400: "#E3A008",
        },
        gradient: {
          from: "#791AFF",
          to: "#4A1D96",
          alternativeFrom: "#2C2258",
          alternativeTo: "#171835",
        },
        brand: {
          DEFAULT: "#843DFF",
          dark: "#6B2FCC",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      screens: {
        xs: "475px",
      },
    },
  },
  plugins: [],
} satisfies Config;
