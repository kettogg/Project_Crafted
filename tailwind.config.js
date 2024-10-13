/** @type {import('tailwindcss').Config} */
module.exports = {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: ["./app/**/*.{jsx,tsx,mdx}", "./components/**/*.{jsx,tsx,mdx}"],
  theme: {
    extend: {
      screens: {
        "scr-20": "20rem",
        "scr-30": "30rem",
        "scr-50": "50rem",
        "scr-60": "60rem",
        "scr-70": "70rem",
        "scr-90": "90rem",
        "scr-1360": "1360px",
        "scr-1560": "1560px",
      },
      width: {
        "full-30px": "calc(100% + 30px)",
      },
      borderRadius: {
        "radii-sm": "var(--radii-sm)",
        "radii-lg": "var(--radii-lg)",
        "radii-xl": "var(--radii-xl)",
        "radii-skeleton": "var(--radii-skeleton)",
      },
      colors: {
        black: "rgb(var(--black))",
        gray: "rgb(var(--gray))",
        white: "rgb(var(--white))",
        blue: "rgb(var(--blue))",
        "blue-hover": "rgb(var(--blue-hover))",
        "red-alt": "rgb(var(--red-alt))",
        green: "rgb(var(--green))",
        "green-dark": "rgb(var(--green-dark))",

        "base-main": "rgb(var(--base-main))",
        "base-alt": "rgb(var(--base-alt))",
        "base-hover": "rgb(var(--base-hover))",
        elevation: "rgb(var(--elevation))",
        "elevation-high": "rgb(var(--elevation-high))",
        "elevation-higher": "rgb(var(--elevation-higher))",

        background: "rgb(var(--background))",
        foreground: "rgb(var(--foreground))",
        "foreground-muted": "rgb(var(--foreground-muted))",
        "foreground-muted-dark": "rgb(var(--foreground-muted-dark))",
      },
      fontFamily: {
        // sans: "var(--font-rg-casual-text)",
        sans: "var(--font-clash-grotesk)",
        // sans: "var(--font-neue)",
        // sans: "var(--font-rg-mono)",
        "sans-alt": "var(--font-rg-casual)", // Narrower than Casual Text
        mono: "var(--font-rg-mono)",
        // mono: "var(--font-jetbrains-mono)",
        wide: "var(--font-rg-wide)",
        tight: "var(--font-rg-tight)",
      },
    },
  },
  plugins: [],
}
