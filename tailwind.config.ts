import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bone: '#FAF8F5',
        paper: '#F2EEE7',
        onyx: '#151515',
        ink: '#4A4642',
        sand: '#D4C7B5',
        olive: '#6B705C',
        terra: '#C28F79',
        line: '#E2DBD0',
        night: '#0E120E',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Iowan Old Style"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      maxWidth: { site: '1320px' },
      fontSize: {
        hero: ['clamp(2.7rem, 5.6vw, 5.4rem)', { lineHeight: '1.05' }],
        h2: ['clamp(2rem, 4vw, 3.25rem)', { lineHeight: '1.05' }],
      },
      letterSpacing: { label: '0.2em' },
    },
  },
  plugins: [],
};
export default config;
