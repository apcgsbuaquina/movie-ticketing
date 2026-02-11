/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cinema: {
          black: '#0d0d0d',
          dark: '#1a1a2e',
          navy: '#16213e',
          red: '#8b2635',
          gold: '#c4a35a',
          cream: '#f5e6c8',
          sepia: '#d4a574',
          teal: '#2d6a6a',
          burgundy: '#722f37',
          charcoal: '#2c2c2c',
        },
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Source Serif 4"', 'Georgia', 'serif'],
        accent: ['"Special Elite"', 'cursive'],
      },
      animation: {
        'flicker': 'flicker 3s infinite',
        'grain': 'grain 0.5s steps(6) infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'seat-pop': 'seat-pop 0.3s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'marquee': 'marquee 20s linear infinite',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1' },
          '41%': { opacity: '1' },
          '42%': { opacity: '0.8' },
          '43%': { opacity: '1' },
          '45%': { opacity: '0.2' },
          '46%': { opacity: '1' },
        },
        grain: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%': { transform: 'translate(-5%, -10%)' },
          '30%': { transform: 'translate(3%, -15%)' },
          '50%': { transform: 'translate(12%, 9%)' },
          '70%': { transform: 'translate(9%, 4%)' },
          '90%': { transform: 'translate(-1%, 7%)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(196, 163, 90, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(196, 163, 90, 0.6), 0 0 40px rgba(196, 163, 90, 0.2)' },
        },
        'seat-pop': {
          '0%': { transform: 'scale(0.8)', opacity: '0.5' },
          '50%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      backgroundImage: {
        'halftone': 'radial-gradient(circle, rgba(196, 163, 90, 0.1) 1px, transparent 1px)',
        'ticket-perforation': 'radial-gradient(circle, transparent 5px, currentColor 5px)',
      },
    },
  },
  plugins: [],
};
