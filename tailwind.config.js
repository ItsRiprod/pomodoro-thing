/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "theme-a": "var(--themeA)",
        "theme-b": "var(--themeB)",
      },
    },
  },
  plugins: [],
};
