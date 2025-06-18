import React from "react";

const UnsupportedNetworkModal: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#0D1321] rounded-2xl border border-[#353940] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-b border-[#253040] p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#E4EFFF] mb-2">
            Unsupported Network
          </h2>
          <p className="text-[#8ba1bc]">
            Please switch to a supported network to create an Enzyme vault
          </p>
        </div>

        <div className="p-8">
          {/* Supported Networks */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#E4EFFF] mb-4">
              Supported Networks:
            </h3>
            <div className="space-y-3">
              {[
                { name: "Ethereum", icon: "🔷" },
                { name: "Polygon", icon: "🟣" },
                { name: "Arbitrum", icon: "🔵" },
              ].map((network) => (
                <div
                  key={network.name}
                  className="flex items-center gap-3 p-3 bg-[#0A0F1A] border border-[#253040] rounded-lg"
                >
                  <span className="text-xl">{network.icon}</span>
                  <span className="text-[#AAC9FA] font-medium">
                    {network.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg">
            <h4 className="text-[#AAC9FA] font-medium mb-2 flex items-center gap-2">
              <svg
                className="w-4 h-4 text-blue-400"
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
              How to switch networks:
            </h4>
            <ul className="text-sm text-[#8ba1bc] space-y-1">
              <li>• Open your wallet (MetaMask, etc.)</li>
              <li>• Click on the network selector</li>
              <li>• Choose one of the supported networks</li>
              <li>• Refresh this page</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnsupportedNetworkModal;
