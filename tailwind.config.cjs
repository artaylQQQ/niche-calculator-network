module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}"],
  theme: {
    extend: {
      container: { center: true, padding: "1rem" },
      colors: {
        primary: "var(--primary)",
        "accent-red": "var(--accent-red)",
        "accent-purple": "var(--accent-purple)",
        ink: "var(--ink)",
        surface: "var(--surface)",
      },
    },
  },
  plugins: [],
};
