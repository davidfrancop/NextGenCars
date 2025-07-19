// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0F172A",     // slate-900
        sidebar: "#1E293B",        // slate-800
        border: "#334155",         // slate-700
        primary: "#38BDF8",        // sky-400
        primaryHover: "#0EA5E9",   // sky-500
        error: "#EF4444",          // red-500
        success: "#22C55E",        // green-500
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji",
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;
