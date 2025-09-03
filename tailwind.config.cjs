module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}"],
  theme: {
    extend: {
      container: { center: true, padding: "1rem" },
      colors: {
        primary: "#0057B8",
        accent: { yellow: "#FACC15", red: "#DC2626" },
        neutral: { ink: "#000000", muted: "#4B5563", sky: "#E0F2FE", surface: "#F0F9FF" }
      },
      boxShadow: {
        brand: "0 2px 4px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.08)"
      }
    }
  },
  plugins: []
};
