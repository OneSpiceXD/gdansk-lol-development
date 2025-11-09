import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Poland Red
        'poland-red': {
          DEFAULT: '#DC143C',
          dark: '#B01030',
          light: '#FF4458',
        },
        // Cyan Accent
        'cyan-accent': {
          DEFAULT: '#00D4FF',
          hover: '#00B8E6',
          dark: '#0099CC',
        },
        // Purple Accent (for tournaments/achievements)
        'purple-accent': {
          DEFAULT: '#9b51e0',
          hover: '#b269f0',
          dark: '#7d3fb8',
        },
        // Orange Accent (for live/urgent)
        'orange-accent': {
          DEFAULT: '#ff6900',
          hover: '#ff8534',
          dark: '#e55e00',
        },
        // Dark Theme Colors
        'navy-dark': '#0A0E27',
        'charcoal': {
          DEFAULT: '#1A1A1A',
          light: '#2A2A2A',
          lighter: '#1E2139',
        },
      },
    },
  },
  plugins: [],
};
export default config;
