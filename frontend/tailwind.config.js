/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#17cf17",
        "forest": "#1e4d2b",
        "mustard": "#eec643",
        "brick": "#c6412b",
        "cream": "#FAF8EF",
        "paper": "#fbf9f4",
        "ink": "#1a1a1a",
        "background-light": "#FAF8EF",
        "background-dark": "#112111",
        "crayon-green": "#4e974e",
        "crayon-yellow": "#eab308",
        "crayon-red": "#ef4444",
      },
      fontFamily: {
        "display": ["Lexend", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "lg": "2rem",
        "xl": "3rem"
      },
      boxShadow: {
        'crayon': '4px 4px 0px 0px rgba(0,0,0,0.15)',
        'crayon-hover': '2px 2px 0px 0px rgba(0,0,0,0.15)',
        'floating': '0px 10px 25px -5px rgba(0, 0, 0, 0.1), 0px 8px 10px -6px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
