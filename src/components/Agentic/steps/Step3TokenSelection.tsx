"use client";

import React from 'react';
import { Coins } from 'lucide-react';
import { TOKENS } from "@/components/Agentic/tokens";

interface Step3TokenSelectionProps {
  selectedTokens: string[];
  onToggleToken: (tokenId: string) => void;
}

export const Step3TokenSelection: React.FC<Step3TokenSelectionProps> = ({ selectedTokens, onToggleToken }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
      <div className="text-center mb-8">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full flex items-center justify-center mb-6 shadow-2xl">
          <Coins className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent font-napzerRounded mb-4">
          Step 3: Select Tokens
        </h2>
        <p className="text-gray-300 text-lg">
          Choose the tokens you want to trade with
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {TOKENS.map((token) => (
              <div
                key={token.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-300 ${selectedTokens.includes(token.id)
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                  }`}
                onClick={() => onToggleToken(token.id)}
              >
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{token.symbol}</div>
                  <div className="text-xs text-gray-400">{token.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedTokens.length > 0 && (
        <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
          <h4 className="text-white font-semibold mb-2">Selected Tokens ({selectedTokens.length}):</h4>
          <div className="flex flex-wrap gap-2">
            {selectedTokens.map((tokenId) => {
              const token = [...TOKENS].find(t => t.id === tokenId);
              return (
                <span key={tokenId} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                  {token?.symbol}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};


