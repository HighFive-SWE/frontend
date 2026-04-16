import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./modules/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#fbfaf7",
          muted: "#f2efe8",
        },
        ink: {
          DEFAULT: "#1a1d26",
          soft: "#4b5063",
          faint: "#8a8fa1",
        },
        brand: {
          50: "#eef4ff",
          100: "#dbe6ff",
          400: "#6b8dff",
          500: "#4b6eff",
          600: "#3857e6",
          700: "#2a3fb8",
        },
        accent: {
          mint: "#7cd6b6",
          peach: "#ffc8a8",
          lilac: "#c7b8ff",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        display: ["ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(26, 29, 38, 0.18)",
        glow: "0 0 0 4px rgba(75, 110, 255, 0.18)",
      },
      keyframes: {
        bounceSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      animation: {
        bounceSoft: "bounceSoft 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
