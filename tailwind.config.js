/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          surface: 'var(--glass-surface)',
          border: 'var(--glass-border)',
          highlight: 'var(--glass-highlight)',
        }
      }
    },
  },
  plugins: [],
};