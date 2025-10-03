"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";

// Custom CSS for enhanced sliders 
const sliderStyles = `
  .slider-enhanced {
    -webkit-appearance: none;
    appearance: none;
  }
  
  .slider-enhanced::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #ffffff;
    cursor: pointer;
    border: 2px solid #3b82f6;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    transition: all 0.2s ease;
  }
  
  .slider-enhanced::-webkit-slider-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  }
  
  .slider-enhanced::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #ffffff;
    cursor: pointer;
    border: 2px solid #3b82f6;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    transition: all 0.2s ease;
  }
  
  .slider-enhanced::-moz-range-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  }
`;

if (typeof document !== 'undefined') {
  const styleElement = document.getElementById('slider-styles') || document.createElement('style');
  styleElement.id = 'slider-styles';
  styleElement.textContent = sliderStyles;
  if (!document.getElementById('slider-styles')) {
    document.head.appendChild(styleElement);
  }
}

interface CustomizationOptions {
  r_last6h_pct: number;
  d_pct_mktvol_6h: number;
  d_pct_socvol_6h: number;
  d_pct_sent_6h: number;
  d_pct_users_6h: number;
  d_pct_infl_6h: number;
  d_galaxy_6h: number;
  neg_d_altrank_6h: number;
}

export type { CustomizationOptions };

interface CustomizeAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
  onContinue: () => void;
  onSaved?: () => void;
  customizationOptions: CustomizationOptions;
  setCustomizationOptions: (options: CustomizationOptions) => void;
  hasCustomizedAgent?: boolean;
  setHasCustomizedAgent?: (hasCustomized: boolean) => void;
  isOnboardingFlow?: boolean; // New prop to distinguish between onboarding and regular usage
}

const CustomizeAgentModal: React.FC<CustomizeAgentModalProps> = ({
  isOpen,
  onClose,
  onSkip,
  onContinue,
  onSaved,
  customizationOptions,
  setCustomizationOptions,
  hasCustomizedAgent,
  setHasCustomizedAgent,
  isOnboardingFlow = false,
}) => {
  const [activeTab, setActiveTab] = useState<"metrics" | "presets">("metrics");
  const initialCustomizationRef = useRef<CustomizationOptions>(customizationOptions);
  const { data: session } = useSession();
  const [isSaving, setIsSaving] = useState(false);

  const validateCustomizationOptions = (options: CustomizationOptions): boolean => {
    // All metrics use 0-100 range for weightages
    for (const [key, value] of Object.entries(options)) {
      if (value < 0 || value > 100) {
        return false;
      }
    }
    return true;
  };

  const isValid = validateCustomizationOptions(customizationOptions);
  const isCustomizationValid = isValid;

  // Helper function to update customization options and mark as customized 
  const updateCustomizationOptions = (options: CustomizationOptions) => {
    if (setHasCustomizedAgent) {
      setHasCustomizedAgent(true);
    }
    setCustomizationOptions(options);
  };

  // Reset function 
  const resetCustomizationToDefaults = () => {
    setCustomizationOptions(initialCustomizationRef.current);
  };

  // Apply preset function 
  const applyCustomizationPreset = (preset: "Balanced" | "Momentum" | "Meme Rush" | "Defensive") => {
    // Mark that user has customized their agent
    if (setHasCustomizedAgent) {
      setHasCustomizedAgent(true);
    }

    if (preset === "Balanced") {
      setCustomizationOptions({
        r_last6h_pct: 60,
        d_pct_mktvol_6h: 65,
        d_pct_socvol_6h: 55,
        d_pct_sent_6h: 50,
        d_pct_users_6h: 45,
        d_pct_infl_6h: 50,
        d_galaxy_6h: 60,
        neg_d_altrank_6h: 55,
      });
    } else if (preset === "Momentum") {
      setCustomizationOptions({
        r_last6h_pct: 80,
        d_pct_mktvol_6h: 75,
        d_pct_socvol_6h: 40,
        d_pct_sent_6h: 45,
        d_pct_users_6h: 35,
        d_pct_infl_6h: 40,
        d_galaxy_6h: 65,
        neg_d_altrank_6h: 70,
      });
    } else if (preset === "Meme Rush") {
      setCustomizationOptions({
        r_last6h_pct: 45,
        d_pct_mktvol_6h: 50,
        d_pct_socvol_6h: 85,
        d_pct_sent_6h: 80,
        d_pct_users_6h: 75,
        d_pct_infl_6h: 80,
        d_galaxy_6h: 40,
        neg_d_altrank_6h: 60,
      });
    } else if (preset === "Defensive") {
      setCustomizationOptions({
        r_last6h_pct: 50,
        d_pct_mktvol_6h: 70,
        d_pct_socvol_6h: 40,
        d_pct_sent_6h: 35,
        d_pct_users_6h: 55,
        d_pct_infl_6h: 35,
        d_galaxy_6h: 85,
        neg_d_altrank_6h: 65,
      });
    }
  };

  // API call to save agent configuration
  const saveAgentConfig = async () => {
    if (!session?.user?.id) {
      toast.error("Please login to save your agent configuration", {
        position: "top-center",
      });
      return false;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/update-agent-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          twitterId: session.user.id,
          agentConfig: customizationOptions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to save agent configuration");
      }

      toast.success("Agent configuration saved successfully!", {
        position: "top-center",
      });

      if (setHasCustomizedAgent) {
        setHasCustomizedAgent(true);
      }

      if (onSaved) {
        try {
          onSaved();
        } catch (_) {
          // no-op
        }
      }

      return true;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save agent configuration",
        {
          position: "top-center",
        }
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-leagueSpartan">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onClose()}
      />
      <div className="relative z-50 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl bg-gray-900 shadow-2xl border border-blue-500/30 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 px-6 py-4 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">Customize Agent</h3>
              <p className="text-gray-300 text-sm mt-1">Set percentage change thresholds for when your agent should send trading signals</p>
            </div>
            <button
              onClick={() => onClose()}
              className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800/50 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="mt-3 text-right">
            <button
              onClick={() => {
                // Reset to initial values and mark as not customized
                setCustomizationOptions(initialCustomizationRef.current);
                if (setHasCustomizedAgent) {
                  setHasCustomizedAgent(false);
                }
                onSkip();
              }}
              className="text-sm text-gray-300 hover:text-white underline-offset-2 hover:underline"
            >
              I'll do it later
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700/50 bg-gray-800/30">
          <button
            onClick={() => setActiveTab("metrics")}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${activeTab === "metrics"
              ? "text-white border-b-2 border-blue-500 bg-blue-500/10"
              : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}
          >
            Agent Metrics
          </button>
          <button
            onClick={() => setActiveTab("presets")}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${activeTab === "presets"
              ? "text-white border-b-2 border-purple-500 bg-purple-500/10"
              : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}
          >
            Agent Presets
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row flex-1 min-h-0">
          {/* Left Panel - Metrics */}
          {(activeTab === "metrics") ? (
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
                      <p className="text-xs text-gray-400">6-hour price movement weight (0% - 100%)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-400">{customizationOptions.r_last6h_pct}%</div>
                    <div className="text-xs text-gray-500">Weight</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={customizationOptions.r_last6h_pct}
                      onChange={(e) => updateCustomizationOptions({
                        ...customizationOptions,
                        r_last6h_pct: parseInt(e.target.value)
                      })}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-enhanced"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${customizationOptions.r_last6h_pct}%, #6b7280 ${customizationOptions.r_last6h_pct}%, #6b7280 100%)`
                      }}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={customizationOptions.r_last6h_pct}
                      onChange={(e) => updateCustomizationOptions({
                        ...customizationOptions,
                        r_last6h_pct: Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                      })}
                      className="w-16 px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-white text-center focus:outline-none focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0%</span>
                    <span className="text-blue-400">Medium: 25%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* Market Volume */}
              <div className="bg-gradient-to-r from-green-900/20 to-green-800/10 border border-green-500/30 rounded-lg p-4 hover:border-green-500/50 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Market Volume</h4>
                      <p className="text-xs text-gray-400">Trading volume change weight (0% - 100%)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400">{customizationOptions.d_pct_mktvol_6h}%</div>
                    <div className="text-xs text-gray-500">Weight</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={customizationOptions.d_pct_mktvol_6h}
                      onChange={(e) => updateCustomizationOptions({
                        ...customizationOptions,
                        d_pct_mktvol_6h: parseInt(e.target.value)
                      })}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-enhanced"
                      style={{
                        background: `linear-gradient(to right, #10b981 0%, #10b981 ${customizationOptions.d_pct_mktvol_6h}%, #6b7280 ${customizationOptions.d_pct_mktvol_6h}%, #6b7280 100%)`
                      }}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={customizationOptions.d_pct_mktvol_6h}
                      onChange={(e) => updateCustomizationOptions({
                        ...customizationOptions,
                        d_pct_mktvol_6h: Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                      })}
                      className="w-16 px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-white text-center focus:outline-none focus:border-green-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0%</span>
                    <span className="text-green-400">Medium: 30%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* Social Volume */}
              <div className="bg-gradient-to-r from-purple-900/20 to-purple-800/10 border border-purple-500/30 rounded-lg p-4 hover:border-purple-500/50 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Social Volume</h4>
                      <p className="text-xs text-gray-400">Social mentions weight (0% - 100%)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-400">{customizationOptions.d_pct_socvol_6h}%</div>
                    <div className="text-xs text-gray-500">Weight</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={customizationOptions.d_pct_socvol_6h}
                      onChange={(e) => updateCustomizationOptions({
                        ...customizationOptions,
                        d_pct_socvol_6h: parseInt(e.target.value)
                      })}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-enhanced"
                      style={{
                        background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${customizationOptions.d_pct_socvol_6h}%, #6b7280 ${customizationOptions.d_pct_socvol_6h}%, #6b7280 100%)`
                      }}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={customizationOptions.d_pct_socvol_6h}
                      onChange={(e) => updateCustomizationOptions({
                        ...customizationOptions,
                        d_pct_socvol_6h: Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                      })}
                      className="w-16 px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-white text-center focus:outline-none focus:border-purple-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0%</span>
                    <span className="text-purple-400">Medium: 20%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* Sentiment */}
              <div className="bg-gradient-to-r from-yellow-900/20 to-yellow-800/10 border border-yellow-500/30 rounded-lg p-4 hover:border-yellow-500/50 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Sentiment</h4>
                      <p className="text-xs text-gray-400">Market sentiment weight (0% - 100%)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-yellow-400">{customizationOptions.d_pct_sent_6h}%</div>
                    <div className="text-xs text-gray-500">Weight</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={customizationOptions.d_pct_sent_6h}
                      onChange={(e) => updateCustomizationOptions({
                        ...customizationOptions,
                        d_pct_sent_6h: parseInt(e.target.value)
                      })}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-enhanced"
                      style={{
                        background: `linear-gradient(to right, #eab308 0%, #eab308 ${customizationOptions.d_pct_sent_6h}%, #6b7280 ${customizationOptions.d_pct_sent_6h}%, #6b7280 100%)`
                      }}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={customizationOptions.d_pct_sent_6h}
                      onChange={(e) => updateCustomizationOptions({
                        ...customizationOptions,
                        d_pct_sent_6h: Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                      })}
                      className="w-16 px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-white text-center focus:outline-none focus:border-yellow-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0%</span>
                    <span className="text-yellow-400">Medium: 15%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* User Growth */}
              <div className="bg-gradient-to-r from-cyan-900/20 to-cyan-800/10 border border-cyan-500/30 rounded-lg p-4 hover:border-cyan-500/50 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-medium">User Growth</h4>
                      <p className="text-xs text-gray-400">Community growth weight (0% - 100%)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-cyan-400">{customizationOptions.d_pct_users_6h}%</div>
                    <div className="text-xs text-gray-500">Weight</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={customizationOptions.d_pct_users_6h}
                      onChange={(e) => updateCustomizationOptions({
                        ...customizationOptions,
                        d_pct_users_6h: parseInt(e.target.value)
                      })}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-enhanced"
                      style={{
                        background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${customizationOptions.d_pct_users_6h}%, #6b7280 ${customizationOptions.d_pct_users_6h}%, #6b7280 100%)`
                      }}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={customizationOptions.d_pct_users_6h}
                      onChange={(e) => updateCustomizationOptions({
                        ...customizationOptions,
                        d_pct_users_6h: Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                      })}
                      className="w-16 px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-white text-center focus:outline-none focus:border-cyan-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0%</span>
                    <span className="text-cyan-400">Medium: 10%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* Influencers */}
              <div className="bg-gradient-to-r from-pink-900/20 to-pink-800/10 border border-pink-500/30 rounded-lg p-4 hover:border-pink-500/50 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Influencers</h4>
                      <p className="text-xs text-gray-400">Influencer mentions weight (0% - 100%)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-pink-400">{customizationOptions.d_pct_infl_6h}%</div>
                    <div className="text-xs text-gray-500">Weight</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={customizationOptions.d_pct_infl_6h}
                      onChange={(e) => updateCustomizationOptions({
                        ...customizationOptions,
                        d_pct_infl_6h: parseInt(e.target.value)
                      })}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-enhanced"
                      style={{
                        background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${customizationOptions.d_pct_infl_6h}%, #6b7280 ${customizationOptions.d_pct_infl_6h}%, #6b7280 100%)`
                      }}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={customizationOptions.d_pct_infl_6h}
                      onChange={(e) => updateCustomizationOptions({
                        ...customizationOptions,
                        d_pct_infl_6h: Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                      })}
                      className="w-16 px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-white text-center focus:outline-none focus:border-pink-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0%</span>
                    <span className="text-pink-400">Medium: 15%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* Heartbeat Score */}
              <div className="bg-gradient-to-r from-indigo-900/20 to-indigo-800/10 border border-indigo-500/30 rounded-lg p-4 hover:border-indigo-500/50 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Heartbeat Score</h4>
                      <p className="text-xs text-gray-400">Composite health weight (0% - 100%)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-indigo-400">{customizationOptions.d_galaxy_6h}%</div>
                    <div className="text-xs text-gray-500">Weight</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={customizationOptions.d_galaxy_6h}
                      onChange={(e) => updateCustomizationOptions({
                        ...customizationOptions,
                        d_galaxy_6h: parseInt(e.target.value)
                      })}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-enhanced"
                      style={{
                        background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${customizationOptions.d_galaxy_6h}%, #6b7280 ${customizationOptions.d_galaxy_6h}%, #6b7280 100%)`
                      }}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={customizationOptions.d_galaxy_6h}
                      onChange={(e) => updateCustomizationOptions({
                        ...customizationOptions,
                        d_galaxy_6h: Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                      })}
                      className="w-16 px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-white text-center focus:outline-none focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0%</span>
                    <span className="text-indigo-400">Medium: 25%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* Market Edge */}
              <div className="bg-gradient-to-r from-orange-900/20 to-orange-800/10 border border-orange-500/30 rounded-lg p-4 hover:border-orange-500/50 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Market Edge</h4>
                      <p className="text-xs text-gray-400">Relative ranking weight (0% - 100%)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-orange-400">{customizationOptions.neg_d_altrank_6h}%</div>
                    <div className="text-xs text-gray-500">Weight</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={customizationOptions.neg_d_altrank_6h}
                      onChange={(e) => updateCustomizationOptions({
                        ...customizationOptions,
                        neg_d_altrank_6h: parseInt(e.target.value)
                      })}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-enhanced"
                      style={{
                        background: `linear-gradient(to right, #f97316 0%, #f97316 ${customizationOptions.neg_d_altrank_6h}%, #6b7280 ${customizationOptions.neg_d_altrank_6h}%, #6b7280 100%)`
                      }}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={customizationOptions.neg_d_altrank_6h}
                      onChange={(e) => updateCustomizationOptions({
                        ...customizationOptions,
                        neg_d_altrank_6h: Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                      })}
                      className="w-16 px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-white text-center focus:outline-none focus:border-orange-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0%</span>
                    <span className="text-orange-400">Medium: 20%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === "presets" ? (
            <div className="w-full lg:w-1/2 border-r border-gray-700/50 overflow-y-auto p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Quick Strategy Presets</h3>
                <p className="text-sm text-gray-400">Choose a pre-configured strategy to get started quickly</p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => applyCustomizationPreset("Balanced")}
                  className="w-full text-left p-5 rounded-lg border border-gray-700/50 bg-gradient-to-r from-blue-900/20 to-blue-800/10 hover:border-blue-500/50 hover:from-blue-900/30 hover:to-blue-800/20 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-semibold text-lg">🎯 Balanced</h4>
                    <div className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">Recommended</div>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">Balanced approach with moderate weights across all signals. Ideal default for most market conditions.</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <span>Price: 60% • Volume: 65% • Social: 55% • Heartbeat: 60%</span>
                  </div>
                </button>

                <button
                  onClick={() => applyCustomizationPreset("Momentum")}
                  className="w-full text-left p-5 rounded-lg border border-gray-700/50 bg-gradient-to-r from-green-900/20 to-green-800/10 hover:border-green-500/50 hover:from-green-900/30 hover:to-green-800/20 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-semibold text-lg">🚀 Momentum</h4>
                    <div className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">Trending</div>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">Emphasizes price action and volume. Perfect for trending markets and technical breakouts.</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <span>Price: 80% • Volume: 75% • Market Edge: 70%</span>
                  </div>
                </button>

                <button
                  onClick={() => applyCustomizationPreset("Meme Rush")}
                  className="w-full text-left p-5 rounded-lg border border-gray-700/50 bg-gradient-to-r from-purple-900/20 to-purple-800/10 hover:border-purple-500/50 hover:from-purple-900/30 hover:to-purple-800/20 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-semibold text-lg">🔥 Meme Rush</h4>
                    <div className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded">Social</div>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">Prioritizes social signals and community buzz. Perfect for catching viral meme coin runs.</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <span>Social: 85% • Sentiment: 80% • Influencers: 80%</span>
                  </div>
                </button>

                <button
                  onClick={() => applyCustomizationPreset("Defensive")}
                  className="w-full text-left p-5 rounded-lg border border-gray-700/50 bg-gradient-to-r from-amber-900/20 to-amber-800/10 hover:border-amber-500/50 hover:from-amber-900/30 hover:to-amber-800/20 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-semibold text-lg">🛡️ Defensive</h4>
                    <div className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded">Safe</div>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">Conservative approach focusing on fundamental strength. Reduces noise in volatile markets.</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <span>Volume: 70% • Heartbeat: 85% • Market Edge: 65%</span>
                  </div>
                </button>
              </div>

              <div className="mt-6 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                <p className="text-xs text-gray-400">
                  💡 <strong>Tip:</strong> After selecting a preset, switch to "Agent Metrics" tab to fine-tune individual thresholds.
                </p>
              </div>
            </div>
          ) : null}

          {/* Details / Preview Panel */}
          <div className="w-full lg:w-1/2 bg-gray-800/20 p-6 overflow-y-auto border-t lg:border-t-0 lg:border-r border-gray-700/50">
            {/* Agent Preview Summary */}
            <div className="mb-6 bg-gradient-to-r from-emerald-900/20 to-emerald-800/10 rounded-lg p-4 border border-emerald-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Signal Threshold Profile</h4>
                  <p className="text-sm text-gray-400 mt-1">Your agent will send signals when these thresholds are met</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Validity</p>
                  <p className={`text-sm font-semibold ${isCustomizationValid ? "text-emerald-400" : "text-red-400"}`}>{isCustomizationValid ? "Valid" : "Check ranges"}</p>
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
                  <span className="text-gray-300">Heartbeat Score</span>
                  <span className="text-indigo-400 font-medium">{customizationOptions.d_galaxy_6h}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Market Edge</span>
                  <span className="text-orange-400 font-medium">{customizationOptions.neg_d_altrank_6h}%</span>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-400">
                <span className="mr-2">Status:</span>
                <span className={`${customizationOptions.d_pct_socvol_6h + customizationOptions.d_pct_sent_6h + customizationOptions.d_pct_infl_6h > customizationOptions.r_last6h_pct + customizationOptions.d_pct_mktvol_6h ? "text-purple-300" : "text-green-300"}`}>
                  {customizationOptions.d_pct_socvol_6h + customizationOptions.d_pct_sent_6h + customizationOptions.d_pct_infl_6h > customizationOptions.r_last6h_pct + customizationOptions.d_pct_mktvol_6h ? "Social-driven" : "Price/Volume-driven"}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/10 rounded-lg p-4 border border-blue-500/30">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How It Works
                </h4>
                <div className="text-sm text-gray-300 space-y-2">
                  <p>Each signal measures different aspects of market activity over the last 6 hours:</p>
                  <ul className="space-y-1 ml-4">
                    <li><span className="text-blue-400">•</span> <strong>Price & Volume:</strong> Technical momentum</li>
                    <li><span className="text-purple-400">•</span> <strong>Social & Sentiment:</strong> Community buzz</li>
                    <li><span className="text-indigo-400">•</span> <strong>Galaxy & AltRank:</strong> Overall health</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-900/20 to-green-800/10 rounded-lg p-4 border border-green-500/30">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Quick Tips
                </h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1 text-xs">✓</span>
                    <span>Use <strong>number inputs</strong> for precise control</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1 text-xs">✓</span>
                    <span>Try <strong>Agent Presets</strong> for instant setups</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1 text-xs">✓</span>
                    <span>Higher thresholds = fewer but stronger signals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1 text-xs">✓</span>
                    <span>All metrics use 0-100% weightage scale for consistency</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700/50 p-4 bg-gray-800/30">
          <div className="flex gap-3">
            <button
              onClick={resetCustomizationToDefaults}
              className="px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              Reset
            </button>
            <button
              onClick={() => onClose()}
              className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-gray-600 px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800"
            >
              <span>Cancel</span>
            </button>
            <button
              onClick={async () => {
                if (validateCustomizationOptions(customizationOptions)) {
                  if (isOnboardingFlow) {
                    // Onboarding flow: continue to telegram connection
                    onContinue();
                  } else {
                    // Regular usage: save agent config via API
                    const success = await saveAgentConfig();
                    if (success) {
                      onClose(); // Close modal after successful save
                    }
                  }
                }
              }}
              disabled={!isCustomizationValid || isSaving}
              className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium flex items-center justify-center gap-1 transition-all ${isCustomizationValid && !isSaving
                ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
                }`}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>{isOnboardingFlow ? "Create Agent & Continue" : "Create Agent"}</span>
                  {isCustomizationValid && !isSaving && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizeAgentModal;


