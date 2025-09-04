module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}"],
  theme: {
    extend: {
      container: { center: true, padding: "1rem" },
      colors: {
        primary: "#DC2626",
        accent: { gray: "#D1D5DB", mustard: "#B8860B" },
        neutral: { ink: "#1A1A1A", muted: "#4B5563" }
      },
      boxShadow: {
        brand: "0 2px 4px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.08)"
      }
    }
  },
  plugins: []
};
