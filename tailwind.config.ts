import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        surface: "#141414",
        accent: {
          DEFAULT: "#d4a843",
          bright: "#f0c75e",
          deep: "#a87f2a",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      fontSize: {
        // Fluid display scale for cinematic headings
        display: ["clamp(3rem, 8vw, 6.5rem)", { lineHeight: "1.02", letterSpacing: "-0.04em" }],
        headline: ["clamp(2rem, 4vw, 3rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(212, 168, 67, 0.4)",
        "glow-lg": "0 0 80px -20px rgba(212, 168, 67, 0.55)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
