module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}"],
  theme: {
    extend: {
      container: { center: true, padding: "1rem" },
      colors: {
        primary: "#DC2626",
        secondary: "#0057B8",
        accent: { yellow: "#FACC15" },
        neutral: { heading: "#000000", text: "#374151", muted: "#6B7280" },
      },
      boxShadow: {
        brand: "0 2px 4px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};
