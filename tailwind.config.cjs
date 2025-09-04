module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}"],
  theme: {
    extend: {
      container: { center: true, padding: "1rem" },
      colors: {
        primary: "#DC2626",
        mustard: { DEFAULT: "#D4A017", dark: "#B8860B" },
        neutral: { light: "#F9F9F9", dark: "#1A1A1A", ink: "#000000", muted: "#4B5563" },
        blue: "#1E3A8A"
      },
      boxShadow: {
        brand: "0 2px 4px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.08)"
      }
    }
  },
  plugins: []
};
