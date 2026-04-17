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
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-space-grotesk)", "var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(0,0,0,0.04), 0 3px 12px rgba(0,0,0,0.05)",
        lifted: "0 2px 4px rgba(0,0,0,0.04), 0 12px 40px rgba(0,0,0,0.1)",
        glow: "0 0 0 3px rgba(75, 110, 255, 0.15)",
      },
      keyframes: {
        bounceSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        bounceSoft: "bounceSoft 1.4s ease-in-out infinite",
        fadeIn: "fadeIn 0.3s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
