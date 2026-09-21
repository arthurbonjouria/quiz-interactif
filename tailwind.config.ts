import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Charte graphique officielle BONJOUR IA
        ink: "#2D2D2D", // Dark — corps de texte principal
        brand: "#E83967", // Pink BONJOUR IA — accents, CTA, titres
        offwhite: "#F4F3EE", // Pampas — fond principal
        cloudy: "#B1ADA1", // Sous-titres, labels, UI secondaire
        soft: "#F2D5D0", // Rose vieux — fonds doux, hover
      },
      fontFamily: {
        heading: ["var(--font-poppins)", "Arial", "sans-serif"],
        body: ["var(--font-lora)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
