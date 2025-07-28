import React from "react";
import {
  Users,
  Globe,
  Zap,
  DollarSign,
  Network,
  Lock
} from "lucide-react";
import { SafeInfoCard } from "./SafeInfoCard";
import { NetworkBadge } from "./NetworkBadge";
import { supportedNetworks } from "../utils/safeUtils";

export const SafeInfoSection: React.FC = () => {
  const safeInfoCards = [
    {
      icon: Users,
      title: "Multi-Signature Security",
      description: "Require multiple signatures for transactions. Your Safe uses 2 owners (you + agent) with 1 signature threshold.",
      highlight: "Enhanced Security"
    },
    {
      icon: Globe,
      title: "Multi-Chain Deployment",
      description: "Same Safe address across all supported networks with deterministic deployment using salt nonce.",
      highlight: "Predictable Addresses"
    },
    {
      icon: Zap,
      title: "Production Ready",
      description: "Built with Safe Protocol Kit v1.4.1, battle-tested across billions in assets with enterprise-grade security.",
      highlight: "Trusted by Millions"
    },
    {
      icon: DollarSign,
      title: "Cost Efficient",
      description: "Deploy once, use everywhere. Automatic status management from 'initializing' to 'active' upon deployment.",
      highlight: "Smart Deployment"
    },
    {
      icon: Network,
      title: "Network Expansion",
      description: "Start with testnet, expand to mainnet networks as needed. Add new networks to existing Safes seamlessly.",
      highlight: "Flexible Growth"
    },
    {
      icon: Lock,
      title: "Self-Custody",
      description: "You maintain full control of your assets. Safe wallets are non-custodial and fully decentralized.",
      highlight: "Your Keys, Your Crypto"
    }
  ];

  return (
    <>
      {/* What is Safe Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-white mb-8 font-napzerRounded text-center">
          Why Choose Safe Wallets?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeInfoCards.map((card, index) => (
            <SafeInfoCard
              key={index}
              icon={card.icon}
              title={card.title}
              description={card.description}
              highlight={card.highlight}
            />
          ))}
        </div>
      </div>

      {/* Supported Networks */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-white mb-8 font-napzerRounded text-center">
          Supported Networks
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {supportedNetworks.map((network, idx) => (
            <NetworkBadge key={idx} {...network} />
          ))}
        </div>
      </div>
    </>
  );
}; 