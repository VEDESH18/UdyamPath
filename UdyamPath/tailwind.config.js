/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: '#FF6B35',
        navy: '#1a1a2e',
        surface: '#16213e',
        accentRed: '#e94560',
        successGreen: '#0f9b58',
        muted: '#a8b2d8',
        white: '#ffffff',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        noto: ['Noto Sans', 'sans-serif'],
      },
      boxShadow: {
        'saffron-glow': '0 0 20px rgba(255,107,53,0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
