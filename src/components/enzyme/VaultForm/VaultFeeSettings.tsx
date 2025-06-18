import React from "react";
import { VaultConfig } from "../types";

interface VaultFeeSettingsProps {
  vaultConfig: VaultConfig;
  onConfigChange: (field: keyof VaultConfig, value: string) => void;
}

const VaultFeeSettings: React.FC<VaultFeeSettingsProps> = ({
  vaultConfig,
  onConfigChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-[#E4EFFF]">
          Fee Configuration
        </h2>
      </div>

      <div className="space-y-5">
        <div className="bg-[#0A0F1A] border border-[#253040] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[#AAC9FA] font-medium">Enable Fees</h3>
              <p className="text-xs text-gray-400 mt-1">
                Charge management and performance fees
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={vaultConfig.includeFees}
                onChange={(e) =>
                  onConfigChange("includeFees", e.target.checked.toString())
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {vaultConfig.includeFees && (
          <div className="space-y-4 transform transition-all duration-300 ease-in-out opacity-100 translate-y-0">
            <div className="bg-[#0A0F1A] border border-[#253040] rounded-lg p-4">
              <label className="block text-sm font-medium text-[#AAC9FA] mb-2">
                Management Fee Rate (% annually)
              </label>
              <input
                type="number"
                value={vaultConfig.managementFeeRate}
                onChange={(e) =>
                  onConfigChange("managementFeeRate", e.target.value)
                }
                placeholder="1"
                min="0"
                max="100"
                step="0.1"
                className="w-full px-4 py-3 bg-[#0D1321] border border-[#353940] rounded-lg 
                         focus:ring-2 focus:ring-green-500 focus:border-transparent 
                         transition-all duration-200 text-white placeholder-gray-400"
              />
              <p className="text-xs text-gray-400 mt-1">
                Annual fee charged on total vault assets
              </p>
            </div>

            <div className="bg-[#0A0F1A] border border-[#253040] rounded-lg p-4">
              <label className="block text-sm font-medium text-[#AAC9FA] mb-2">
                Performance Fee Rate (%)
              </label>
              <input
                type="number"
                value={vaultConfig.performanceFeeRate}
                onChange={(e) =>
                  onConfigChange("performanceFeeRate", e.target.value)
                }
                placeholder="10"
                min="0"
                max="100"
                step="0.1"
                className="w-full px-4 py-3 bg-[#0D1321] border border-[#353940] rounded-lg 
                         focus:ring-2 focus:ring-green-500 focus:border-transparent 
                         transition-all duration-200 text-white placeholder-gray-400"
              />
              <p className="text-xs text-gray-400 mt-1">
                Fee charged on gains above high water mark
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VaultFeeSettings;
