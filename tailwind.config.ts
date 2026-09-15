import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "var(--brand-primary, #10B981)",
          secondary: "var(--brand-secondary, #059669)",
          dark: "var(--brand-dark, #0F172A)",
          accent: "var(--brand-accent, #F59E0B)",
        },
      },
      boxShadow: {
        'phone': '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 12px #1e293b, 0 0 0 14px #334155',
        'phone-glow': '0 0 50px -10px var(--brand-primary, #10B981)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2s linear infinite',
      },
      keyframes: {
        scan: {
          '0%, 100%': { transform: 'translateY(0%)' },
          '50%': { transform: 'translateY(100%)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
