/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        soc: {
          950: '#071016',
          900: '#0b141b',
          850: '#101b24',
          800: '#142533',
          700: '#1d3446',
          cyan: '#12b7a6',
          blue: '#3278d4',
          amber: '#d88a16',
          red: '#e0443e',
          green: '#33c277',
        },
      },
      boxShadow: {
        soc: '0 24px 70px rgba(0, 0, 0, 0.32)',
      },
    },
  },
  plugins: [],
};
