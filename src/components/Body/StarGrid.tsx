"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";

export default function GlowingTradingGrid() {
  const container = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  gsap.registerPlugin(useGSAP);

  const grid = [14, 30] as const; // Updated to match StarGrid dimensions

  const tradingIcons = [
    "M3 3v18h18", // Chart base
    "M3 12h18", // Horizontal line
    "M12 3v18", // Vertical line
    "M3 3l6 6 4-4 8 8", // Line chart
    "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z", // Circle (coin)
    "M12 7v5l3 3", // Clock hands
    "M16 8v8m-4-5v5m-4-2v2M4 4h16v16H4z", // Candlestick chart
  ];

  useGSAP(
    () => {
      if (prefersReducedMotion) {
        gsap.set(container.current, { opacity: 1 });
        gsap.set(".trading-grid-item", {
          opacity: 0.3,
          scale: 1,
        });
        return;
      }

      gsap.set(".trading-grid-item", {
        opacity: 0,
        transformOrigin: "center",
        stroke: "#0f172a",
      });
      gsap.set(container.current, { opacity: 1 });

      const tl = gsap.timeline();

      // Entrance animation
      tl.to(".trading-grid-item", {
        keyframes: [
          {
            opacity: 0,
            duration: 0,
          },
          {
            opacity: 0.7,
            stroke: "#60a5fa",
            scale: 1.2,
            duration: 0.8,
            stagger: {
              amount: 2,
              grid: grid,
              from: "random",
            },
          },
          {
            opacity: 0.3,
            stroke: "#334155",
            scale: 1,
            duration: 0.5,
            stagger: {
              amount: 1.5,
              grid: grid,
              from: "random",
            },
          },
        ],
      });

      // Loop animation
      tl.to(".trading-grid-item", {
        delay: 2,
        repeat: -1,
        repeatDelay: 3,
        keyframes: [
          {
            opacity: 0.7,
            stroke: "#60a5fa",
            scale: 1.2,
            duration: 0.8,
            stagger: {
              amount: 2,
              grid: grid,
              from: "random",
            },
          },
          {
            opacity: 0.3,
            stroke: "#334155",
            scale: 1,
            duration: 0.5,
            stagger: {
              amount: 1.5,
              grid: grid,
              from: "random",
            },
          },
        ],
      });
    },
    { scope: container },
  );

  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 935 425"
        className="absolute -top-14 -z-10"
        id="glowing-trading-grid"
        ref={container}
        opacity={0}
        style={{
          maskImage: "linear-gradient(black, transparent)",
        }}
      >
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <g className="trading-grid-group" filter="url(#glow)">
          {[...Array(grid[0])].map((_, i) => {
            return [...Array(grid[1])].map((_, j) => {
              const iconIndex = (i * grid[1] + j) % tradingIcons.length;
              return (
                <path
                  key={i + j}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity=".3"
                  className="trading-grid-item"
                  transform={`translate(${j * 32}, ${i * 32 + 10}) scale(0.6)`}
                  d={tradingIcons[iconIndex]}
                />
              );
            });
          })}
        </g>
      </svg>
    </div>
  );
}