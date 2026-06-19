/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#111827',
        card: '#131929',
        'card-border': '#1e2a3b',
      },
    },
  },
  plugins: [],
}

