module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}"],
  theme: {
    extend: {
      container: { center: true, padding: "1rem" },
      colors: {
        // Primary actions use a bold red, while links and secondary
        // elements rely on a complementary blue.  A dark mustard yellow
        // provides an accent colour for warnings or highlighted labels.
        primary: "#DC2626",
        secondary: "#0057B8",
        accent: { mustard: "#B8860B" },
        neutral: { title: "#000000", text: "#4B5563" }
      },
      boxShadow: {
        brand: "0 2px 4px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.08)"
      }
    }
  },
  plugins: []
};
