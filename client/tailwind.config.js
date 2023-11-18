/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      width: {
        '1200': '1200px'
      },
      height: {
        '128': '56rem',
      }
    },
  },
  plugins: [],
}

