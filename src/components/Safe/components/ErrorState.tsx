import React from "react";
import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  title: string;
  error: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ title, error, onRetry }) => (
  <div className="rounded-xl border border-red-500/30 bg-gradient-to-br from-red-900/20 to-gray-900/40 backdrop-blur-sm p-8 mb-8">
    <div className="text-center">
      <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
      <h3 className="text-2xl font-bold text-white mb-3 font-leagueSpartan">
        {title}
      </h3>
      <p className="text-red-300 text-lg mb-6">{error}</p>
      <button
        onClick={onRetry}
        className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-lg font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        Retry Connection
      </button>
    </div>
  </div>
); 