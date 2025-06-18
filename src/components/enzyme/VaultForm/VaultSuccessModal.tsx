import React from "react";
import { VaultConfig } from "../types";

interface VaultSuccessModalProps {
  createdVault: {
    comptrollerProxy: string;
    vaultProxy: string;
    txHash: string;
  };
  vaultConfig: VaultConfig;
  networkConfig: any;
  onCreateAnother: () => void;
  getDenominationAssetName: (address: string) => string;
}

const VaultSuccessModal: React.FC<VaultSuccessModalProps> = ({
  createdVault,
  vaultConfig,
  networkConfig,
  onCreateAnother,
  getDenominationAssetName,
}) => {
  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-[#0D1321] rounded-2xl border border-[#353940] shadow-2xl overflow-hidden">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-b border-[#253040] p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#E4EFFF] mb-2">
            Vault Created Successfully!
          </h2>
          <p className="text-[#8ba1bc]">
            Your Enzyme vault is now live and ready for investments.
          </p>
        </div>

        <div className="p-8 space-y-6">
          {/* Vault Details */}
          <div className="bg-[#0A0F1A] border border-[#253040] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-[#E4EFFF] mb-4 flex items-center gap-2">
              <div className="w-5 h-5 bg-blue-500 rounded-md flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
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
              Vault Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-[#8ba1bc] uppercase tracking-wide">
                  Name
                </p>
                <p className="text-[#AAC9FA] font-medium">{vaultConfig.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-[#8ba1bc] uppercase tracking-wide">
                  Symbol
                </p>
                <p className="text-[#AAC9FA] font-medium">
                  {vaultConfig.symbol}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-[#8ba1bc] uppercase tracking-wide">
                  Base Asset
                </p>
                <p className="text-[#AAC9FA] font-medium">
                  {getDenominationAssetName(vaultConfig.denominationAsset)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-[#8ba1bc] uppercase tracking-wide">
                  Network
                </p>
                <p className="text-[#AAC9FA] font-medium">
                  {networkConfig?.name}
                </p>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="bg-[#0A0F1A] border border-[#253040] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-[#E4EFFF] mb-4 flex items-center gap-2">
              <div className="w-5 h-5 bg-green-500 rounded-md flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
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
              Transaction Details
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-[#8ba1bc] uppercase tracking-wide mb-1">
                  Transaction Hash
                </p>
                <a
                  href={`${networkConfig?.explorer}/tx/${createdVault.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 font-mono text-sm break-all 
                           underline decoration-dotted underline-offset-2 transition-colors duration-200"
                >
                  {createdVault.txHash}
                </a>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onCreateAnother}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 
                     text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 
                     transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Create Another Vault
          </button>
        </div>
      </div>
    </div>
  );
};

export default VaultSuccessModal;
