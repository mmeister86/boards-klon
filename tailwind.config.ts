import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

const config = {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        mono: ["monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 0.25rem)",
        sm: "calc(var(--radius) - 0.5rem)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "text-blink": {
          "0%, 75%": { opacity: "1" },
          "75.1%, 95%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        // Bounce Circle Animation
        bounceCircle: {
          "0%": {
            top: "60px",
            height: "5px",
            borderRadius: "50px 50px 25px 25px",
            transform: "scaleX(1.7)",
          },
          "40%": {
            height: "20px",
            borderRadius: "50%",
            transform: "scaleX(1)",
          },
          "100%": {
            top: "0%",
          },
        },
        // Shadow Shrink Animation
        shrinkShadow: {
          "0%": {
            transform: "scaleX(1.5)",
          },
          "40%": {
            transform: "scaleX(1)",
            opacity: "0.7",
          },
          "100%": {
            transform: "scaleX(0.2)",
            opacity: "0.4",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "text-blink": "text-blink 1.2s infinite ease-in-out",
        // New animations
        "bounce-circle": "bounceCircle 0.5s alternate infinite ease",
        "shrink-shadow": "shrinkShadow 0.5s alternate infinite ease",
      },
    },
  },
  plugins: [animate, typography],
} satisfies Config;

export default config;
