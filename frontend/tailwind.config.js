/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#09090b',   // Zinc-950
        accent: '#8b5cf6',       // Violet-500
        'text-primary': '#f4f4f5', // Zinc-100
        border: '#27272a',       // Zinc-800
      },
      borderRadius: {
        'xl': '0.75rem',
      },
    },
  },
  plugins: [],
}
