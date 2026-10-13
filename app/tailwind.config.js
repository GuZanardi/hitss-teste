/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#121214',
        surface: '#202024',
        surfaceLight: '#29292E',
        border: '#2E2E38',
        brand: {
          DEFAULT: '#00B37E',
          dark: '#00875F',
          light: '#04D361',
        },
        textPrimary: '#FFFFFF',
        textSecondary: '#8D8D99',
        status: {
          pending: '#F87171',
          pendingBg: '#451A1A',
          progress: '#FBBF24',
          progressBg: '#45321A',
          completed: '#34D399',
          completedBg: '#1A4532',
        },
      },
    },
  },
  plugins: [],
};
