import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx,js,jsx,mdx}",
    "./components/**/*.{ts,tsx,js,jsx,mdx}",
    "./app/**/*.{ts,tsx,js,jsx,mdx}"
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1200px"
      }
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      keyframes: {
        "gradient-x": {
          "0%, 100%": { transform: "translate3d(-12%, -8%, 0)" },
          "50%": { transform: "translate3d(12%, 8%, 0)" }
        },
        grain: {
          "0%": { transform: "translate3d(0, 0, 0)" },
          "25%": { transform: "translate3d(-10%, -8%, 0)" },
          "50%": { transform: "translate3d(8%, -6%, 0)" },
          "75%": { transform: "translate3d(-6%, 6%, 0)" },
          "100%": { transform: "translate3d(0, 0, 0)" }
        },
        "pulse-ring": {
          "0%, 100%": { opacity: "0.55", transform: "scale(0.95)" },
          "50%": { opacity: "0.85", transform: "scale(1.05)" }
        }
      },
      animation: {
        "gradient-x": "gradient-x 48s ease-in-out infinite",
        grain: "grain 18s linear infinite",
        "pulse-ring": "pulse-ring 9s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
