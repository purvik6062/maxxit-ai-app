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
  setOnboardingStep,
  handleSubmit,
  setSuccessModalOpen,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Validation function for customization options
  const validateCustomizationOptions = (options: CustomizationOptions): boolean => {
    // Basic validation to ensure values are within expected ranges
    const ranges = {
      r_last6h_pct: { min: 0, max: 100 },
      d_pct_mktvol_6h: { min: 0, max: 100 },
      d_pct_socvol_6h: { min: 0, max: 100 },
      d_pct_sent_6h: { min: 0, max: 100 },
      d_pct_users_6h: { min: 0, max: 100 },
      d_pct_infl_6h: { min: 0, max: 100 },
      d_galaxy_6h: { min: 0, max: 10 },
      neg_d_altrank_6h: { min: 0, max: 100 },
    };

    for (const [key, value] of Object.entries(options)) {
      const range = ranges[key as keyof CustomizationOptions];
      if (value < range.min || value > range.max) {
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

  const applyCustomizationPreset = (preset: "Balanced" | "Momentum" | "Meme Rush" | "Defensive") => {
    if (preset === "Balanced") {
      setCustomizationOptions({
        ...customizationOptions,
        r_last6h_pct: 10,
        d_pct_mktvol_6h: 15,
        d_pct_socvol_6h: 10,
        d_pct_sent_6h: 5,
        d_pct_users_6h: 10,
        d_pct_infl_6h: 5,
        d_galaxy_6h: 2,
        neg_d_altrank_6h: 10,
      });
    } else if (preset === "Momentum") {
      setCustomizationOptions({
        ...customizationOptions,
        r_last6h_pct: 40,
        d_pct_mktvol_6h: 35,
        d_pct_socvol_6h: 10,
        d_pct_sent_6h: 10,
        d_pct_users_6h: 5,
        d_pct_infl_6h: 5,
        d_galaxy_6h: 4,
        neg_d_altrank_6h: 20,
      });
    } else if (preset === "Meme Rush") {
      setCustomizationOptions({
        ...customizationOptions,
        r_last6h_pct: 10,
        d_pct_mktvol_6h: 10,
        d_pct_socvol_6h: 40,
        d_pct_sent_6h: 25,
        d_pct_users_6h: 25,
        d_pct_infl_6h: 25,
        d_galaxy_6h: 1,
        neg_d_altrank_6h: 15,
      });
    } else if (preset === "Defensive") {
      setCustomizationOptions({
        ...customizationOptions,
        r_last6h_pct: -10,
        d_pct_mktvol_6h: 25,
        d_pct_socvol_6h: -10,
        d_pct_sent_6h: -5,
        d_pct_users_6h: 5,
        d_pct_infl_6h: -5,
        d_galaxy_6h: 3,
        neg_d_altrank_6h: 20,
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
        <CustomizeAgentModal
          isOpen={isCustomizationModalOpen}
          onClose={() => setCustomizationModalOpen(false)}
          onSkip={() => setOnboardingStep(2)}
          customizationOptions={customizationOptions}
          setCustomizationOptions={setCustomizationOptions}
        />
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
