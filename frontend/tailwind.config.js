/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        discord: {
          bg: '#313338',
          dark: '#1e1f22',
          darker: '#111214',
          light: '#383a40',
          lighter: '#404249',
          text: '#dbdee1',
          muted: '#949ba4',
          link: '#00a8fc',
          blurple: '#5865f2',
          green: '#23a55a',
          red: '#f23f43',
          yellow: '#f0b232',
        },
      },
      fontFamily: {
        discord: [
          'gg sans',
          'Noto Sans',
          'Helvetica Neue',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
