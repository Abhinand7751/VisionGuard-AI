/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          950: "#080b10",
          900: "#0e131b",
          850: "#131a24",
          800: "#1b2430",
        },
        accent: {
          500: "#2dd4bf",
          600: "#0d9488",
        },
        signal: {
          500: "#f97316",
          600: "#ea580c",
        },
      },
      boxShadow: {
        panel: "0 18px 40px rgba(0, 0, 0, 0.26)",
      },
    },
  },
  plugins: [],
};
