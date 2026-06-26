/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ctfwithai-orange': '#ff7300',
        'ctfwithai-dark': '#0a0a0a',
      },
    },
  },
  plugins: [],
}
