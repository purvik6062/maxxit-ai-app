import React from "react";
import { VaultCreationStep } from "./types";

interface VaultCreationStepperProps {
  steps: VaultCreationStep[];
}

const VaultCreationStepper: React.FC<VaultCreationStepperProps> = ({
  steps,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.step} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300
                  ${
                    step.completed
                      ? "bg-green-500 border-green-500 text-white"
                      : step.current
                      ? "bg-blue-500 border-blue-500 text-white"
                      : "bg-[#0D1321] border-[#353940] text-[#8ba1bc]"
                  }
                `}
              >
                {step.completed ? (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  step.step
                )}
              </div>

              {/* Step Info */}
              <div className="ml-4 min-w-0 flex-1">
                <div
                  className={`
                    text-sm font-medium transition-colors duration-300
                    ${
                      step.current
                        ? "text-[#E4EFFF]"
                        : step.completed
                        ? "text-green-400"
                        : "text-[#8ba1bc]"
                    }
                  `}
                >
                  {step.title}
                </div>
                <div
                  className={`
                    text-xs mt-1 transition-colors duration-300
                    ${
                      step.current
                        ? "text-[#AAC9FA]"
                        : step.completed
                        ? "text-green-300"
                        : "text-[#6b7280]"
                    }
                  `}
                >
                  {step.description}
                </div>
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-4">
                <div
                  className={`
                    h-0.5 transition-colors duration-300
                    ${
                      steps[index + 1].completed || steps[index + 1].current
                        ? "bg-blue-500"
                        : "bg-[#353940]"
                    }
                  `}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VaultCreationStepper;
