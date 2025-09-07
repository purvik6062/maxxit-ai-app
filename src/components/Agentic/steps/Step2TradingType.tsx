"use client";

import React from 'react';
import { TrendingUp, Coins } from 'lucide-react';

interface Step2TradingTypeProps {
  tradingTypes: string[];
  onToggle: (type: string) => void;
}

export const Step2TradingType: React.FC<Step2TradingTypeProps> = ({ tradingTypes, onToggle }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
      <div className="text-center mb-8">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-full flex items-center justify-center mb-6 shadow-2xl">
          <TrendingUp className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent font-napzerRounded mb-4">
          Step 2: Choose Trading Type
        </h2>
        <p className="text-gray-300 text-lg">
          Select your preferred trading strategy
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div
          className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${tradingTypes.includes('perpetuals')
            ? 'border-green-500 bg-green-500/10'
            : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
            }`}
          onClick={() => onToggle('perpetuals')}
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Perpetuals</h3>
            <p className="text-gray-300 text-sm">
              Trade with leverage on futures contracts. Higher risk, higher potential returns.
            </p>
            <ul className="text-gray-400 text-xs mt-3 space-y-1">
              <li>• Up to 100x leverage</li>
              <li>• 24/7 trading</li>
              <li>• Advanced order types</li>
            </ul>
          </div>
        </div>

        <div
          className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${tradingTypes.includes('spot')
            ? 'border-green-500 bg-green-500/10'
            : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
            }`}
          onClick={() => onToggle('spot')}
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Coins className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Spot Trading</h3>
            <p className="text-gray-300 text-sm">
              Buy and sell actual cryptocurrencies. Lower risk, stable returns.
            </p>
            <ul className="text-gray-400 text-xs mt-3 space-y-1">
              <li>• No leverage</li>
              <li>• Own the actual assets</li>
              <li>• Staking opportunities</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};


