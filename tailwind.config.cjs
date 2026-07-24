/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './services/**/*.{ts,tsx}',
    './utils/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'retro-amber': '#FFBF00',
        'retro-orange': '#D94F00',
        'retro-dark': '#0F0F0F',
        'retro-paper': '#F7F5E6',
        'retro-gray': '#333333',
      },
      fontFamily: {
        serif: ['Merriweather', 'serif'],
        mono: ['Courier Prime', 'Courier New', 'monospace'],
      },
      boxShadow: {
        retro: '4px 4px 0 0 #000000',
        'retro-sm': '2px 2px 0 0 #000000',
      },
    },
  },
  plugins: [],
};
