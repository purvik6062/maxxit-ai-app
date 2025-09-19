// components/Body/TabNavigation.tsx
import React from "react";
import { Sparkles } from "lucide-react";

interface TabNavigationProps {
  activeTab: "impact" | "heartbeat";
  setActiveTab: (tab: "impact" | "heartbeat") => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  setActiveTab,
}) => {
  // Decorative center logo and pulse effects are disabled while Heartbeat is hidden

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Mobile Tab Navigation (< 768px) */}
      <div className="md:hidden py-10 flex justify-center mb-6">
        <div className="relative flex w-full bg-gray-800/50 rounded-xl p-1.5">
          <button
            onClick={() => setActiveTab("impact")}
            className={`relative flex-1 py-3 text-base font-medium flex items-center justify-center gap-2.5 rounded-lg transition-all duration-200 active:scale-95 overflow-hidden ${
              activeTab === "impact"
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
              className={`transition-transform duration-200 ${
                activeTab === "impact"
                  ? "text-blue-200 animate-icon-bounce scale-110"
                  : "text-gray-300"
              }`}
            />
            <span
              className={`transition-transform duration-200 ${
                activeTab === "impact" ? "-translate-y-0.5" : ""
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
        </div>
      </div>

      {/* Desktop Tab Navigation (≥ 768px) */}
      <div className="hidden py-16 md:block">
        {/* Decorative horizontal line */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent transform -translate-y-1/2 z-0" />

        {/* Center logo and pulse lines hidden */}

        {/* Right pulse line hidden while Heartbeat tab is disabled */}

        {/* Left Tab: Impact Factor */}
        <div className="relative flex justify-center items-center">
          <div className="absolute top-1/2 left-0 right-1/2 h-1 -mt-0.5 z-0 pointer-events-none">
            <div className="h-full w-full bg-gradient-to-r from-blue-500/0 via-cyan-400/70 to-blue-500/0 animate-pulse-right-to-left-fast rounded-full" />
          </div>
          <div className="absolute top-1/2 left-1/2 right-0 h-1 -mt-0.5 z-0 pointer-events-none">
            <div className="h-full w-full bg-gradient-to-r from-blue-500/0 via-cyan-400/70 to-blue-500/0 animate-pulse-left-to-right-fast rounded-full" />
          </div>
          <div className="w-64 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-lg blur-md opacity-0 group-hover:opacity-70 transition-opacity duration-300" />
            <button
              onClick={() => setActiveTab("impact")}
              className={`relative z-10 w-full flex items-center justify-between gap-3 px-5 py-3 rounded-lg transition-all duration-300 ${
                activeTab === "impact"
                  ? "bg-gradient-to-r from-blue-600/90 to-cyan-600/90 shadow-lg shadow-blue-900/30"
                  : "bg-[#102037] hover:bg-gray-900/70 border border-gray-800/50"
              }`}
              role="tab"
              aria-selected={activeTab === "impact"}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`p-1.5 rounded-md ${
                    activeTab === "impact" ? "bg-blue-500/20" : "bg-gray-800"
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
                  className={`font-medium ${
                    activeTab === "impact" ? "text-white" : "text-gray-400"
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
