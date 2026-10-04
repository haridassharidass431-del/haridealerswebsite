import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        burgundy: {
          50: '#fcf6f8',
          100: '#f8ecf1',
          200: '#f0d9e3',
          300: '#e2bacb',
          400: '#ce91ad',
          500: '#b4688d',
          600: '#974b6f',
          700: '#7e3b5a',
          800: '#5c1634',
          900: '#3b0c22',
          950: '#220613',
        },
        gold: {
          50: '#fdfbf0',
          100: '#faf4d7',
          200: '#f4e7ae',
          300: '#ebd37e',
          400: '#e1bc53',
          500: '#d4af37',
          600: '#ba9428',
          700: '#947020',
          800: '#7a5a1f',
          900: '#674a1d',
          950: '#3a270d',
        },
        ivory: '#fdfbf7',
        sand: '#f7f2ea',
        charcoal: {
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#4a4748',
          700: '#363435',
          800: '#221f20',
          900: '#141213',
          950: '#0a0909',
        },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-plus-jakarta)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        '3d': '0 10px 30px -10px rgba(59, 12, 34, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        '3d-hover': '0 20px 35px -10px rgba(59, 12, 34, 0.22), 0 10px 15px -3px rgba(212, 175, 55, 0.2)',
        'gold-glow': '0 0 25px -3px rgba(212, 175, 55, 0.35)',
        'glass': '0 8px 32px 0 rgba(34, 6, 19, 0.08)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
