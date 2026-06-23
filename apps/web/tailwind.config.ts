import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#18202F",
        muted: "#667085",
        line: "#E4E7EC",
        surface: "#F6F7F9",
        brand: {
          50: "#EEF6FF",
          100: "#D8EAFF",
          500: "#2D7FF9",
          600: "#1D65D8",
          700: "#194FA8"
        },
        mint: {
          100: "#DDF8EC",
          600: "#12805C"
        },
        amber: {
          100: "#FFF2CC",
          600: "#9F640A"
        }
      },
      boxShadow: {
        soft: "0 18px 50px rgba(24, 32, 47, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
