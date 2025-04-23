// components/Body/TabNavigation.tsx
import React, { useState, useEffect } from "react";
import { Heart, Sparkles } from "lucide-react";
import Image from "next/image";

interface TabNavigationProps {
  activeTab: "impact" | "heartbeat";
  setActiveTab: (tab: "impact" | "heartbeat") => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, setActiveTab }) => {
  // Animation state for pulses (desktop only)
  const [pulseVisible, setPulseVisible] = useState(true);
  const [centerGlow, setCenterGlow] = useState(false);

  // Toggle pulse visibility every few seconds for continuous effect (desktop only)
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseVisible(false);
      setTimeout(() => setPulseVisible(true), 100);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Add effect for center glow when pulse reaches center (desktop only)
  useEffect(() => {
    if (pulseVisible) {
      const pulseTime = 2000 * 0.4; // 40% of 2000ms
      const glowTimeout = setTimeout(() => {
        setCenterGlow(true);
        setTimeout(() => {
          setCenterGlow(false);
        }, 800);
      }, pulseTime);

      return () => clearTimeout(glowTimeout);
    }
  }, [pulseVisible]);

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Mobile Tab Navigation (< 768px) */}
      <div className="md:hidden py-10 flex justify-center mb-6">
        <div className="relative flex w-full bg-gray-800/50 rounded-xl p-1.5">
          <button
            onClick={() => setActiveTab("impact")}
            className={`relative flex-1 py-3 text-base font-medium flex items-center justify-center gap-2.5 rounded-lg transition-all duration-200 active:scale-95 overflow-hidden ${activeTab === "impact"
                ? "bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-white"
                : "text-gray-300"
              }`}
            role="tab"
            aria-selected={activeTab === "impact"}
            aria-label="View Impact Factor metrics"
          >
            {/* Ripple effect */}
            <span className="absolute inset-0 opacity-0 animate-ripple bg-blue-400/30 rounded-full pointer-events-none" />
            <Sparkles
              size={18}
              className={`transition-transform duration-200 ${activeTab === "impact"
                  ? "text-blue-200 animate-icon-bounce scale-110"
                  : "text-gray-300"
                }`}
            />
            <span
              className={`transition-transform duration-200 ${activeTab === "impact" ? "-translate-y-0.5" : ""
                }`}
            >
              Impact
            </span>
            {activeTab === "impact" && (
              <div className="flex space-x-1 ml-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 h-4 rounded-full bg-blue-300/80 animate-bounce"
                    style={{ animationDelay: `${i * 100}ms` }}
                  />
                ))}
              </div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("heartbeat")}
            className={`relative flex-1 py-3 text-base font-medium flex items-center justify-center gap-2.5 rounded-lg transition-all duration-200 active:scale-95 overflow-hidden ${activeTab === "heartbeat"
                ? "bg-gradient-to-r from-cyan-600/20 to-purple-600/20 text-white"
                : "text-gray-300"
              }`}
            role="tab"
            aria-selected={activeTab === "heartbeat"}
            aria-label="View Heartbeat metrics"
          >
            {/* Ripple effect */}
            <span className="absolute inset-0 opacity-0 animate-ripple bg-purple-400/30 rounded-full pointer-events-none" />
            <Heart
              size={18}
              className={`transition-transform duration-200 ${activeTab === "heartbeat"
                  ? "text-purple-200 animate-pulse scale-110"
                  : "text-gray-300"
                }`}
            />
            <span
              className={`transition-transform duration-200 ${activeTab === "heartbeat" ? "-translate-y-0.5" : ""
                }`}
            >
              Heartbeat
            </span>
            {activeTab === "heartbeat" && (
              <div className="relative h-4 w-6 ml-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="h-0.5 w-full bg-purple-300/80">
                    <div
                      className="absolute h-3 w-0.5 bg-purple-300/80 rounded animate-heartbeat1"
                      style={{ left: "25%" }}
                    />
                    <div
                      className="absolute h-4 w-0.5 bg-purple-300/80 rounded animate-heartbeat2"
                      style={{ left: "50%" }}
                    />
                    <div
                      className="absolute h-3 w-0.5 bg-purple-300/80 rounded animate-heartbeat3"
                      style={{ left: "75%" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Desktop Tab Navigation (≥ 768px) */}
      <div className="hidden py-16 md:block">
        {/* Decorative horizontal line */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent transform -translate-y-1/2 z-0" />

        {/* Center logo */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div
            className={`relative w-20 h-20 rounded-full bg-gray-900 p-1 border transition-all duration-300 ${centerGlow
              ? "border-cyan-400 animate-flip-loop animate-fire-glow"
              : "border-gray-800 shadow-lg shadow-blue-900/20"
              }`}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 animate-pulse" />
            <div className="relative w-full h-full rounded-full bg-gray-950 flex items-center justify-center overflow-hidden">
              <div className="animate-slow-flip">
                <Image
                  src="/img/maxxit_icon.svg"
                  alt="Maxxit"
                  width={40}
                  height={40}
                  className="z-10"
                />
              </div>
            </div>

            {/* Central pulse rings */}
            {pulseVisible && (
              <>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-blue-400/30 animate-ping-fast opacity-0" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-cyan-400/20 animate-ping-medium opacity-0" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-cyan-400/10 animate-ping-slow opacity-0" />
              </>
            )}
          </div>
        </div>

        {/* Left pulse line (to Impact) */}
        {pulseVisible && (
          <div className="absolute top-1/2 left-[12%] right-[52%] h-1 -mt-0.5 z-10">
            <div className="h-full w-full bg-gradient-to-r from-blue-500/0 via-cyan-400/70 to-blue-500/0 animate-pulse-left-to-right-fast rounded-full" />
          </div>
        )}

        {/* Right pulse line (to Heartbeat) */}
        {pulseVisible && (
          <div className="absolute top-1/2 left-[52%] right-[12%] h-1 -mt-0.5 z-10">
            <div className="h-full w-full bg-gradient-to-r from-cyan-500/0 via-purple-500/70 to-cyan-500/0 animate-pulse-right-to-left-fast rounded-full" />
          </div>
        )}

        {/* Left Tab: Impact Factor */}
        <div className="flex justify-between items-center">
          <div className="w-64 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-lg blur-md opacity-0 group-hover:opacity-70 transition-opacity duration-300" />
            <button
              onClick={() => setActiveTab("impact")}
              className={`relative w-full flex items-center justify-between gap-3 px-5 py-3 rounded-lg transition-all duration-300 ${activeTab === "impact"
                ? "bg-gradient-to-r from-blue-600/90 to-cyan-600/90 shadow-lg shadow-blue-900/30"
                : "bg-[#102037] hover:bg-gray-900/70 border border-gray-800/50"
                }`}
              role="tab"
              aria-selected={activeTab === "impact"}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`p-1.5 rounded-md ${activeTab === "impact" ? "bg-blue-500/20" : "bg-gray-800"
                    }`}
                >
                  <Sparkles
                    size={16}
                    className={
                      activeTab === "impact" ? "text-blue-200" : "text-gray-400"
                    }
                  />
                </div>
                <span
                  className={`font-medium ${activeTab === "impact" ? "text-white" : "text-gray-400"
                    }`}
                >
                  Impact Factor
                </span>
              </div>

              {activeTab === "impact" && (
                <div className="flex space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 h-4 rounded-full bg-blue-300/80 animate-bounce-subtle"
                      style={{ animationDelay: `${i * 100}ms` }}
                    />
                  ))}
                </div>
              )}
            </button>

            {/* Information tooltip */}
            <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-800/50 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-30">
              <p className="text-xs text-gray-300">
                Track analyst influence based on market impact metrics. Higher
                scores indicate stronger market correlation.
              </p>
            </div>
          </div>

          {/* Right Tab: Heartbeat */}
          <div className="w-64 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-purple-600/20 rounded-lg blur-md opacity-0 group-hover:opacity-70 transition-opacity duration-300" />
            <button
              onClick={() => setActiveTab("heartbeat")}
              className={`relative w-full flex items-center justify-between gap-3 px-5 py-3 rounded-lg transition-all duration-300 ${activeTab === "heartbeat"
                ? "bg-gradient-to-r from-cyan-600/90 to-purple-600/90 shadow-lg shadow-cyan-900/30"
                : "bg-[#102037] hover:bg-gray-900/70 border border-gray-800/50"
                }`}
              role="tab"
              aria-selected={activeTab === "heartbeat"}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`p-1.5 rounded-md ${activeTab === "heartbeat" ? "bg-cyan-500/20" : "bg-gray-800"
                    }`}
                >
                  <Heart
                    size={16}
                    className={`${activeTab === "heartbeat" ? "text-purple-200" : "text-gray-400"
                      } ${activeTab === "heartbeat" ? "animate-pulse" : ""}`}
                  />
                </div>
                <span
                  className={`font-medium ${activeTab === "heartbeat" ? "text-white" : "text-gray-400"
                    }`}
                >
                  Heartbeat
                </span>
              </div>

              {activeTab === "heartbeat" && (
                <div className="relative h-4 w-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="h-0.5 w-full bg-purple-300/80">
                      <div
                        className="absolute h-3 w-0.5 bg-purple-300/80 rounded animate-heartbeat1"
                        style={{ left: "25%" }}
                      />
                      <div
                        className="absolute h-4 w-0.5 bg-purple-300/80 rounded animate-heartbeat2"
                        style={{ left: "50%" }}
                      />
                      <div
                        className="absolute h-3 w-0.5 bg-purple-300/80 rounded animate-heartbeat3"
                        style={{ left: "75%" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </button>

            {/* Information tooltip */}
            <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-800/50 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-30">
              <p className="text-xs text-gray-300">
                Monitor real-time market sentiment from top analysts. Shows
                current mood and prediction reliability.
              </p>
            </div>
          </div>
        </div>

        {/* Explanatory text */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-center w-full">
          <p className="text-sm text-gray-300">
            Hover over metrics for more information
          </p>
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;