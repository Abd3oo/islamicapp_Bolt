/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Tajawal', 'system-ui', 'sans-serif'],
        arabic: ['Amiri', 'serif'],
        display: ['Amiri', 'Tajawal', 'serif'],
      },
      colors: {
        // navy → warm gold (primary brand)
        navy: {
          50: '#fbf8f0',
          100: '#f5edd6',
          200: '#ecd9a8',
          300: '#dcbb6e',
          400: '#c89a32',
          500: '#b68420',
          600: '#9a6e1c',
          700: '#7c5718',
          800: '#654617',
          900: '#553a17',
          950: '#33200d',
        },
        // sky → teal/jade (secondary accent)
        sky: {
          50: '#eefaf6',
          100: '#d3f2e9',
          200: '#a8e4d4',
          300: '#62cdae',
          400: '#28b088',
          500: '#10956e',
          600: '#0a7858',
          700: '#0a604a',
          800: '#0c4d3e',
          900: '#0d4035',
        },
        // ink → warm espresso/charcoal (backgrounds)
        ink: {
          950: '#161310',
          900: '#1e1a16',
          800: '#28231d',
          700: '#353029',
          600: '#454036',
        },
        // slate → warm stone (text & neutrals)
        slate: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
          950: '#0c0a09',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 4s ease-in-out infinite',
        'aurora': 'aurora 18s ease infinite',
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'gradient-x': 'gradientX 8s ease infinite',
        'marquee': 'marquee 30s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        glow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.85' },
        },
        aurora: {
          '0%, 100%': { transform: 'translate(0,0) scale(1)' },
          '33%': { transform: 'translate(4%, -3%) scale(1.08)' },
          '66%': { transform: 'translate(-3%, 3%) scale(0.96)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.2', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.3)' },
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      backgroundImage: {
        'grid-pattern':
          'radial-gradient(rgba(184,132,32,0.05) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};
