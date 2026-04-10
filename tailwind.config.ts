// tailwind.config.js
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        filmMove: "filmMove 20s linear infinite",
        filmMoveReverse: "filmMoveReverse 20s linear infinite",
        spinSlow: "spin 3s linear infinite",
        spinReverse: "spin 2s linear infinite reverse",
        progressPulse: "progressPulse 1.5s ease-in-out infinite",
        typing: "typing 1.5s ease-in-out infinite",
      },
      keyframes: {
        filmMove: {
          "0%": { backgroundPosition: "0px 0px" },
          "100%": { backgroundPosition: "100px 0px" },
        },
        filmMoveReverse: {
          "0%": { backgroundPosition: "100px 0px" },
          "100%": { backgroundPosition: "0px 0px" },
        },
        spin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        progressPulse: {
          "0%, 100%": { opacity: 0.8 },
          "50%": { opacity: 1 },
        },
        typing: {
          "0%, 100%": { opacity: 0.2 },
          "50%": { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
