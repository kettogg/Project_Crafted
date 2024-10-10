/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{jsx,tsx,mdx}", "./components/**/*.{jsx,tsx,mdx}"],
  theme: {
    extend: {
      screens: {
        "scr-1560": "1560px",
      },
      colors: {
        black: "rgb(var(--black))",

        "muted-link": "rgb(var(--muted-link))",
        background: "rgb(var(--black))",
        foreground: "rgb(var(--white))",
      },
      fontFamily: {
        sans: "var(--font-rg-mono)", // This is for the wallet dropdown as it uses font-sans
        "sans-alt": "var(--font-rg-casual)", // This will be used for normal text in pages
        mono: "var(--font-rg-mono)",
        wide: "var(--font-rg-wide)",
        tight: "var(--font-rg-tight)",
      },
    },
  },
  plugins: [],
}
