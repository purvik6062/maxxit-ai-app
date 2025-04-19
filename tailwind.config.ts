import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        "ping-fast": "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
        "ping-medium": "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
        "ping-slow": "ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite",
        "ping-slower": "ping 3s cubic-bezier(0, 0, 0.2, 1) infinite",
        "pulse-left-to-right": "pulseLeftToRight 5s ease-in-out infinite",
        "pulse-right-to-left": "pulseRightToLeft 5s ease-in-out infinite",
        "pulse-left-to-right-fast": "pulseLeftToRight 2s ease-in-out infinite",
        "pulse-right-to-left-fast": "pulseRightToLeft 2s ease-in-out infinite",
        heartbeat1: "heartbeat 2s ease-in-out infinite",
        heartbeat2: "heartbeat 2s ease-in-out infinite 0.15s",
        heartbeat3: "heartbeat 2s ease-in-out infinite 0.3s",
        "slow-flip": "slowFlip 5s ease-in-out infinite",
        "bounce-subtle": "bounceSubtle 1s ease-in-out infinite",
        "fire-glow": "fireGlow 0.8s ease-in-out",
        "pulse-particles": "pulse-particles 6s ease-in-out infinite",
        drift: "drift 20s linear infinite",
        "pulse-drift":
          "pulse-particles 6s ease-in-out infinite, drift 20s linear infinite",
      },
      fontFamily: {
        napzerRounded: ["var(--font-napzer-rounded)"],
        leagueSpartan: ["var(--font-league-spartan)"],
      },
      keyframes: {
        pulseLeftToRight: {
          "0%": {
            transform: "scaleX(0)",
            transformOrigin: "left",
            opacity: "0.8",
          },
          "40%": {
            transform: "scaleX(1)",
            transformOrigin: "left",
            opacity: "1",
          },
          "40.1%": {
            transform: "scaleX(1)",
            transformOrigin: "right",
            opacity: "1",
          },
          "80%": {
            transform: "scaleX(0)",
            transformOrigin: "right",
            opacity: "0.8",
          },
          "100%": {
            transform: "scaleX(0)",
            transformOrigin: "right",
            opacity: "0.8",
          },
        },
        pulseRightToLeft: {
          "0%": {
            transform: "scaleX(0)",
            transformOrigin: "right",
            opacity: "0.8",
          },
          "40%": {
            transform: "scaleX(1)",
            transformOrigin: "right",
            opacity: "1",
          },
          "40.1%": {
            transform: "scaleX(1)",
            transformOrigin: "left",
            opacity: "1",
          },
          "80%": {
            transform: "scaleX(0)",
            transformOrigin: "left",
            opacity: "0.8",
          },
          "100%": {
            transform: "scaleX(0)",
            transformOrigin: "left",
            opacity: "0.8",
          },
        },
        heartbeat: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-7px)" },
        },
        slowFlip: {
          "0%": { transform: "rotateY(0deg)" },
          "10%": { transform: "rotateY(180deg)" },
          "20%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(0deg)" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-2px)" },
        },
        fireGlow: {
          "0%": {
            boxShadow:
              "0 0 0px rgba(0,255,255,0), 0 0 0px rgba(0,255,255,0), 0 0 0px rgba(0,255,255,0)",
          },
          "50%": {
            boxShadow:
              "0 0 12px rgba(0,255,255,0.3), 0 0 30px rgba(0,255,255,0.5), 0 0 45px rgba(0,255,255,0.7)",
          },
          "100%": {
            boxShadow:
              "0 0 0px rgba(0,255,255,0), 0 0 0px rgba(0,255,255,0), 0 0 0px rgba(0,255,255,0)",
          },
        },
        "pulse-particles": {
          "0%": {
            filter: "blur(1px) brightness(1.4)",
            opacity: "0.4",
          },
          "50%": {
            filter: "blur(2px) brightness(2.2)",
            opacity: "0.7",
          },
          "100%": {
            filter: "blur(1px) brightness(1.4)",
            opacity: "0.4",
          },
        },
        drift: {
          "0%": {
            backgroundPosition: "0 0",
          },
          "100%": {
            backgroundPosition: "60px 60px",
          },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
} satisfies Config;
