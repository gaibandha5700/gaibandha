import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-bengali)", "Arial", "sans-serif"]
      },
      colors: {
        brand: {
          50: "#effcf6",
          100: "#d9f8e8",
          500: "#159765",
          600: "#0d7b52",
          700: "#096342",
          900: "#06432f"
        }
      }
    }
  },
  plugins: []
};

export default config;