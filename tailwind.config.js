/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Inter Fallback", "sans-serif"],
      },
      screens: {
        xs: "475px",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
