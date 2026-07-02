/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Scan all of src so classes in contexts/, lib/, etc. are compiled too.
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Normalize the whole project UI to Inter (self-hosted via next/font).
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        glass: {
          surface: 'var(--glass-surface)',
          border: 'var(--glass-border)',
          highlight: 'var(--glass-highlight)',
        }
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(15px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};