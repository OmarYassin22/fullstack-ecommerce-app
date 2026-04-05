/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {      fontFamily: {
        'sans': ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'heading': ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        'kid-pink': '#ff6b9d',
        'kid-purple': '#a855f7',
        'kid-blue': '#3b82f6',
        'kid-green': '#10b981',
        'kid-yellow': '#fbbf24',
        'kid-orange': '#f97316',
      }
    },
  },
  plugins: [],
};
