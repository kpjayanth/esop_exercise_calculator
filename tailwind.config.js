/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        hissa: {
          accent: '#E85936',
          'accent-dark': '#d14e2e',
          success: '#16A34A',
          heading: '#071437',
          body: '#252F4A',
          input: '#4B5675',
          muted: '#99A1B7',
          'page-bg': '#F6F9FB',
          'card-border': '#F1F1F4',
          'field-border': '#DBDFE9',
          'ghost-btn': '#F5F8FA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        ds: '0 3px 4px rgba(0, 0, 0, 0.03)',
      },
    },
  },
  plugins: [],
}

