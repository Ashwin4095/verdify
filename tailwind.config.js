/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        moss: "#2E4036",
        clay: "#9ED8B3", // Cyber Mint
        cream: "#F2F0E9",
        charcoal: "#1A1A1A",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Outfit", "sans-serif"],
        serif: ["Cormorant Garamond", "serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '3rem',
      },
      transitionTimingFunction: {
        'magnetic': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
