/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tntt: {
          red: "#C8102E",
          yellow: "#FFD100",
          blue: "#0047AB",
          green: "#00875A",
          brown: "#704214",
          pink: "#E85D75",
        },
      },
    },
  },
  plugins: [],
};
