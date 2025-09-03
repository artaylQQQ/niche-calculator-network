module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}"],
  theme: {
    extend: {
      container: { center: true, padding: "1rem" },
      colors: {
        base: {
          black: "#000000",
          gray: "#6b7280",
          white: "#ffffff"
        },
        accent: {
          red: "#ef4444",
          blue: "#2563eb",
          yellow: "#facc15"
        }
      }
    }
  },
  plugins: []
};
