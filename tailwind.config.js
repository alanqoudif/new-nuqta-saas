/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          '50': '#f5f5ff',
          '100': '#ecedfe',
          '200': '#dedffe',
          '300': '#c4c6fd',
          '400': '#a5a8fb',
          '500': '#8183f4',
          '600': '#6366f1',
          '700': '#4b4de0',
          '800': '#3f3fcb',
          '900': '#3939a5',
        },
        secondary: {
          DEFAULT: '#f43f5e',
          '50': '#fff1f3',
          '100': '#ffe4e8',
          '200': '#fecdd6',
          '300': '#fca5b8',
          '400': '#f97192',
          '500': '#f43f5e',
          '600': '#e11d48',
          '700': '#be123c',
          '800': '#9f1239',
          '900': '#881337',
        },
      },
      fontFamily: {
        sans: ['var(--font-main)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}