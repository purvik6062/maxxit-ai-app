import React, { useState } from "react";
import { useWallet } from "./WalletConnector";
import { AIAgent } from "./types";
import {
  AI_AGENTS,
  getRiskLevelColor,
  getStrategyDescription,
} from "./ai-agents";
import toast from "react-hot-toast";

interface AIAgentSelectionProps {
  onAgentSelected: (agent: AIAgent) => void;
  selectedAgent: AIAgent | null;
}

const AIAgentSelection: React.FC<AIAgentSelectionProps> = ({
  onAgentSelected,
  selectedAgent,
}) => {
  const { account, signer } = useWallet();
  const [purchasingAgent, setPurchasingAgent] = useState<string | null>(null);

  const handlePurchaseAgent = async (agent: AIAgent) => {
    if (!account || !signer) {
      toast.error("Please connect your wallet to purchase an AI Agent");
      return;
    }

    try {
      setPurchasingAgent(agent.id);

      // Simulate payment process
      toast.loading(`Purchasing ${agent.name}...`, { id: "purchasing" });

      // In a real implementation, this would be a smart contract call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success(`${agent.name} purchased successfully!`, {
        id: "purchasing",
      });
      onAgentSelected(agent);
    } catch (error) {
      console.error("Error purchasing agent:", error);
      toast.error("Failed to purchase AI Agent", { id: "purchasing" });
    } finally {
      setPurchasingAgent(null);
    }
  };

  const handleContinueWithSelectedAgent = () => {
    if (selectedAgent) {
      onAgentSelected(selectedAgent);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-[#E4EFFF] mb-4">
          Choose Your AI Trading Agent
        </h2>
        <p className="text-lg text-[#8ba1bc] max-w-3xl mx-auto">
          Select an AI-powered trading strategy to manage your vault. Each agent
          employs different algorithms and risk management techniques to
          optimize your investment performance.
        </p>
      </div>

      {/* AI Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {AI_AGENTS.map((agent) => (
          <div
            key={agent.id}
            className={`
              bg-[#0D1321] border-2 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl
              ${
                selectedAgent?.id === agent.id
                  ? "border-blue-500 bg-blue-500/5"
                  : "border-[#253040] hover:border-[#353940]"
              }
            `}
          >
            {/* Agent Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{agent.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-[#E4EFFF]">
                    {agent.name}
                  </h3>
                  <div className="text-sm text-[#AAC9FA]">
                    {getStrategyDescription(agent.strategy)}
                  </div>
                </div>
              </div>
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskLevelColor(
                  agent.riskLevel
                )}`}
              >
                {agent.riskLevel} Risk
              </div>
            </div>

            {/* Description */}
            <p className="text-[#8ba1bc] text-sm mb-4 leading-relaxed">
              {agent.description}
            </p>

            {/* Performance Stats */}
            <div className="bg-[#0A0F1A] border border-[#253040] rounded-lg p-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#8ba1bc]">Avg. Returns</span>
                <span className="text-sm font-semibold text-green-400">
                  {agent.avgReturns}
                </span>
              </div>
            </div>

            {/* Features */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-[#AAC9FA] mb-2">
                Key Features:
              </h4>
              <ul className="space-y-1">
                {agent.features.slice(0, 3).map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-xs text-[#8ba1bc]"
                  >
                    <div className="w-1 h-1 bg-cyan-400 rounded-full" />
                    {feature}
                  </li>
                ))}
                {agent.features.length > 3 && (
                  <li className="text-xs text-[#6b7280] italic">
                    +{agent.features.length - 3} more features
                  </li>
                )}
              </ul>
            </div>

            {/* Price and Action */}
            <div className="border-t border-[#253040] pt-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-lg font-bold text-[#E4EFFF]">
                    {agent.price} ETH
                  </div>
                  <div className="text-xs text-[#8ba1bc]">
                    One-time purchase
                  </div>
                </div>
              </div>

              {selectedAgent?.id === agent.id ? (
                <div className="space-y-3">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                    <div className="text-green-400 text-sm font-medium mb-1">
                      ✓ Agent Purchased
                    </div>
                    <div className="text-green-300 text-xs">
                      Ready to configure vault
                    </div>
                  </div>
                  <button
                    onClick={handleContinueWithSelectedAgent}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 
                             text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 
                             flex items-center justify-center gap-2 text-sm"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                    Continue with This Agent
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handlePurchaseAgent(agent)}
                  disabled={purchasingAgent === agent.id || !account}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 
                           disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed 
                           text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 
                           flex items-center justify-center gap-2 text-sm"
                >
                  {purchasingAgent === agent.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-transparent border-t-white rounded-full animate-spin" />
                      Purchasing...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Purchase Agent
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Continue Button - Enhanced for better UX */}
      {selectedAgent && (
        <div className="mt-12 text-center">
          <div className="bg-[#0D1321] border border-[#253040] rounded-2xl p-6 max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-2xl">{selectedAgent.icon}</div>
              <div>
                <div className="text-lg font-semibold text-[#E4EFFF]">
                  {selectedAgent.name}
                </div>
                <div className="text-sm text-[#AAC9FA]">Currently Selected</div>
              </div>
            </div>
            <p className="text-[#8ba1bc] text-sm mb-4">
              Your vault will use the {selectedAgent.name} strategy with wallet
              address{" "}
              <span className="text-cyan-400 font-mono text-xs">
                {selectedAgent.walletAddress.slice(0, 6)}...
                {selectedAgent.walletAddress.slice(-4)}
              </span>
            </p>
            <button
              onClick={handleContinueWithSelectedAgent}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 
                       text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 
                       flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
              Proceed to Vault Configuration
            </button>
          </div>
        </div>
      )}

      {/* Info Panel */}
      <div className="mt-12 bg-[#0D1321] border border-[#253040] rounded-2xl p-6">
        <h3 className="text-xl font-bold text-[#E4EFFF] mb-4 text-center">
          How AI Agents Work
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[#8ba1bc] text-sm">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-6 h-6 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h4 className="font-semibold text-[#AAC9FA] mb-2">
              Automated Trading
            </h4>
            <p>
              AI agents execute trades automatically based on their programmed
              strategies, removing emotion from trading decisions.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-6 h-6 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h4 className="font-semibold text-[#AAC9FA] mb-2">
              Risk Management
            </h4>
            <p>
              Each agent includes built-in risk management features like
              stop-losses and position sizing to protect your investments.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-6 h-6 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h4 className="font-semibold text-[#AAC9FA] mb-2">
              24/7 Monitoring
            </h4>
            <p>
              AI agents monitor markets continuously, executing trades even when
              you're not actively watching the markets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAgentSelection;
