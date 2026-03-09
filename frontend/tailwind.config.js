/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        // HMCTS-inspired palette
        crown: {
          50:  '#eef1f8',
          100: '#d5ddf0',
          200: '#aab9e1',
          300: '#7f96d2',
          400: '#5572c3',
          500: '#2a4eb4',
          600: '#1d3d96',
          700: '#152d78',
          800: '#0d1d5a', // primary navy
          900: '#06103c',
        },
        gold: {
          300: '#fcd97a',
          400: '#f8c63f',
          500: '#f4b006', // accent gold
          600: '#d49500',
        },
        slate: {
          925: '#0f1b2d',
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Source Serif 4"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(24px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(13,29,90,0.08), 0 4px 16px -4px rgba(13,29,90,0.12)',
        'card-hover': '0 4px 8px 0 rgba(13,29,90,0.12), 0 12px 32px -8px rgba(13,29,90,0.18)',
        'modal': '0 20px 60px -10px rgba(6,16,60,0.4)',
        'gold': '0 0 0 3px rgba(244,176,6,0.35)',
      },
    },
  },
  plugins: [],
};
