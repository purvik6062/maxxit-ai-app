"use client";

import {
  WalletProvider,
  WalletConnector,
} from "@/components/enzyme/WalletConnector";
import MultiStepVaultCreation from "@/components/enzyme/MultiStepVaultCreation";

function page() {
  return (
    <WalletProvider>
      <div className="min-h-screen bg-[#020617]">
        {/* Header Section with Wallet Connection */}
        <div className="bg-[#0D1321] border-b border-[#353940]">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-bold text-[#E4EFFF] mb-4">
                AI-Powered Enzyme Vault Creation
              </h1>
              <p className="text-lg text-[#8ba1bc] mb-6 max-w-2xl mx-auto">
                Create your own decentralized investment vault powered by AI
                trading agents using the Enzyme Protocol
              </p>

              {/* Wallet Connector */}
              <WalletConnector className="mb-4" />
            </div>
          </div>
        </div>

        {/* Multi-Step Vault Creation Component */}
        <MultiStepVaultCreation />

        {/* Footer Information */}
        <div className="bg-[#020617] py-12">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-[#0D1321] rounded-2xl border border-[#353940] shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-[#E4EFFF] mb-6 text-center">
                AI-Powered Trading Strategies
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[#8ba1bc]">
                <div className="bg-[#0A0F1A] border border-[#253040] rounded-lg p-6">
                  <h3 className="font-semibold text-[#AAC9FA] mb-3 flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-500 rounded-md flex items-center justify-center">
                      🤖
                    </div>
                    AI Trading Agents
                  </h3>
                  <p className="text-sm leading-relaxed">
                    Choose from 6 specialized AI agents, each implementing
                    different trading strategies like Trailing Stop, Moving
                    Averages (SMA/EMA), and Dynamic TP/SL for automated
                    portfolio management.
                  </p>
                </div>

                <div className="bg-[#0A0F1A] border border-[#253040] rounded-lg p-6">
                  <h3 className="font-semibold text-[#AAC9FA] mb-3 flex items-center gap-2">
                    <div className="w-5 h-5 bg-green-500 rounded-md flex items-center justify-center">
                      📈
                    </div>
                    Risk Management
                  </h3>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-cyan-400 rounded-full"></span>
                      Automated stop-loss protection
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-cyan-400 rounded-full"></span>
                      Dynamic position sizing
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-cyan-400 rounded-full"></span>
                      24/7 market monitoring
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-cyan-400 rounded-full"></span>
                      Emotion-free trading
                    </li>
                  </ul>
                </div>

                <div className="bg-[#0A0F1A] border border-[#253040] rounded-lg p-6">
                  <h3 className="font-semibold text-[#AAC9FA] mb-3 flex items-center gap-2">
                    <div className="w-5 h-5 bg-purple-500 rounded-md flex items-center justify-center">
                      ⚡
                    </div>
                    Strategy Types
                  </h3>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">📈</span>
                      Trailing Stop (Risk Management)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-400">📊</span>
                      SMA 10/20 (Trend Following)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-cyan-400">🚀</span>
                      EMA 10/20 (Momentum Trading)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-400">🧠</span>
                      Dynamic TP/SL (Adaptive AI)
                    </li>
                  </ul>
                </div>

                <div className="bg-[#0A0F1A] border border-[#253040] rounded-lg p-6">
                  <h3 className="font-semibold text-[#AAC9FA] mb-3 flex items-center gap-2">
                    <div className="w-5 h-5 bg-cyan-500 rounded-md flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    Resources
                  </h3>
                  <ul className="text-sm space-y-2">
                    <li>
                      <a
                        href="https://docs.enzyme.finance"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline decoration-dotted underline-offset-2 transition-colors duration-200 flex items-center gap-1"
                      >
                        <span>Enzyme Documentation</span>
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5z" />
                        </svg>
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://app.enzyme.finance"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline decoration-dotted underline-offset-2 transition-colors duration-200 flex items-center gap-1"
                      >
                        <span>Official Enzyme App</span>
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                        </svg>
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-blue-400 hover:text-blue-300 underline decoration-dotted underline-offset-2 transition-colors duration-200 flex items-center gap-1"
                      >
                        <span>AI Trading Guide</span>
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                        </svg>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WalletProvider>
  );
}

export default page;
