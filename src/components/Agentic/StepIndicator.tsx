"use client";

import React from 'react';
import { CheckCircle } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex justify-center mb-8">
      <div className="flex items-center space-x-4">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStep > index + 1
              ? 'bg-green-500 border-green-500 text-white'
              : currentStep === index + 1
                ? 'bg-gradient-to-r from-indigo-400 to-purple-600 border-transparent text-white'
                : 'bg-gray-700 border-gray-600 text-gray-400'
              }`}>
              {currentStep > index + 1 ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <span className="font-semibold">{index + 1}</span>
              )}
            </div>
            {index < totalSteps - 1 && (
              <div className={`w-16 h-0.5 mx-2 ${currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-600'
                }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};


