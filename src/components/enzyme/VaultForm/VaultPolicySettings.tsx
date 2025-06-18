import React from "react";
import { VaultConfig } from "../types";

interface VaultPolicySettingsProps {
  vaultConfig: VaultConfig;
  account: string | null;
  onConfigChange: (field: keyof VaultConfig, value: string) => void;
}

const VaultPolicySettings: React.FC<VaultPolicySettingsProps> = ({
  vaultConfig,
  account,
  onConfigChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-[#E4EFFF]">
          Policy Configuration
        </h2>
      </div>

      <div className="space-y-5">
        <div className="bg-[#0A0F1A] border border-[#253040] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[#AAC9FA] font-medium">Enable Policies</h3>
              <p className="text-xs text-gray-400 mt-1">
                Add additional security and restrictions
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={vaultConfig.includePolicies}
                onChange={(e) =>
                  onConfigChange("includePolicies", e.target.checked.toString())
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>

        {vaultConfig.includePolicies && (
          <div className="space-y-4 transform transition-all duration-300 ease-in-out opacity-100 translate-y-0">
            <div className="bg-[#0A0F1A] border border-[#253040] rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-[#AAC9FA] font-medium">
                    Allowed Depositors Policy
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Restrict deposits to specific addresses
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vaultConfig.allowedDepositorsOnly}
                    onChange={(e) =>
                      onConfigChange(
                        "allowedDepositorsOnly",
                        e.target.checked.toString()
                      )
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {vaultConfig.allowedDepositorsOnly && (
                <div className="mt-4 transform transition-all duration-200 ease-in-out opacity-100 translate-y-0">
                  <label className="block text-sm font-medium text-[#AAC9FA] mb-2">
                    Allowed Depositor Addresses
                  </label>
                  <textarea
                    value={vaultConfig.allowedDepositors}
                    onChange={(e) =>
                      onConfigChange("allowedDepositors", e.target.value)
                    }
                    placeholder="0x123..., 0x456... (comma-separated)"
                    rows={3}
                    className="w-full px-4 py-3 bg-[#0D1321] border border-[#353940] rounded-lg 
                             focus:ring-2 focus:ring-purple-500 focus:border-transparent 
                             transition-all duration-200 text-white placeholder-gray-400 resize-none"
                  />
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <span className="w-1 h-1 bg-cyan-400 rounded-full"></span>
                      Enter Ethereum addresses separated by commas
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <span className="w-1 h-1 bg-cyan-400 rounded-full"></span>
                      Your wallet address ({account}) will automatically be
                      included
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <span className="w-1 h-1 bg-cyan-400 rounded-full"></span>
                      Leave empty to allow only the vault owner to deposit
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VaultPolicySettings;
