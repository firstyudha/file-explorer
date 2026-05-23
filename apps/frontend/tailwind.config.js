/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        explorer: {
          bg: '#1e1e1e',
          sidebar: '#2c2c2c',
          active: '#3d3d3d',
          hover: '#2a2a2a',
          accent: '#0078d4'
        }
      }
    },
  },
  plugins: [],
}
