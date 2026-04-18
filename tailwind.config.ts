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
          deep: "#ebe6da",
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
          sun: "#ffd66b",
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
        stamp: "0 3px 0 0 rgba(26,29,38,0.9)",
        punchy:
          "0 2px 0 0 rgba(26,29,38,0.9), 0 14px 28px -10px rgba(26,29,38,0.35)",
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
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-10px) rotate(1.5deg)" },
        },
        floatAlt: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(8px) rotate(-2deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        pulseRing: {
          "0%": { transform: "scale(1)", opacity: "0.5" },
          "80%, 100%": { transform: "scale(2.4)", opacity: "0" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        tickerRoll: {
          "0%": { transform: "translateY(0)" },
          "20%": { transform: "translateY(-100%)" },
          "40%": { transform: "translateY(-200%)" },
          "60%": { transform: "translateY(-300%)" },
          "80%": { transform: "translateY(-400%)" },
          "100%": { transform: "translateY(0)" },
        },
        drawLine: {
          from: { strokeDashoffset: "300" },
          to: { strokeDashoffset: "0" },
        },
      },
      animation: {
        bounceSoft: "bounceSoft 1.4s ease-in-out infinite",
        fadeIn: "fadeIn 0.3s ease-out",
        float: "float 6s ease-in-out infinite",
        floatAlt: "floatAlt 7.5s ease-in-out infinite",
        shimmer: "shimmer 2.4s linear infinite",
        marquee: "marquee 30s linear infinite",
        pulseRing: "pulseRing 1.8s cubic-bezier(0.22, 0.61, 0.36, 1) infinite",
        gradientShift: "gradientShift 8s ease-in-out infinite",
        tickerRoll: "tickerRoll 12s ease-in-out infinite",
        drawLine: "drawLine 1.4s ease-out forwards",
      },
      backgroundImage: {
        "brand-mesh":
          "radial-gradient(at 20% 20%, rgba(75,110,255,0.18), transparent 50%), radial-gradient(at 80% 10%, rgba(199,184,255,0.22), transparent 50%), radial-gradient(at 60% 90%, rgba(124,214,182,0.18), transparent 50%), radial-gradient(at 10% 80%, rgba(255,200,168,0.22), transparent 50%)",
        "grid-ink":
          "linear-gradient(rgba(26,29,38,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(26,29,38,0.06) 1px, transparent 1px)",
        "dots-ink":
          "radial-gradient(rgba(26,29,38,0.12) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid-md": "32px 32px",
        "dots-sm": "16px 16px",
        "shine-x": "200% 100%",
      },
    },
  },
  plugins: [],
};

export default config;
