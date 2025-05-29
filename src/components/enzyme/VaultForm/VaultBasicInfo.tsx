import React from "react";
import { VaultConfig } from "../types";

interface VaultBasicInfoProps {
  vaultConfig: VaultConfig;
  networkConfig: any;
  onConfigChange: (field: keyof VaultConfig, value: string) => void;
}

const VaultBasicInfo: React.FC<VaultBasicInfoProps> = ({
  vaultConfig,
  networkConfig,
  onConfigChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
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
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-[#E4EFFF]">
          Vault Information
        </h2>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#AAC9FA] mb-2">
            Vault Name *
          </label>
          <input
            type="text"
            value={vaultConfig.name}
            onChange={(e) => onConfigChange("name", e.target.value)}
            placeholder="e.g., DeFi Growth Fund"
            className="w-full px-4 py-3 bg-[#0D1321] border border-[#353940] rounded-lg 
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                     transition-all duration-200 text-white placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#AAC9FA] mb-2">
            Vault Symbol *
          </label>
          <input
            type="text"
            value={vaultConfig.symbol}
            onChange={(e) =>
              onConfigChange("symbol", e.target.value.toUpperCase())
            }
            placeholder="e.g., DGF"
            maxLength={10}
            className="w-full px-4 py-3 bg-[#0D1321] border border-[#353940] rounded-lg 
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                     transition-all duration-200 text-white placeholder-gray-400"
          />
          <p className="text-xs text-gray-400 mt-1">Maximum 10 characters</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#AAC9FA] mb-2">
            Denomination Asset *
          </label>
          <select
            value={vaultConfig.denominationAsset}
            onChange={(e) =>
              onConfigChange("denominationAsset", e.target.value)
            }
            className="w-full px-4 py-3 bg-[#0D1321] border border-[#353940] rounded-lg 
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                     transition-all duration-200 text-white"
          >
            {networkConfig &&
              Object.entries(networkConfig.assets).map(([symbol, address]) => (
                <option key={symbol} value={address as string}>
                  {symbol}
                </option>
              ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            The base currency for deposits and performance tracking
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#AAC9FA] mb-2">
            Shares Action Timelock (hours)
          </label>
          <input
            type="number"
            value={vaultConfig.sharesActionTimelock}
            onChange={(e) =>
              onConfigChange("sharesActionTimelock", e.target.value)
            }
            placeholder="24"
            min="1"
            max="8760"
            className="w-full px-4 py-3 bg-[#0D1321] border border-[#353940] rounded-lg 
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                     transition-all duration-200 text-white placeholder-gray-400"
          />
          <p className="text-xs text-gray-400 mt-1">
            Minimum waiting time between share actions for security
          </p>
        </div>
      </div>
    </div>
  );
};

export default VaultBasicInfo;
