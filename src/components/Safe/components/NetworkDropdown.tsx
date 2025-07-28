import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Network {
  key: string;
  name: string;
  icon: string;
  type: string;
  chainId: number;
}

interface NetworkDropdownProps {
  networks: Network[];
  selectedNetwork: string;
  onSelect: (networkKey: string) => void;
  placeholder?: string;
}

export const NetworkDropdown: React.FC<NetworkDropdownProps> = ({
  networks,
  selectedNetwork,
  onSelect,
  placeholder = "Select a network"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedNetworkData = networks.find(n => n.key === selectedNetwork);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-800/70 border border-gray-600/70 rounded-lg hover:border-gray-500/70 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          {selectedNetworkData ? (
            <>
              <span className="text-xl">{selectedNetworkData.icon}</span>
              <div>
                <div className="font-semibold text-white text-sm">{selectedNetworkData.name}</div>
                <div className="text-xs text-gray-400">Chain ID: {selectedNetworkData.chainId}</div>
              </div>
            </>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
          {networks.map((network) => (
            <button
              key={network.key}
              onClick={() => {
                onSelect(network.key);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700/70 transition-colors text-left border-b border-gray-700/50 last:border-b-0"
            >
              <span className="text-xl">{network.icon}</span>
              <div className="flex-1">
                <div className="font-semibold text-white text-sm">{network.name}</div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-400">Chain ID: {network.chainId}</div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${network.type === 'Mainnet' ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                    {network.type}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}; 