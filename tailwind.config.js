/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'quiz-bg': 'var(--quiz-bg-color)',
        'quiz-primary': 'var(--quiz-primary-color)',
        'quiz-accent': 'var(--quiz-accent-color)',
        sweet: '#ff9bd2',
        trick: '#7cf29c',
      },
      fontFamily: {
        quiz: 'var(--quiz-font-family)',
        heading: ['Rubik', 'system-ui', 'sans-serif'],
        spooky: ['"Rubik Wet Paint"', 'Rubik', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
