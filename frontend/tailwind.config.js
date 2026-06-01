/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        yoga: {
          green: '#4ade80',
          teal: '#14b8a6',
          dark: '#1e3a3a',
        },
      },
    },
  },
  plugins: [],
};
