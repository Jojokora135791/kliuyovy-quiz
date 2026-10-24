/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'quiz-bg': 'var(--quiz-bg-color)',
        'quiz-primary': 'var(--quiz-primary-color)',
        'quiz-accent': 'var(--quiz-accent-color)',
      },
      fontFamily: {
        quiz: 'var(--quiz-font-family)',
        heading: ['Fredoka', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
