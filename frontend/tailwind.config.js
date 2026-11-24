/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        navy: {
          950: '#070b14',
          900: '#0d1527',
          850: '#111b33',
          800: '#172442',
          700: '#21335b',
        },
        brand: {
          blue: '#2563eb',
          cyan: '#06b6d4',
          teal: '#14b8a6',
          emerald: '#10b981',
          rose: '#f43f5e',
          amber: '#f59e0b',
        },
        gain: '#10b981',
        loss: '#ef4444',
      },
    },
  },
  plugins: [],
};
