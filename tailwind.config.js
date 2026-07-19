/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hf-orange':   '#F97316',
        'hf-orange-h': '#EA580C',
        'hf-bg':       '#FCFAF8',
        'hf-card':     '#FFFFFF',
        'hf-border':   '#ECECEC',
        'hf-text':     '#111827',
        'hf-muted':    '#6B7280',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
        btn:  '22px',
      },
      boxShadow: {
        card:       '0 1px 3px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 28px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
}
