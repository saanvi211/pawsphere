/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          // Blues
          solidBlue:  '#1d4ed8',
          darkBlue:   '#1e3a8a',
          lightBlue:  '#dbeafe',

          // Oranges
          solidOrange: '#ea580c',
          darkOrange:  '#c2410c',
          lightOrange: '#ffedd5',

          // Greens
          solidGreen:  '#15803d',
          darkGreen:   '#14532d',
          lightGreen:  '#dcfce7',

          // Purples (used in some views)
          solidPurple: '#7c3aed',
          lightPurple: '#ede9fe',
        },
      },
    },
  },
  plugins: [],
};
