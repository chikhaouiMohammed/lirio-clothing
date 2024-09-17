/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // Root HTML file
    "./src/**/*.{js,ts,jsx,tsx}", // All JavaScript, TypeScript, JSX, and TSX files in the src directory
  ],
  theme: {
    extend: {
      colors: {
        darkGray: '#0B0B0B', // Custom color
        gold: '#D4AF37', // Custom color
        lightBeige: '#D7CDCC', // Custom color
        white: '#FFFFFF', // Custom color
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'], // Custom font family
        poppins: ['Poppins', 'sans-serif'], // Custom font family
        roboto: ['Roboto', 'sans-serif'], // Custom font family
      },
    },
  },
  plugins: [
    
  ],
}
