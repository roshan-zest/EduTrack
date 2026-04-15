import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        slateBlue: "#1d3557",
        clay: "#d97757",
        mist: "#edf2f7",
        ink: "#111827",
        mint: "#d8f3dc"
      },
      boxShadow: {
        soft: "0 18px 48px rgba(17, 24, 39, 0.08)"
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(29, 53, 87, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(29, 53, 87, 0.08) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
