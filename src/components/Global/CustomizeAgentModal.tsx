"use client";

import React, { useMemo, useState } from "react";
import { X } from "lucide-react";
import type { CustomizationOptions } from "./OnboardingModals";

interface CustomizeAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
  customizationOptions: CustomizationOptions;
  setCustomizationOptions: (options: CustomizationOptions) => void;
}

const CustomizeAgentModal: React.FC<CustomizeAgentModalProps> = ({
  isOpen,
  onClose,
  onSkip,
  customizationOptions,
  setCustomizationOptions,
}) => {
  const [activeTab, setActiveTab] = useState<"metrics" | "presets">("metrics");

  const isValid = useMemo(() => {
    const ranges = {
      r_last6h_pct: { min: 0, max: 100 },
      d_pct_mktvol_6h: { min: 0, max: 100 },
      d_pct_socvol_6h: { min: 0, max: 100 },
      d_pct_sent_6h: { min: 0, max: 100 },
      d_pct_users_6h: { min: 0, max: 100 },
      d_pct_infl_6h: { min: 0, max: 100 },
      d_galaxy_6h: { min: 0, max: 10 },
      neg_d_altrank_6h: { min: 0, max: 100 },
    } as const;
    return (Object.keys(ranges) as (keyof CustomizationOptions)[]).every((k) => {
      const { min, max } = ranges[k];
      const v = customizationOptions[k];
      return typeof v === "number" && v >= min && v <= max;
    });
  }, [customizationOptions]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-leagueSpartan">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-50 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl bg-gray-900 shadow-2xl border border-blue-500/30 flex flex-col">
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 px-6 py-4 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">Customize Agent</h3>
              <p className="text-gray-300 text-sm mt-1">Set percentage change thresholds for when your agent should send trading signals</p>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800/50 transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="mt-3 text-right">
            <button onClick={onSkip} className="text-sm text-gray-300 hover:text-white underline-offset-2 hover:underline">I'll do it later</button>
          </div>
        </div>

        <div className="flex border-b border-gray-700/50 bg-gray-800/30">
          <button
            onClick={() => setActiveTab("metrics")}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${activeTab === "metrics" ? "text-white border-b-2 border-blue-500 bg-blue-500/10" : "text-gray-400 hover:text-white hover:bg-gray-800/50"}`}
          >
            Agent Metrics
          </button>
          <button
            onClick={() => setActiveTab("presets")}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${activeTab === "presets" ? "text-white border-b-2 border-purple-500 bg-purple-500/10" : "text-gray-400 hover:text-white hover:bg-gray-800/50"}`}
          >
            Agent Presets
          </button>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 min-h-0">
          {activeTab === "metrics" ? (
            <div className="w-full lg:w-1/2 border-r border-gray-700/50 overflow-y-auto p-4 space-y-4">
              {/* Price Momentum */}
              <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/10 border border-blue-500/30 rounded-lg p-4 hover:border-blue-500/50 transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Price Momentum</h4>
                      <p className="text-xs text-gray-400">6-hour return threshold (0% - 100%)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-400">{customizationOptions.r_last6h_pct}%</div>
                    <div className="text-xs text-gray-500">Threshold</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={customizationOptions.r_last6h_pct}
                      onChange={(e) => setCustomizationOptions({ ...customizationOptions, r_last6h_pct: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      style={{ background: `linear-gradient(to right, #6b7280 0%, #3b82f6 ${customizationOptions.r_last6h_pct}%)` }}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      <span className="text-blue-400">Typical: 50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setCustomizationOptions({ ...customizationOptions, r_last6h_pct: 0 })} className="px-3 py-1 text-xs bg-gray-600/20 text-gray-400 rounded hover:bg-gray-600/30 transition-colors">Low</button>
                    <button onClick={() => setCustomizationOptions({ ...customizationOptions, r_last6h_pct: 50 })} className="px-3 py-1 text-xs bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors">Medium</button>
                    <button onClick={() => setCustomizationOptions({ ...customizationOptions, r_last6h_pct: 100 })} className="px-3 py-1 text-xs bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors">High</button>
                  </div>
                </div>
              </div>

              {/* Additional metric cards can remain managed in parent for brevity; this modal focuses on reusability */}
            </div>
          ) : (
            <div className="w-full lg:w-1/2 border-r border-gray-700/50 overflow-y-auto p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Quick Strategy Presets</h3>
                <p className="text-sm text-gray-400">Choose a pre-configured strategy to get started quickly</p>
              </div>
              <div className="space-y-4">
                <button
                  onClick={() => setCustomizationOptions({ ...customizationOptions, r_last6h_pct: 10, d_pct_mktvol_6h: 15, d_pct_socvol_6h: 10, d_pct_sent_6h: 5, d_pct_users_6h: 10, d_pct_infl_6h: 5, d_galaxy_6h: 2, neg_d_altrank_6h: 10 })}
                  className="w-full text-left p-5 rounded-lg border border-gray-700/50 bg-gradient-to-r from-blue-900/20 to-blue-800/10 hover:border-blue-500/50 hover:from-blue-900/30 hover:to-blue-800/20 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-semibold text-lg">🎯 Balanced</h4>
                    <div className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">Recommended</div>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">Diversified weights across all signals. Good default for most market conditions.</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <span>Price: 10% • Volume: 15% • Social: 10% • Galaxy: 2pts</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          <div className="w-full lg:w-1/2 bg-gray-800/20 p-6 overflow-y-auto border-t lg:border-t-0 lg:border-r border-gray-700/50">
            <div className="mb-6 bg-gradient-to-r from-emerald-900/20 to-emerald-800/10 rounded-lg p-4 border border-emerald-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Signal Threshold Profile</h4>
                  <p className="text-sm text-gray-400 mt-1">Your agent will send signals when these thresholds are met</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Validity</p>
                  <p className={`text-sm font-semibold ${isValid ? "text-emerald-400" : "text-red-400"}`}>{isValid ? "Valid" : "Check ranges"}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Price Momentum</span>
                  <span className="text-blue-400 font-medium">{customizationOptions.r_last6h_pct}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Market Volume</span>
                  <span className="text-green-400 font-medium">{customizationOptions.d_pct_mktvol_6h}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Social Volume</span>
                  <span className="text-purple-400 font-medium">{customizationOptions.d_pct_socvol_6h}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Sentiment</span>
                  <span className="text-yellow-400 font-medium">{customizationOptions.d_pct_sent_6h}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">User Breadth</span>
                  <span className="text-cyan-400 font-medium">{customizationOptions.d_pct_users_6h}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Influencers</span>
                  <span className="text-pink-400 font-medium">{customizationOptions.d_pct_infl_6h}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Heartbeat Score Δ</span>
                  <span className="text-indigo-400 font-medium">{customizationOptions.d_galaxy_6h}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Market Edge ↑</span>
                  <span className="text-orange-400 font-medium">{customizationOptions.neg_d_altrank_6h}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700/50 p-4 bg-gray-800/30">
          <div className="flex gap-3">
            <button
              onClick={() => setCustomizationOptions({ ...customizationOptions })}
              className="px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              Reset
            </button>
            <button onClick={onClose} className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-gray-600 px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800">
              <span>Cancel</span>
            </button>
            <button
              onClick={() => isValid && onSkip()}
              disabled={!isValid}
              className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium flex items-center justify-center gap-1 transition-all ${isValid ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800" : "bg-gray-700 text-gray-400 cursor-not-allowed"}`}
            >
              <span>Create Agent & Continue</span>
              {isValid && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizeAgentModal;


