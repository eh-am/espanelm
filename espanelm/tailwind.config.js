const colors = require('tailwindcss/colors');

module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        blue: {
          50: '#f2f6fc',
          100: '#dfe9f7',
          200: '#cadbf1',
          300: '#b5cceb',
          400: '#a5c1e7',
          500: '#95b6e3',
          600: '#8dafe0',
          700: '#82a6dc',
          800: '#789ed8',
          900: '#678ed0',
        },
        lime: {
          50: '#f7f8e2',
          100: '#eceeb6',
          200: '#dfe386',
          300: '#d2d856',
          400: '#c9cf31',
          500: '#bfc70d',
          600: '#b9c10b',
          700: '#b1ba09',
          800: '#a9b307',
          900: '#9ba603',
          A100: '#fbffd0',
          A200: '#f7ff9d',
          A400: '#f3ff6a',
          A700: '#f2ff51',
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
