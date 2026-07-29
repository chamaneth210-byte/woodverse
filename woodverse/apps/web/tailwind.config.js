export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        forest: "#115745",
        moss: "#2f6757",
        wood: "#a96f35",
        paper: "#f5f8fc",
        ink: "#2d3940",
      },
      boxShadow: {
        soft: "0 18px 38px rgba(25, 55, 72, 0.12)",
        dark: "0 24px 60px rgba(0, 0, 0, 0.35)",
      },
    },
  },
  plugins: [],
};
