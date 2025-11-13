/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Rubik', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        'win11': {
          bg: '#f3f3f3',
          surface: '#ffffff',
          border: '#e1dfdd',
          text: '#323130',
          accent: '#005a9e',
          hover: 'rgba(0, 0, 0, 0.06)',
          active: 'rgba(0, 0, 0, 0.11)',
        }
      }
    },
  },
  plugins: [],
}