/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:     '#ff6b35',
        'brand-amber':  '#f7931e',
        accent:      '#e84393',
        'brand-pink':   '#e84393',
        'brand-violet': '#6c5ce7',
        background:  '#fdf8f3',
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #ff6b35 0%, #f7931e 33%, #e84393 66%, #6c5ce7 100%)',
      },
    },
  },
  plugins: [],
}