module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}"],
  theme: {
    extend: {
      container: { center: true, padding: "1rem" },
      colors: {
        action: "#DC2626",
        link: "#0057B8",
        accent: { mustard: "#B88A00" },
        neutral: { ink: "#333333", headline: "#000000", muted: "#4B5563" }
      },
      boxShadow: {
        brand: "0 2px 4px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.08)"
      }
    }
  },
  plugins: []
};
