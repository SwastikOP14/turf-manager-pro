/** @type {import('tailwindcss').Config} */
export default {

  darkMode: "class",

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 20px var(--shadow-glow)',
      },
    },
  },

  plugins: [],
}