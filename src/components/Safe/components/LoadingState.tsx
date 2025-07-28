import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  title: string;
  description: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ title, description }) => (
  <div className="rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-900/20 to-gray-900/40 backdrop-blur-sm p-8 mb-8">
    <div className="text-center">
      <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-indigo-400" />
      <h3 className="text-2xl font-bold text-white mb-3 font-leagueSpartan">
        {title}
      </h3>
      <p className="text-gray-300 text-lg">
        {description}
      </p>
    </div>
  </div>
); 