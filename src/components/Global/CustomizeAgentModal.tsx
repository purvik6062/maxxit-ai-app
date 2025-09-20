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
              {/* r_last6h_pct - Enhanced Metric Card */}
              <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/10 border border-blue-500/30 rounded-lg p-4 hover:border-blue-500/50 transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-leagueSpartan text-white font-medium">Price Momentum</h4>
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
                      min="0"
                      max="100"
                      value={customizationOptions.r_last6h_pct}
                      onChange={(e) => setCustomizationOptions({
                        ...customizationOptions,
                        r_last6h_pct: parseInt(e.target.value)
                      })}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-blue"
                      style={{
                        background: `linear-gradient(to right, #6b7280 0%, #3b82f6 ${customizationOptions.r_last6h_pct}%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      <span className="text-blue-400">Typical: 50%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setCustomizationOptions({ ...customizationOptions, r_last6h_pct: 0 })}
                      className="px-3 py-1 text-xs bg-gray-600/20 text-gray-400 rounded hover:bg-gray-600/30 transition-colors"
                    >
                      Low
                    </button>
                    <button
                      onClick={() => setCustomizationOptions({ ...customizationOptions, r_last6h_pct: 50 })}
                      className="px-3 py-1 text-xs bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                    >
                      Medium
                    </button>
                    <button
                      onClick={() => setCustomizationOptions({ ...customizationOptions, r_last6h_pct: 100 })}
                      className="px-3 py-1 text-xs bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                    >
                      High
                    </button>
                  </div>
                </div>
              </div>
              {/* d_pct_mktvol_6h */}
              <div className="bg-gradient-to-r from-green-900/20 to-green-800/10 border border-green-500/30 rounded-lg p-4 hover:border-green-500/50 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-leagueSpartan text-white font-medium">Market Volume</h4>
                      <p className="text-xs text-gray-400">Trading volume change threshold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400">{customizationOptions.d_pct_mktvol_6h}%</div>
                    <div className="text-xs text-gray-500">Threshold</div>
                  </div>

                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={customizationOptions.d_pct_mktvol_6h}
                        onChange={(e) => setCustomizationOptions({
                          ...customizationOptions,
                          d_pct_mktvol_6h: parseInt(e.target.value)
                        })}
                        className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-enhanced"
                        style={{
                          background: `linear-gradient(to right, #ef4444 0%, #6b7280 50%, #10b981 100%)`
                        }}
                      />
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0.5 h-5 bg-gray-400 rounded"></div>
                    </div>

                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Low Impact</span>
                      <span>Neutral</span>
                      <span>High Impact</span>
                    </div>
                  </div>
                </div>

                {/* d_pct_socvol_6h */}
                <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50 hover:border-purple-500/30 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-leagueSpartan text-white font-medium">Social Volume</h4>
                        <p className="text-xs text-gray-400">Social mentions weight</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="5"
                        value={customizationOptions.d_pct_socvol_6h}
                        onChange={(e) => setCustomizationOptions({
                          ...customizationOptions,
                          d_pct_socvol_6h: Math.max(-100, Math.min(100, parseInt(e.target.value) || 0))
                        })}
                        className="w-16 px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-white text-center focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="text-purple-400 text-sm font-medium">%</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={customizationOptions.d_pct_socvol_6h}
                        onChange={(e) => setCustomizationOptions({
                          ...customizationOptions,
                          d_pct_socvol_6h: parseInt(e.target.value)
                        })}
                        className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-enhanced"
                        style={{
                          background: `linear-gradient(to right, #ef4444 0%, #6b7280 50%, #a855f7 100%)`
                        }}
                      />
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0.5 h-5 bg-gray-400 rounded"></div>
                    </div>

                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Ignore</span>
                      <span>Normal</span>
                      <span>Priority</span>
                    </div>
                  </div>
                </div>

                {/* d_pct_sent_6h */}
                <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50 hover:border-yellow-500/30 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-leagueSpartan text-white font-medium">Sentiment</h4>
                        <p className="text-xs text-gray-400">Bullish sentiment weight</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="5"
                        value={customizationOptions.d_pct_sent_6h}
                        onChange={(e) => setCustomizationOptions({
                          ...customizationOptions,
                          d_pct_sent_6h: Math.max(-100, Math.min(100, parseInt(e.target.value) || 0))
                        })}
                        className="w-16 px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-white text-center focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/50"
                      />
                      <span className="text-yellow-400 text-sm font-medium">%</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={customizationOptions.d_pct_sent_6h}
                        onChange={(e) => setCustomizationOptions({
                          ...customizationOptions,
                          d_pct_sent_6h: parseInt(e.target.value)
                        })}
                        className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-enhanced"
                        style={{
                          background: `linear-gradient(to right, #ef4444 0%, #6b7280 50%, #eab308 100%)`
                        }}
                      />
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0.5 h-5 bg-gray-400 rounded"></div>
                    </div>

                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Bearish</span>
                      <span>Neutral</span>
                      <span>Bullish</span>
                    </div>
                  </div>
                </div>

                {/* d_pct_users_6h */}
                <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50 hover:border-cyan-500/30 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-leagueSpartan text-white font-medium">User Growth</h4>
                        <p className="text-xs text-gray-400">Community breadth weight</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="5"
                        value={customizationOptions.d_pct_users_6h}
                        onChange={(e) => setCustomizationOptions({
                          ...customizationOptions,
                          d_pct_users_6h: Math.max(-100, Math.min(100, parseInt(e.target.value) || 0))
                        })}
                        className="w-16 px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-white text-center focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50"
                      />
                      <span className="text-cyan-400 text-sm font-medium">%</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={customizationOptions.d_pct_users_6h}
                        onChange={(e) => setCustomizationOptions({
                          ...customizationOptions,
                          d_pct_users_6h: parseInt(e.target.value)
                        })}
                        className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-enhanced"
                        style={{
                          background: `linear-gradient(to right, #ef4444 0%, #6b7280 50%, #06b6d4 100%)`
                        }}
                      />
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0.5 h-5 bg-gray-400 rounded"></div>
                    </div>

                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Low</span>
                      <span>Normal</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>

                {/* d_pct_infl_6h */}
                <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50 hover:border-pink-500/30 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-leagueSpartan text-white font-medium">Influencers</h4>
                        <p className="text-xs text-gray-400">Influencer mentions weight</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="5"
                        value={customizationOptions.d_pct_infl_6h}
                        onChange={(e) => setCustomizationOptions({
                          ...customizationOptions,
                          d_pct_infl_6h: Math.max(-100, Math.min(100, parseInt(e.target.value) || 0))
                        })}
                        className="w-16 px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-white text-center focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50"
                      />
                      <span className="text-pink-400 text-sm font-medium">%</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={customizationOptions.d_pct_infl_6h}
                        onChange={(e) => setCustomizationOptions({
                          ...customizationOptions,
                          d_pct_infl_6h: parseInt(e.target.value)
                        })}
                        className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-enhanced"
                        style={{
                          background: `linear-gradient(to right, #ef4444 0%, #6b7280 50%, #ec4899 100%)`
                        }}
                      />
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0.5 h-5 bg-gray-400 rounded"></div>
                    </div>

                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Ignore</span>
                      <span>Normal</span>
                      <span>Priority</span>
                    </div>
                  </div>
                </div>

                {/* d_galaxy_6h */}
                <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50 hover:border-indigo-500/30 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-leagueSpartan text-white font-medium">Heartbeat Score</h4>
                        <p className="text-xs text-gray-400">Composite health weight</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="1"
                        value={customizationOptions.d_galaxy_6h}
                        onChange={(e) => setCustomizationOptions({
                          ...customizationOptions,
                          d_galaxy_6h: Math.max(-10, Math.min(10, parseInt(e.target.value) || 0))
                        })}
                        className="w-16 px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-white text-center focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="text-indigo-400 text-sm font-medium">pts</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={customizationOptions.d_galaxy_6h}
                        onChange={(e) => setCustomizationOptions({
                          ...customizationOptions,
                          d_galaxy_6h: parseInt(e.target.value)
                        })}
                        className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-enhanced"
                        style={{
                          background: `linear-gradient(to right, #ef4444 0%, #6b7280 50%, #6366f1 100%)`
                        }}
                      />
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0.5 h-5 bg-gray-400 rounded"></div>
                    </div>

                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Weak</span>
                      <span>Neutral</span>
                      <span>Strong</span>
                    </div>
                  </div>
                </div>

                {/* neg_d_altrank_6h */}
                <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50 hover:border-orange-500/30 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-leagueSpartan text-white font-medium">Market Edge</h4>
                        <p className="text-xs text-gray-400">Relative ranking weight</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="5"
                        value={customizationOptions.neg_d_altrank_6h}
                        onChange={(e) => setCustomizationOptions({
                          ...customizationOptions,
                          neg_d_altrank_6h: Math.max(-100, Math.min(100, parseInt(e.target.value) || 0))
                        })}
                        className="w-16 px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-white text-center focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50"
                      />
                      <span className="text-orange-400 text-sm font-medium">%</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={customizationOptions.neg_d_altrank_6h}
                        onChange={(e) => setCustomizationOptions({
                          ...customizationOptions,
                          neg_d_altrank_6h: parseInt(e.target.value)
                        })}
                        className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-enhanced"
                        style={{
                          background: `linear-gradient(to right, #ef4444 0%, #6b7280 50%, #f97316 100%)`
                        }}
                      />
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0.5 h-5 bg-gray-400 rounded"></div>
                    </div>

                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Low</span>
                      <span>Normal</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>
              </div>
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
                    <h4 className="font-leagueSpartan text-white font-semibold text-lg">🎯 Balanced</h4>
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
                  <h4 className="font-leagueSpartan text-white font-medium">Signal Threshold Profile</h4>
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
    </div >
  );
};

export default CustomizeAgentModal;


