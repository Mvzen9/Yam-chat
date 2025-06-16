/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#9B4F2B',
          DEFAULT: '#9B4F2B',
          dark: '#D98A63',
        },
        secondary: {
          light: '#F2E2D0',
          DEFAULT: '#F2E2D0',
          dark: '#2A2A2A',
        },
        background: {
          light: '#FFFFFF',
          DEFAULT: '#FFFFFF',
          dark: '#1C1C1C',
        },
        text: {
          primary: {
            light: '#1A1A1A',
            DEFAULT: '#1A1A1A',
            dark: '#FFFFFF',
          },
          secondary: {
            light: '#4B4B4B',
            DEFAULT: '#4B4B4B',
            dark: '#CCCCCC',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
