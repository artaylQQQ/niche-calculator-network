module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}"],
  theme: {
    extend: {
      container: { center: true, padding: "1rem" },
      colors: {
        primary: "#2563EB",
        accent: { turquoise: "#10B981", red: "#DC2626" },
        neutral: { ink: "#000000", muted: "#4B5563" }
      },
      boxShadow: {
        brand: "0 2px 4px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.08)"
      }
    }
  },
  plugins: []
};
