export const animation = {
  fadeIn: "fadeIn 0.3s ease-out forwards",
  fadeOut: "fadeOut 0.3s ease-out forwards",
  scaleIn: "scaleIn 0.3s ease-out forwards",
  scaleOut: "scaleOut 0.3s ease-out forwards",
};

export const keyframes = {
  fadeIn: {
    "0%": { opacity: "0" },
    "100%": { opacity: "1" },
  },
  fadeOut: {
    "0%": { opacity: "1" },
    "100%": { opacity: "0" },
  },
  scaleIn: {
    "0%": { transform: "scale(0.95)", opacity: "0" },
    "100%": { transform: "scale(1)", opacity: "1" },
  },
  scaleOut: {
    "0%": { transform: "scale(1)", opacity: "1" },
    "100%": { transform: "scale(0.95)", opacity: "0" },
  },
};