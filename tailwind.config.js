/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{jsx,tsx,mdx}", "./components/**/*.{jsx,tsx,mdx}"],
  theme: {
    extend: {
      screens: {
        "scr-1360": "1360px",
        "scr-1560": "1560px",
      },
      width: {
        "full-30px": "calc(100% + 30px)",
      },
      colors: {
        black: "rgb(var(--black))",
        "black-muted": "rgb(var(--black-muted))",
        "muted-link": "rgb(var(--muted-link))",
        background: "rgb(var(--black))",
        foreground: "rgb(var(--white))",
        "muted-foreground": "rgb(var(--muted-foreground))",
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
