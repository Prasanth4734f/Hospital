/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f5ff',
          100: '#e0ecff',
          200: '#c7dcfe',
          300: '#a3c3fc',
          400: '#759ff8',
          500: '#4375f2',
          600: '#2b58e7',
          700: '#1d41cf',
          800: '#1e35a7',
          900: '#0F172A',
          DEFAULT: '#0F2744', // Deep Navy Blue
          dark: '#0A1A2F',
        },
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488', // Medical Teal
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        accent: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8', // Soft Blue
          500: '#0ea5e9',
          600: '#0284c7',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F8FAFC',
          border: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
