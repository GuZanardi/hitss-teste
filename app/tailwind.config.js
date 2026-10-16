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
        team: {
          claro: '#00B37E',
          yellow: '#EBCB4B',
          mobile: '#EBCB4B',
          backend: '#00B4D8',
          amber: '#F59E0B',
          blue: '#0284C7',
          violet: '#7C3AED',
          rose: '#E11D48',
          orange: '#EA580C',
          indigo: '#4F46E5',
          green: '#16A34A',
          pink: '#DB2777',
          cyan: '#0891B2',
          ochre: '#A16207',
          purple: '#9333EA',
          lime: '#65A30D',
          magenta: '#C026D3',
          slate: '#475569',
        },
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
