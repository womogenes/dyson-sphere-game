import { fontFamily } from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ['class'],
  content: ['./src/**/*.{html,js,svelte,ts,js}'],
  safelist: ['dark'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Roboto', 'Arial', 'ui-sans-serif'],
      },
    },
  },
};

export default config;
