import React from "react";

interface NetworkBadgeProps {
  name: string;
  chainId: number;
  type: string;
  features: string[];
}

export const NetworkBadge: React.FC<NetworkBadgeProps> = ({
  name,
  chainId,
  type,
  features
}) => (
  <div className="p-4 rounded-lg bg-gray-800/70 border border-gray-700/70">
    <div className="flex items-center justify-between mb-2">
      <h4 className="font-semibold text-white text-sm">{name}</h4>
      <span className={`px-2 py-1 rounded text-xs font-medium ${type === 'Mainnet' ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'
        }`}>
        {type}
      </span>
    </div>
    <div className="text-xs text-gray-400 mb-2">Chain ID: {chainId}</div>
    <div className="flex flex-wrap gap-1">
      {features.slice(0, 2).map((feature, idx) => (
        <span key={idx} className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 text-xs">
          {feature}
        </span>
      ))}
    </div>
  </div>
); 