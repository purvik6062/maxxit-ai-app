"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { X, OctagonAlert, CheckCircle2 } from "lucide-react";
import { FaTelegram } from "react-icons/fa6";
import { IoShieldCheckmark } from "react-icons/io5";
import Link from "next/link";
import CustomizeAgentModal from "./CustomizeAgentModal";

// Custom CSS for enhanced sliders
const sliderStyles = `
  .slider-enhanced {
    -webkit-appearance: none;
    appearance: none;
  }
  
  .slider-enhanced::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #ffffff;
    cursor: pointer;
    border: 2px solid #3b82f6;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    transition: all 0.2s ease;
  }
  
  .slider-enhanced::-webkit-slider-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  }
  
  .slider-enhanced::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #ffffff;
    cursor: pointer;
    border: 2px solid #3b82f6;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    transition: all 0.2s ease;
  }
  
  .slider-enhanced::-moz-range-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.getElementById('slider-styles') || document.createElement('style');
  styleElement.id = 'slider-styles';
  styleElement.textContent = sliderStyles;
  if (!document.getElementById('slider-styles')) {
    document.head.appendChild(styleElement);
  }
}

interface CustomizationOptions {
  r_last6h_pct: number;
  d_pct_mktvol_6h: number;
  d_pct_socvol_6h: number;
  d_pct_sent_6h: number;
  d_pct_users_6h: number;
  d_pct_infl_6h: number;
  d_galaxy_6h: number;
  neg_d_altrank_6h: number;
}

export type { CustomizationOptions };

interface OnboardingModalsProps {
  isOnboardingModalOpen: boolean;
  isTelegramModalOpen: boolean;
  isSuccessModalOpen: boolean;
  isCustomizationModalOpen: boolean;
  telegramStep: number;
  telegramUsername: string;
  isSubmitting: boolean;
  errorMessage: string | null;
  isModalClosing: boolean;
  targetX: number;
  targetY: number;
  session: any;
  customizationOptions: CustomizationOptions;
  onboardingStep: number;
  closeOnboardingModal: () => void;
  startTelegramRegistration: () => void;
  setTelegramModalOpen: (isOpen: boolean) => void;
  setCustomizationModalOpen: (isOpen: boolean) => void;
  setTelegramStep: (step: number) => void;
  setTelegramUsername: (username: string) => void;
  setCustomizationOptions: (options: CustomizationOptions) => void;
  hasCustomizedAgent: boolean;
  setHasCustomizedAgent: (hasCustomized: boolean) => void;
  setOnboardingStep: (step: number) => void;
  handleSubmit: () => void;
  setSuccessModalOpen: (isOpen: boolean) => void;
}

const OnboardingModals: React.FC<OnboardingModalsProps> = ({
  isOnboardingModalOpen,
  isTelegramModalOpen,
  isSuccessModalOpen,
  isCustomizationModalOpen,
  telegramStep,
  telegramUsername,
  isSubmitting,
  errorMessage,
  isModalClosing,
  targetX,
  targetY,
  customizationOptions,
  onboardingStep,
  closeOnboardingModal,
  startTelegramRegistration,
  setTelegramModalOpen,
  setCustomizationModalOpen,
  setTelegramStep,
  setTelegramUsername,
  setCustomizationOptions,
  hasCustomizedAgent,
  setHasCustomizedAgent,
  setOnboardingStep,
  handleSubmit,
  setSuccessModalOpen,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Validation function for customization options
  const validateCustomizationOptions = (options: CustomizationOptions): boolean => {
    // All metrics use 0-100 range for weightages
    for (const [key, value] of Object.entries(options)) {
      if (value < 0 || value > 100) {
        return false;
      }
    }
    return true;
  };

  // Customization local UI state and helpers (after validator to avoid hoist issues)
  const [activeCustomizationTab, setActiveCustomizationTab] = useState<"metrics" | "presets">("metrics");
  const initialCustomizationRef = useRef<CustomizationOptions>(customizationOptions);
  const isCustomizationValid = validateCustomizationOptions(customizationOptions);

  const resetCustomizationToDefaults = () => {
    setCustomizationOptions(initialCustomizationRef.current);
  };

  // Helper function to update customization options and mark as customized
  const updateCustomizationOptions = (options: CustomizationOptions) => {
    setHasCustomizedAgent(true);
    setCustomizationOptions(options);
  };

  const applyCustomizationPreset = (preset: "Balanced" | "Momentum" | "Meme Rush" | "Defensive") => {
    // Mark that user has customized their agent
    setHasCustomizedAgent(true);
    
    if (preset === "Balanced") {
      setCustomizationOptions({
        r_last6h_pct: 60,
        d_pct_mktvol_6h: 65,
        d_pct_socvol_6h: 55,
        d_pct_sent_6h: 50,
        d_pct_users_6h: 45,
        d_pct_infl_6h: 50,
        d_galaxy_6h: 60,
        neg_d_altrank_6h: 55,
      });
    } else if (preset === "Momentum") {
      setCustomizationOptions({
        r_last6h_pct: 80,
        d_pct_mktvol_6h: 75,
        d_pct_socvol_6h: 40,
        d_pct_sent_6h: 45,
        d_pct_users_6h: 35,
        d_pct_infl_6h: 40,
        d_galaxy_6h: 65,
        neg_d_altrank_6h: 70,
      });
    } else if (preset === "Meme Rush") {
      setCustomizationOptions({
        r_last6h_pct: 45,
        d_pct_mktvol_6h: 50,
        d_pct_socvol_6h: 85,
        d_pct_sent_6h: 80,
        d_pct_users_6h: 75,
        d_pct_infl_6h: 80,
        d_galaxy_6h: 40,
        neg_d_altrank_6h: 60,
      });
    } else if (preset === "Defensive") {
      setCustomizationOptions({
        r_last6h_pct: 50,
        d_pct_mktvol_6h: 70,
        d_pct_socvol_6h: 40,
        d_pct_sent_6h: 35,
        d_pct_users_6h: 55,
        d_pct_infl_6h: 35,
        d_galaxy_6h: 85,
        neg_d_altrank_6h: 65,
      });
    }
  };

  // This prevents body scrolling when modals are open
  useEffect(() => {
    if (isOnboardingModalOpen || isTelegramModalOpen || isSuccessModalOpen || isCustomizationModalOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "unset";
      document.body.style.position = "static";
      document.body.style.width = "auto";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.body.style.position = "static";
      document.body.style.width = "auto";
    };
  }, [isOnboardingModalOpen, isTelegramModalOpen, isSuccessModalOpen, isCustomizationModalOpen]);

  return (
    <>
      {/* Onboarding Modal for new users */}
      {(isOnboardingModalOpen || isModalClosing) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-leagueSpartan">
          <div
            className={`fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${isModalClosing ? "opacity-0" : "opacity-100"
              }`}
            onClick={() => !isModalClosing && closeOnboardingModal()}
          />
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={
              isModalClosing
                ? {
                  opacity: 0,
                  scale: 0.1,
                  x: targetX,
                  y: targetY,
                }
                : { opacity: 1, scale: 1, x: 0, y: 0 }
            }
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="relative z-50 w-full max-w-lg overflow-hidden rounded-xl bg-gradient-to-b from-gray-900 to-[#070915] p-6 shadow-2xl border border-blue-500/30"
          >
            <div className="absolute top-2 right-2">
              <button
                onClick={closeOnboardingModal}
                className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-gray-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center p-3 bg-blue-500/15 rounded-full mb-4">
                <img src="/img/maxxit_logo.svg" alt="Maxxit" className="h-10" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Welcome to Maxxit!
              </h2>
              <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-blue-700 mx-auto my-3 rounded-full"></div>
              <p className="text-gray-300 mb-6 max-w-md mx-auto">
                You're almost there! Complete a quick one-time setup to activate
                your account and claim{" "}
                <span className="font-bold text-blue-400">
                  500 FREE credits
                </span>
                .
              </p>
            </div>

            <div className="bg-[#111528] rounded-lg p-4 mb-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center mr-2">
                  {onboardingStep}
                </span>
                Complete your registration
              </h3>

              <div className="flex items-start space-x-3 mb-4">
                <div className="flex-shrink-0 bg-green-500/20 rounded-full p-1.5">
                  <CheckCircle2 size={16} className="text-green-500" />
                </div>
                <div>
                  <p className="text-white font-medium">Twitter/X Login</p>
                  <p className="text-sm text-gray-400">
                    Successfully completed
                  </p>
                </div>
              </div>

              {onboardingStep === 1 ? (
                <>
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="flex-shrink-0 bg-blue-500/20 rounded-full p-1.5">
                      <span className="flex items-center justify-center pt-1 w-4 h-4 text-blue-400">
                        2
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Customize Your Agent</p>
                      <p className="text-sm text-gray-400">
                        Set percentage change thresholds that trigger trading signals
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 opacity-50">
                    <div className="flex-shrink-0 bg-gray-600/20 rounded-full p-1.5">
                      <span className="flex items-center justify-center pt-1 w-4 h-4 text-gray-500">
                        3
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-400 font-medium">Connect Telegram</p>
                      <p className="text-sm text-gray-500">
                        Required to activate your account and receive updates
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="flex-shrink-0 bg-green-500/20 rounded-full p-1.5">
                      <CheckCircle2 size={16} className="text-green-500" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Customize Your Agent</p>
                      <p className="text-sm text-gray-400">
                        Signal thresholds configured successfully
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 bg-blue-500/20 rounded-full p-1.5">
                      <span className="flex items-center justify-center pt-1 w-4 h-4 text-blue-400">
                        3
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Connect Telegram</p>
                      <p className="text-sm text-gray-400">
                        Required to activate your account and receive updates
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end items-center">
              <div className="flex gap-2">
                {onboardingStep === 1 ? (
                  <button
                    onClick={() => setCustomizationModalOpen(true)}
                    className="flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white rounded-lg font-medium transition-all duration-200"
                  >
                    Customize Agent
                  </button>
                ) : (
                  <button
                    onClick={startTelegramRegistration}
                    className="flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-lg font-medium transition-all duration-200"
                  >
                    Connect Telegram
                    <FaTelegram size={20} className="text-white ml-3" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Telegram Modal */}
      {isTelegramModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-leagueSpartan">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !isSubmitting && setTelegramModalOpen(false)}
          />
          <div className="relative z-50 w-full max-w-md overflow-hidden rounded-xl bg-gray-900 p-6 shadow-2xl border border-blue-500/30">
            {/* Progress indicator */}
            <div className="mb-6 px-2">
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-blue-400">
                    Step {telegramStep} of 2
                  </span>
                  <span className="text-xs font-medium text-gray-400">
                    {telegramStep === 1 ? "50%" : "100%"}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-700 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: telegramStep === 1 ? "50%" : "100%" }}
                  ></div>
                </div>
              </div>
            </div>

            {telegramStep === 1 ? (
              // Step 1: Instructions
              <div className="space-y-5">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center p-3 bg-blue-500/15 rounded-full mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-blue-400"
                    >
                      <path d="M18 8l-1-4-1 1-2 1-3-1h-2L7 6 6 5 5 8l-1 3v2l1 3 3 3 2 1h2l3-1 2-2 1-2 1-5z"></path>
                      <path d="M11 8h.01"></path>
                      <path d="M13 12h.01"></path>
                      <path d="M9 12h.01"></path>
                      <path d="M7 16h.01"></path>
                      <path d="M13 16h.01"></path>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">
                    Connect Telegram
                  </h3>
                  <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-blue-700 mx-auto my-3 rounded-full"></div>
                  <p className="text-gray-300 mb-6">
                    Follow these steps to connect your Telegram account and
                    claim your{" "}
                    <span className="text-blue-400 font-semibold">
                      500 FREE Credits
                    </span>
                  </p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <h4 className="text-sm font-medium text-blue-400 mb-3 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                      <path d="M12 8v4"></path>
                      <path d="M12 16h.01"></path>
                    </svg>
                    Important Steps
                  </h4>
                  <ol className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start">
                      <span className="flex items-center justify-center w-5 h-5 bg-blue-500/20 text-blue-400 rounded-full mr-2 text-xs font-bold flex-shrink-0 pt-1">
                        1
                      </span>
                      <span>
                        Start a chat with{" "}
                        <a
                          href="https://t.me/maxxitai_bot"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline inline-flex items-center"
                        >
                          @maxxitai_bot
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="ml-1"
                          >
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                          </svg>
                        </a>
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="flex items-center justify-center w-5 h-5 bg-blue-500/20 text-blue-400 rounded-full mr-2 text-xs font-bold flex-shrink-0 pt-1">
                        2
                      </span>
                      <span>
                        Send the message{" "}
                        <code className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-200">
                          "start"
                        </code>{" "}
                        to the bot
                      </span>
                    </li>
                  </ol>
                </div>

                <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
                  <div className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-blue-400 mr-2 mt-0.5 flex-shrink-0"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v.01" />
                      <path d="M12 8v4" />
                    </svg>
                    <p className="text-sm text-blue-100">
                      You must complete this step before continuing. Our system
                      needs to verify your Telegram account.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setTelegramModalOpen(false)}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-gray-600 px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800"
                  >
                    <span>Cancel</span>{" "}
                  </button>
                  <button
                    onClick={() => setTelegramStep(2)}
                    className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-3 text-sm font-medium text-white hover:from-blue-600 hover:to-blue-800 flex items-center justify-center gap-1"
                  >
                    <span>I've Done This</span>{" "}
                  </button>
                </div>
              </div>
            ) : telegramStep === 2 ? (
              // Step 2: Telegram Username Input (now the final step)
              <div className="space-y-5">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-1">
                    Verify Your Telegram Account
                  </h3>
                  <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-blue-700 mx-auto my-3 rounded-full" />
                  <p className="text-sm text-gray-300">Step 2 of 2</p>
                </div>

                <div className="mb-4">
                  <h4 className="text-white font-medium mb-2 flex items-center gap-2 font-leagueSpartan">
                    <FaTelegram className="text-blue-400" size={18} />
                    Enter Your Telegram Username
                  </h4>

                  <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30 mb-4">
                    <p className="text-sm text-blue-100 mb-3">
                      Not sure what your Telegram username is? Follow these
                      steps:
                    </p>
                    <ol className="text-sm text-gray-300 space-y-2 pl-1">
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs text-blue-400 font-medium pt-1">
                          1
                        </span>
                        <span>Open your Telegram app</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs text-blue-400 font-medium pt-1">
                          2
                        </span>
                        <span>
                          Go to <strong>Settings</strong> (tap on the hamburger
                          menu ☰)
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs text-blue-400 font-medium pt-1">
                          3
                        </span>
                        <span>
                          Find your username in "My Profile" section (it will
                          appear as <strong>@username</strong>)
                        </span>
                      </li>
                    </ol>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="telegram-username"
                    className="text-sm font-medium text-blue-300 mb-2 block"
                  >
                    Your Telegram Username
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/40 to-blue-600/40 rounded-lg blur-sm opacity-30 group-hover:opacity-50 transition duration-300"></div>
                    <div className="relative flex items-center bg-gray-900/90 rounded-lg transition duration-300 overflow-hidden border border-blue-500/40 group-hover:border-blue-400/70 focus-within:border-blue-400 shadow-md hover:shadow-lg">
                      <div className="pl-4 pr-1 text-blue-400 font-medium text-lg flex items-center">
                        <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center pt-1">
                          <span>@</span>
                        </div>
                      </div>
                      <input
                        id="telegram-username"
                        type="text"
                        value={telegramUsername}
                        onChange={(e) => {
                          // Auto-remove @ and trim spaces
                          const value = e.target.value.replace("@", "").trim();
                          setTelegramUsername(value.toLowerCase());
                        }}
                        placeholder="username"
                        className="w-[70%] px-2 py-4 bg-transparent text-white focus:outline-none placeholder-gray-500 font-medium"
                      />
                    </div>
                  </div>
                  <div className="text-sm text-gray-400 mt-2 flex items-center gap-1.5">
                    <OctagonAlert size={14} className="text-amber-400" />
                    <span>
                      Enter <strong>exactly</strong> as shown in your Telegram
                      settings (without the @)
                    </span>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm flex items-start gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-red-400 flex-shrink-0 mt-0.5"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {errorMessage}
                    </p>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setTelegramStep(1)}
                    className="flex items-center justify-center gap-1 flex-1 rounded-lg border border-gray-600 px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800"
                  >
                    <span>Back</span>
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !telegramUsername}
                    className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-3 text-sm font-medium text-white hover:from-blue-600 hover:to-blue-800 disabled:opacity-70 disabled:cursor-not-allowed transition duration-200"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        <span>Complete & Get Credits</span>
                        <IoShieldCheckmark
                          size={15}
                          color="rgb(135, 255, 135)"
                        />
                      </div>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-1">
                    Verify Your Telegram Account
                  </h3>
                  <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-blue-700 mx-auto my-3 rounded-full" />
                  <p className="text-sm text-gray-300">Step 2 of 2</p>
                </div>
                <p className="text-sm text-gray-300">
                  You've completed all steps. Click "Complete & Get Credits" to
                  finish.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Customization Options Modal */}
      {isCustomizationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-leagueSpartan">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setCustomizationModalOpen(false)}
          />
          <div className="relative z-50 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl bg-gray-900 shadow-2xl border border-blue-500/30 flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 px-6 py-4 border-b border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">Customize Agent</h3>
                  <p className="text-gray-300 text-sm mt-1">Set percentage change thresholds for when your agent should send trading signals</p>
                </div>
                <button
                  onClick={() => setCustomizationModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800/50 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="mt-3 text-right">
                <button
                  onClick={() => {
                    // Reset to initial values and mark as not customized
                    setCustomizationOptions(initialCustomizationRef.current);
                    setHasCustomizedAgent(false);
                    setCustomizationModalOpen(false);
                    setOnboardingStep(2);
                  }}
                  className="text-sm text-gray-300 hover:text-white underline-offset-2 hover:underline"
                >
                  I'll do it later
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-700/50 bg-gray-800/30">
              <button
                onClick={() => setActiveCustomizationTab("metrics")}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${activeCustomizationTab === "metrics"
                  ? "text-white border-b-2 border-blue-500 bg-blue-500/10"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  }`}
              >
                Agent Metrics
              </button>
              <button
                onClick={() => setActiveCustomizationTab("presets")}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${activeCustomizationTab === "presets"
                  ? "text-white border-b-2 border-purple-500 bg-purple-500/10"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  }`}
              >
                Agent Presets
              </button>
            </div>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row flex-1 min-h-0">
              {/* Left Panel - Metrics */}
              {(activeCustomizationTab === "metrics") ? (
                <div className="w-full lg:w-1/2 border-r border-gray-700/50 overflow-y-auto p-4 space-y-4">
                  {/* Price Momentum */}
                  <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/10 border border-blue-500/30 rounded-lg p-4 hover:border-blue-500/50 transition-all group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-white font-medium">Price Momentum</h4>
                          <p className="text-xs text-gray-400">6-hour price movement weight (0% - 100%)</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-400">{customizationOptions.r_last6h_pct}%</div>
                        <div className="text-xs text-gray-500">Weight</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={customizationOptions.r_last6h_pct}
                          onChange={(e) => updateCustomizationOptions({
                            ...customizationOptions,
                            r_last6h_pct: parseInt(e.target.value)
                          })}
                          className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-enhanced"
                          style={{
                            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${customizationOptions.r_last6h_pct}%, #6b7280 ${customizationOptions.r_last6h_pct}%, #6b7280 100%)`
                          }}
                        />
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={customizationOptions.r_last6h_pct}
                          onChange={(e) => updateCustomizationOptions({
                            ...customizationOptions,
                            r_last6h_pct: Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                          })}
                          className="w-16 px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-white text-center focus:outline-none focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                          <span>0%</span>
                        <span className="text-blue-400">Medium: 25%</span>
                          <span>100%</span>
                        </div>
                      </div>
                      </div>
                  
                  {/* Market Volume */}
                  <div className="bg-gradient-to-r from-green-900/20 to-green-800/10 border border-green-500/30 rounded-lg p-4 hover:border-green-500/50 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-white font-medium">Market Volume</h4>
                          <p className="text-xs text-gray-400">Trading volume change weight (0% - 100%)</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-400">{customizationOptions.d_pct_mktvol_6h}%</div>
                        <div className="text-xs text-gray-500">Weight</div>
                      </div>
                      </div>

                      <div className="space-y-3">
                      <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={customizationOptions.d_pct_mktvol_6h}
                            onChange={(e) => updateCustomizationOptions({
                              ...customizationOptions,
                              d_pct_mktvol_6h: parseInt(e.target.value)
                            })}
                          className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-enhanced"
                            style={{
                            background: `linear-gradient(to right, #10b981 0%, #10b981 ${customizationOptions.d_pct_mktvol_6h}%, #6b7280 ${customizationOptions.d_pct_mktvol_6h}%, #6b7280 100%)`
                          }}
                        />
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={customizationOptions.d_pct_mktvol_6h}
                          onChange={(e) => updateCustomizationOptions({
                            ...customizationOptions,
                            d_pct_mktvol_6h: Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                          })}
                          className="w-16 px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-white text-center focus:outline-none focus:border-green-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                        <span>0%</span>
                        <span className="text-green-400">Medium: 30%</span>
                        <span>100%</span>
                        </div>
                      </div>
                    </div>

                  {/* Social Volume */}
                  <div className="bg-gradient-to-r from-purple-900/20 to-purple-800/10 border border-purple-500/30 rounded-lg p-4 hover:border-purple-500/50 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-white font-medium">Social Volume</h4>
                          <p className="text-xs text-gray-400">Social mentions weight (0% - 100%)</p>
                          </div>
                        </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-400">{customizationOptions.d_pct_socvol_6h}%</div>
                        <div className="text-xs text-gray-500">Weight</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <input
                          type="range"
                            min="0"
                            max="100"
                            value={customizationOptions.d_pct_socvol_6h}
                            onChange={(e) => updateCustomizationOptions({
                              ...customizationOptions,
                            d_pct_socvol_6h: parseInt(e.target.value)
                          })}
                          className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-enhanced"
                          style={{
                            background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${customizationOptions.d_pct_socvol_6h}%, #6b7280 ${customizationOptions.d_pct_socvol_6h}%, #6b7280 100%)`
                          }}
                        />
                          <input
                          type="number"
                            min="0"
                            max="100"
                            value={customizationOptions.d_pct_socvol_6h}
                            onChange={(e) => updateCustomizationOptions({
                              ...customizationOptions,
                            d_pct_socvol_6h: Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                            })}
                          className="w-16 px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-white text-center focus:outline-none focus:border-purple-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                        <span>0%</span>
                        <span className="text-purple-400">Medium: 20%</span>
                        <span>100%</span>
                        </div>
                      </div>
                    </div>

                  {/* Sentiment */}
                  <div className="bg-gradient-to-r from-yellow-900/20 to-yellow-800/10 border border-yellow-500/30 rounded-lg p-4 hover:border-yellow-500/50 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-white font-medium">Sentiment</h4>
                          <p className="text-xs text-gray-400">Market sentiment weight (0% - 100%)</p>
                          </div>
                        </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-yellow-400">{customizationOptions.d_pct_sent_6h}%</div>
                        <div className="text-xs text-gray-500">Weight</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <input
                          type="range"
                            min="0"
                            max="100"
                            value={customizationOptions.d_pct_sent_6h}
                            onChange={(e) => updateCustomizationOptions({
                              ...customizationOptions,
                            d_pct_sent_6h: parseInt(e.target.value)
                          })}
                          className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-enhanced"
                          style={{
                            background: `linear-gradient(to right, #eab308 0%, #eab308 ${customizationOptions.d_pct_sent_6h}%, #6b7280 ${customizationOptions.d_pct_sent_6h}%, #6b7280 100%)`
                          }}
                        />
                          <input
                          type="number"
                            min="0"
                            max="100"
                            value={customizationOptions.d_pct_sent_6h}
                            onChange={(e) => updateCustomizationOptions({
                              ...customizationOptions,
                            d_pct_sent_6h: Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                            })}
                          className="w-16 px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-white text-center focus:outline-none focus:border-yellow-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                        <span>0%</span>
                        <span className="text-yellow-400">Medium: 15%</span>
                        <span>100%</span>
                        </div>
                      </div>
                    </div>

                  {/* User Growth */}
                  <div className="bg-gradient-to-r from-cyan-900/20 to-cyan-800/10 border border-cyan-500/30 rounded-lg p-4 hover:border-cyan-500/50 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-white font-medium">User Growth</h4>
                          <p className="text-xs text-gray-400">Community growth weight (0% - 100%)</p>
                          </div>
                        </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-cyan-400">{customizationOptions.d_pct_users_6h}%</div>
                        <div className="text-xs text-gray-500">Weight</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <input
                          type="range"
                            min="0"
                            max="100"
                            value={customizationOptions.d_pct_users_6h}
                            onChange={(e) => updateCustomizationOptions({
                              ...customizationOptions,
                            d_pct_users_6h: parseInt(e.target.value)
                          })}
                          className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-enhanced"
                          style={{
                            background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${customizationOptions.d_pct_users_6h}%, #6b7280 ${customizationOptions.d_pct_users_6h}%, #6b7280 100%)`
                          }}
                        />
                          <input
                          type="number"
                            min="0"
                            max="100"
                            value={customizationOptions.d_pct_users_6h}
                            onChange={(e) => updateCustomizationOptions({
                              ...customizationOptions,
                            d_pct_users_6h: Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                            })}
                          className="w-16 px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-white text-center focus:outline-none focus:border-cyan-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                        <span>0%</span>
                        <span className="text-cyan-400">Medium: 10%</span>
                        <span>100%</span>
                        </div>
                      </div>
                    </div>

                  {/* Influencers */}
                  <div className="bg-gradient-to-r from-pink-900/20 to-pink-800/10 border border-pink-500/30 rounded-lg p-4 hover:border-pink-500/50 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-white font-medium">Influencers</h4>
                          <p className="text-xs text-gray-400">Influencer mentions weight (0% - 100%)</p>
                          </div>
                        </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-pink-400">{customizationOptions.d_pct_infl_6h}%</div>
                        <div className="text-xs text-gray-500">Weight</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <input
                          type="range"
                            min="0"
                            max="100"
                            value={customizationOptions.d_pct_infl_6h}
                            onChange={(e) => updateCustomizationOptions({
                              ...customizationOptions,
                            d_pct_infl_6h: parseInt(e.target.value)
                          })}
                          className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-enhanced"
                          style={{
                            background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${customizationOptions.d_pct_infl_6h}%, #6b7280 ${customizationOptions.d_pct_infl_6h}%, #6b7280 100%)`
                          }}
                        />
                          <input
                          type="number"
                            min="0"
                            max="100"
                            value={customizationOptions.d_pct_infl_6h}
                            onChange={(e) => updateCustomizationOptions({
                              ...customizationOptions,
                            d_pct_infl_6h: Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                            })}
                          className="w-16 px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-white text-center focus:outline-none focus:border-pink-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                        <span>0%</span>
                        <span className="text-pink-400">Medium: 15%</span>
                        <span>100%</span>
                        </div>
                      </div>
                    </div>

                  {/* Heartbeat Score */}
                  <div className="bg-gradient-to-r from-indigo-900/20 to-indigo-800/10 border border-indigo-500/30 rounded-lg p-4 hover:border-indigo-500/50 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-white font-medium">Heartbeat Score</h4>
                          <p className="text-xs text-gray-400">Composite health weight (0% - 100%)</p>
                          </div>
                        </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-indigo-400">{customizationOptions.d_galaxy_6h}%</div>
                        <div className="text-xs text-gray-500">Weight</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                      <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="0"
                          max="100"
                            value={customizationOptions.d_galaxy_6h}
                            onChange={(e) => updateCustomizationOptions({
                              ...customizationOptions,
                              d_galaxy_6h: parseInt(e.target.value)
                            })}
                          className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-enhanced"
                            style={{
                            background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${customizationOptions.d_galaxy_6h}%, #6b7280 ${customizationOptions.d_galaxy_6h}%, #6b7280 100%)`
                          }}
                        />
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={customizationOptions.d_galaxy_6h}
                          onChange={(e) => updateCustomizationOptions({
                            ...customizationOptions,
                            d_galaxy_6h: Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                          })}
                          className="w-16 px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-white text-center focus:outline-none focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                        <span>0%</span>
                        <span className="text-indigo-400">Medium: 25%</span>
                        <span>100%</span>
                        </div>
                      </div>
                    </div>

                  {/* Market Edge */}
                  <div className="bg-gradient-to-r from-orange-900/20 to-orange-800/10 border border-orange-500/30 rounded-lg p-4 hover:border-orange-500/50 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-white font-medium">Market Edge</h4>
                          <p className="text-xs text-gray-400">Relative ranking weight (0% - 100%)</p>
                          </div>
                        </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-orange-400">{customizationOptions.neg_d_altrank_6h}%</div>
                        <div className="text-xs text-gray-500">Weight</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <input
                          type="range"
                            min="0"
                            max="100"
                            value={customizationOptions.neg_d_altrank_6h}
                            onChange={(e) => updateCustomizationOptions({
                              ...customizationOptions,
                            neg_d_altrank_6h: parseInt(e.target.value)
                          })}
                          className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-enhanced"
                          style={{
                            background: `linear-gradient(to right, #f97316 0%, #f97316 ${customizationOptions.neg_d_altrank_6h}%, #6b7280 ${customizationOptions.neg_d_altrank_6h}%, #6b7280 100%)`
                          }}
                        />
                          <input
                          type="number"
                            min="0"
                            max="100"
                            value={customizationOptions.neg_d_altrank_6h}
                            onChange={(e) => updateCustomizationOptions({
                              ...customizationOptions,
                            neg_d_altrank_6h: Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                            })}
                          className="w-16 px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-white text-center focus:outline-none focus:border-orange-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                        <span>0%</span>
                        <span className="text-orange-400">Medium: 20%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeCustomizationTab === "presets" ? (
                <div className="w-full lg:w-1/2 border-r border-gray-700/50 overflow-y-auto p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Quick Strategy Presets</h3>
                    <p className="text-sm text-gray-400">Choose a pre-configured strategy to get started quickly</p>
                  </div>

                  <div className="space-y-4">
                    <button
                      onClick={() => applyCustomizationPreset("Balanced")}
                      className="w-full text-left p-5 rounded-lg border border-gray-700/50 bg-gradient-to-r from-blue-900/20 to-blue-800/10 hover:border-blue-500/50 hover:from-blue-900/30 hover:to-blue-800/20 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-semibold text-lg">🎯 Balanced</h4>
                        <div className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">Recommended</div>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">Balanced approach with moderate weights across all signals. Ideal default for most market conditions.</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span>Price: 60% • Volume: 65% • Social: 55% • Heartbeat: 60%</span>
                      </div>
                    </button>

                    <button
                      onClick={() => applyCustomizationPreset("Momentum")}
                      className="w-full text-left p-5 rounded-lg border border-gray-700/50 bg-gradient-to-r from-green-900/20 to-green-800/10 hover:border-green-500/50 hover:from-green-900/30 hover:to-green-800/20 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-semibold text-lg">🚀 Momentum</h4>
                        <div className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">Trending</div>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">Emphasizes price action and volume. Perfect for trending markets and technical breakouts.</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span>Price: 80% • Volume: 75% • Market Edge: 70%</span>
                      </div>
                    </button>

                    <button
                      onClick={() => applyCustomizationPreset("Meme Rush")}
                      className="w-full text-left p-5 rounded-lg border border-gray-700/50 bg-gradient-to-r from-purple-900/20 to-purple-800/10 hover:border-purple-500/50 hover:from-purple-900/30 hover:to-purple-800/20 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-semibold text-lg">🔥 Meme Rush</h4>
                        <div className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded">Social</div>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">Prioritizes social signals and community buzz. Perfect for catching viral meme coin runs.</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span>Social: 85% • Sentiment: 80% • Influencers: 80%</span>
                      </div>
                    </button>

                    <button
                      onClick={() => applyCustomizationPreset("Defensive")}
                      className="w-full text-left p-5 rounded-lg border border-gray-700/50 bg-gradient-to-r from-amber-900/20 to-amber-800/10 hover:border-amber-500/50 hover:from-amber-900/30 hover:to-amber-800/20 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-semibold text-lg">🛡️ Defensive</h4>
                        <div className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded">Safe</div>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">Conservative approach focusing on fundamental strength. Reduces noise in volatile markets.</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span>Volume: 70% • Heartbeat: 85% • Market Edge: 65%</span>
                      </div>
                    </button>
                  </div>

                  <div className="mt-6 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                    <p className="text-xs text-gray-400">
                      💡 <strong>Tip:</strong> After selecting a preset, switch to "Agent Metrics" tab to fine-tune individual thresholds.
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Details / Preview Panel */}
              <div className="w-full lg:w-1/2 bg-gray-800/20 p-6 overflow-y-auto border-t lg:border-t-0 lg:border-r border-gray-700/50">
                {/* Agent Preview Summary */}
                <div className="mb-6 bg-gradient-to-r from-emerald-900/20 to-emerald-800/10 rounded-lg p-4 border border-emerald-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Signal Threshold Profile</h4>
                      <p className="text-sm text-gray-400 mt-1">Your agent will send signals when these thresholds are met</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Validity</p>
                      <p className={`text-sm font-semibold ${isCustomizationValid ? "text-emerald-400" : "text-red-400"}`}>{isCustomizationValid ? "Valid" : "Check ranges"}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Price Momentum</span>
                      <span className="text-blue-400 font-medium">{customizationOptions.r_last6h_pct}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Market Volume</span>
                      <span className="text-green-400 font-medium">{customizationOptions.d_pct_mktvol_6h}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Social Volume</span>
                      <span className="text-purple-400 font-medium">{customizationOptions.d_pct_socvol_6h}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Sentiment</span>
                      <span className="text-yellow-400 font-medium">{customizationOptions.d_pct_sent_6h}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">User Breadth</span>
                      <span className="text-cyan-400 font-medium">{customizationOptions.d_pct_users_6h}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Influencers</span>
                      <span className="text-pink-400 font-medium">{customizationOptions.d_pct_infl_6h}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Heartbeat Score</span>
                      <span className="text-indigo-400 font-medium">{customizationOptions.d_galaxy_6h}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Market Edge</span>
                      <span className="text-orange-400 font-medium">{customizationOptions.neg_d_altrank_6h}%</span>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-400">
                    <span className="mr-2">Status:</span>
                    <span className={`${customizationOptions.d_pct_socvol_6h + customizationOptions.d_pct_sent_6h + customizationOptions.d_pct_infl_6h > customizationOptions.r_last6h_pct + customizationOptions.d_pct_mktvol_6h ? "text-purple-300" : "text-green-300"}`}>
                      {customizationOptions.d_pct_socvol_6h + customizationOptions.d_pct_sent_6h + customizationOptions.d_pct_infl_6h > customizationOptions.r_last6h_pct + customizationOptions.d_pct_mktvol_6h ? "Social-driven" : "Price/Volume-driven"}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/10 rounded-lg p-4 border border-blue-500/30">
                    <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      How It Works
                    </h4>
                    <div className="text-sm text-gray-300 space-y-2">
                      <p>Each signal measures different aspects of market activity over the last 6 hours:</p>
                      <ul className="space-y-1 ml-4">
                        <li><span className="text-blue-400">•</span> <strong>Price & Volume:</strong> Technical momentum</li>
                        <li><span className="text-purple-400">•</span> <strong>Social & Sentiment:</strong> Community buzz</li>
                        <li><span className="text-indigo-400">•</span> <strong>Galaxy & AltRank:</strong> Overall health</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-900/20 to-green-800/10 rounded-lg p-4 border border-green-500/30">
                    <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Quick Tips
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1 text-xs">✓</span>
                        <span>Use <strong>number inputs</strong> for precise control</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1 text-xs">✓</span>
                        <span>Try <strong>Agent Presets</strong> for instant setups</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 mt-1 text-xs">✓</span>
                        <span>Higher thresholds = fewer but stronger signals</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400 mt-1 text-xs">✓</span>
                        <span>All metrics use 0-100% weightage scale for consistency</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-700/50 p-4 bg-gray-800/30">
              <div className="flex gap-3">
                <button
                  onClick={resetCustomizationToDefaults}
                  className="px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={() => setCustomizationModalOpen(false)}
                  className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-gray-600 px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800"
                >
                  <span>Cancel</span>
                </button>
                <button
                  onClick={() => {
                    if (validateCustomizationOptions(customizationOptions)) {
                      setCustomizationModalOpen(false);
                      setOnboardingStep(2);
                    }
                  }}
                  disabled={!isCustomizationValid}
                  className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium flex items-center justify-center gap-1 transition-all ${isCustomizationValid
                    ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800"
                    : "bg-gray-700 text-gray-400 cursor-not-allowed"
                    }`}
                >
                  <span>Create Agent & Continue</span>
                  {isCustomizationValid && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-leagueSpartan">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSuccessModalOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative z-50 w-full max-w-md overflow-hidden rounded-xl bg-gradient-to-b from-gray-900 to-[#070915] p-6 shadow-2xl border border-green-500/30"
          >
            <div className="text-center py-4">
              <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-green-500/20 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-500"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Registration Complete!
              </h2>

              <div className="h-1 w-24 bg-gradient-to-r from-green-500 to-green-700 mx-auto my-3 rounded-full"></div>

              <p className="text-gray-300 mb-4">
                Your account has been successfully activated
              </p>

              <div className="bg-gray-800/50 rounded-lg p-4 my-6 border border-gray-700/50 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-1">You received</p>
                  <p className="text-3xl font-bold text-green-400">
                    500 Credits
                  </p>
                  <p className="text-gray-400 text-sm mt-1">to your account</p>
                </div>
              </div>

              <p className="text-gray-400 text-sm mb-6">
                You can now access all features of the platform
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setSuccessModalOpen(false);
                  // Ensure registration check is cleared when user closes the modal
                  sessionStorage.removeItem("hasCompletedRegistrationCheck");
                  sessionStorage.removeItem("hasShownRegistrationReminder");
                }}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white rounded-lg font-medium transition-all duration-200"
              >
                Start Using Maxxit
              </button>

              <Link
                href="/profile"
                onClick={() => {
                  // Ensure registration check is cleared when user navigates away
                  sessionStorage.removeItem("hasCompletedRegistrationCheck");
                  sessionStorage.removeItem("hasShownRegistrationReminder");
                  setSuccessModalOpen(false);
                }}
                className="text-center w-full px-6 py-3 border border-gray-700 text-gray-300 hover:bg-gray-800 rounded-lg transition-all duration-200 text-sm"
              >
                View My Profile
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default OnboardingModals;
