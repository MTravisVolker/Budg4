module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      maxWidth: {
        'custom': '3440px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('daisyui'),
  ],
}; 