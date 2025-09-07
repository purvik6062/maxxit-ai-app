"use client";

import React from 'react';
import { Wallet } from 'lucide-react';

interface Step4SummaryProps {
  createdSafeAddress: string | null;
  tradingTypes: string[];
  selectedTokens: string[];
  isLoadingPrefs: boolean;
  isSavingPreferences: boolean;
  hasExistingSetup: boolean;
  saveError: string | null;
  saveSuccess: boolean;
  onSave: () => void;
}

export const Step4Summary: React.FC<Step4SummaryProps> = ({
  createdSafeAddress,
  tradingTypes,
  selectedTokens,
  isLoadingPrefs,
  isSavingPreferences,
  hasExistingSetup,
  saveError,
  saveSuccess,
  onSave,
}) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
      <div className="text-center mb-8">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full flex items-center justify-center mb-6 shadow-2xl">
          <Wallet className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent font-napzerRounded mb-4">
          Step 4: Summary
        </h2>
        <p className="text-gray-300 text-lg">
          Review your selections and deployment details
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-bold text-white mb-4">Configuration Summary</h3>
          <div className="space-y-3 text-gray-300">
            <div className="flex justify-between">
              <span>Safe Address:</span>
              <span className="text-white font-semibold truncate">{createdSafeAddress || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span>Trading Types:</span>
              <span className="text-white font-semibold capitalize">{tradingTypes.join(', ')}</span>
            </div>
            <div className="flex justify-between">
              <span>Selected Tokens:</span>
              <span className="text-white font-semibold capitalize">{selectedTokens.join(', ')}</span>
            </div>
          </div>
        </div>

        <div className="text-center space-y-3">
          {isLoadingPrefs && (
            <div className="inline-flex items-center text-gray-300">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Loading saved setup...
            </div>
          )}
          {!isSavingPreferences && saveError && (
            <div className="text-red-400 font-semibold">{saveError}</div>
          )}
          <button
            onClick={onSave}
            disabled={
              isSavingPreferences ||
              !createdSafeAddress ||
              tradingTypes.length === 0 ||
              selectedTokens.length === 0
            }
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${isSavingPreferences || !createdSafeAddress || tradingTypes.length === 0 || selectedTokens.length === 0
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow'
              }`}
          >
            {isSavingPreferences ? 'Saving...' : (hasExistingSetup ? 'Update' : 'Save')}
          </button>

          {saveSuccess && (
            <div className="text-green-400 font-semibold">
              Preferences saved successfully!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


