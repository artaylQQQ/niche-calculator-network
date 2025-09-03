module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}"],
  theme: {
    extend: {
      container: { center: true, padding: "1rem" },
      colors: {
        primary: "#1e40af",
        primaryRed: "#dc2626",
        accent: "#facc15",
        background: "#ffffff",
        surface: "#f7f7f8",
        ink: "#0b0b0c",
        muted: "#6b7280",
      },
      boxShadow: {
        site: "0 1px 2px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
};
