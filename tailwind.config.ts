import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Nunito", "system-ui", "sans-serif"],
        mono: ["Nunito", "system-ui", "sans-serif"],
        heading: ["Space Grotesk", "system-ui", "sans-serif"],
      },
      colors: {
        bg:      "#FDF6F0",
        surface: "#FFF0F5",
        border:  "#F4C2C2",
        muted:   "#C9A0A0",
        soft:    "#9D6B6B",
        text:    "#3D1F1F",
        accent:  "#E8729A",
        "accent-dim": "#D45C85",
        danger:  "#E57373",
        success: "#81C784",
      },
      keyframes: {
        "slide-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
      },
      animation: {
        "slide-up": "slide-up 0.2s ease-out",
        "fade-in":  "fade-in 0.15s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
