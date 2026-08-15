import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3525cd",
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          container: "#4f46e5",
          fixed: "#e2dfff",
          "fixed-dim": "#c3c0ff",
        },
        secondary: {
          DEFAULT: "#006c49",
          container: "#6cf8bb",
          fixed: "#6ffbbe",
          "fixed-dim": "#4edea3",
        },
        tertiary: {
          DEFAULT: "#95002b",
          container: "#bf0f3c",
          fixed: "#ffdadb",
          "fixed-dim": "#ffb2b7",
        },
        surface: {
          DEFAULT: "#f7f9fb",
          dim: "#d8dadc",
          bright: "#f7f9fb",
          variant: "#e0e3e5",
          "container-lowest": "#ffffff",
          "container-low": "#f2f4f6",
          container: "#eceef0",
          "container-high": "#e6e8ea",
          "container-highest": "#e0e3e5",
        },
        "on-surface": "#191c1e",
        "on-surface-variant": "#464555",
        "inverse-surface": "#2d3133",
        "inverse-on-surface": "#eff1f3",
        "inverse-primary": "#c3c0ff",
        outline: "#777587",
        "outline-variant": "#c7c4d8",
        "surface-tint": "#4d44e3",
        "on-primary": "#ffffff",
        "on-primary-container": "#dad7ff",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#00714d",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#ffd0d2",
        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        background: "#f7f9fb",
        "on-background": "#191c1e",
        // Additional dark UI colors for operations dashboard & dark elements
        dark: {
          bg: "#0b0e14",
          card: "#161b22",
          cardHover: "#1f242c",
          border: "rgba(255, 255, 255, 0.08)",
        }
      },
      fontFamily: {
        headline: ["var(--font-outfit)", "Outfit", "sans-serif"],
        body: ["var(--font-inter)", "Inter", "sans-serif"],
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0px 10px 25px -5px rgba(0, 0, 0, 0.04)",
        card: "0px 4px 20px rgba(10, 31, 68, 0.05)",
        cardHover: "0px 8px 30px rgba(10, 31, 68, 0.1)",
        glow: "0px 0px 20px rgba(79, 70, 229, 0.25)",
        glowGreen: "0px 0px 20px rgba(16, 185, 129, 0.25)",
      },
      animation: {
        pulseSlow: "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        fadeIn: "fadeIn 0.3s ease-in-out",
        slideUp: "slideUp 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      }
    },
  },
  plugins: [],
};

export default config;
