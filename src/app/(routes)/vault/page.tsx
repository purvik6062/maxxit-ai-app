"use client";

import Link from "next/link";
import { ExternalLink, Shield, Rocket } from "lucide-react";

const VaultCard = ({
  title,
  description,
  cta,
  href,
  external = false,
  gradientFrom,
  gradientTo,
}: {
  title: string;
  description: string;
  cta: string;
  href: string;
  external?: boolean;
  gradientFrom: string;
  gradientTo: string;
}) => {
  const CardInner = (
    <div
      className="group h-full bg-[#0D1321] rounded-2xl p-6 md:p-8 border transition-transform duration-200 hover:scale-[1.01]"
      style={{ borderColor: "#353940" }}
    >
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center mb-5 shadow-lg`}>
        <Shield className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{title}</h3>
      <p className="text-[#8ba1bc] text-sm md:text-base leading-relaxed mb-6">{description}</p>
      <div className="flex items-center gap-2 text-sm">
        <span className="px-3 py-2 rounded-lg bg-[#1a2234] text-white inline-flex items-center gap-2">
          {external ? <ExternalLink className="w-4 h-4" /> : <Rocket className="w-4 h-4" />}
          {cta}
        </span>
        <span className="text-[#8ba1bc] opacity-80 group-hover:opacity-100">→</span>
      </div>
    </div>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block h-full">
        {CardInner}
      </a>
    );
  }
  return (
    <Link href={href} className="block h-full">
      {CardInner}
    </Link>
  );
};

export default function VaultsPage() {
  return (
    <div className="min-h-screen pb-[4rem]">
      <div className="py-6 md:py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#AAC9FA] to-[#E1EAF9] bg-clip-text text-transparent font-napzerRounded mb-4">
            Public Vaults
          </h1>
          <p className="text-[#8ba1bc] text-base md:text-xl max-w-3xl mx-auto leading-relaxed">
            Explore our on-chain vaults. Monitor performance or create a new vault aligned with your strategy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <VaultCard
            title="Hyperliquid Vault"
            description="Perpetuals strategy vault on Hyperliquid testnet. View live positions, PnL, and activity."
            cta="Open on Hyperliquid"
            href="https://app.hyperliquid-testnet.xyz/vaults/0xb51423485c8fa348701f208618755b76b124a8e6"
            external
            gradientFrom="from-blue-500"
            gradientTo="to-cyan-500"
          />

          <VaultCard
            title="Enzyme Vault"
            description="Create and manage an Enzyme vault with your configuration. Deploy, fund, and track performance."
            cta="Create Enzyme Vault"
            href="/vault/create-vault"
            gradientFrom="from-purple-500"
            gradientTo="to-pink-500"
          />
        </div>

        <div className="mt-10">
          <div className="bg-[#0D1321] rounded-2xl p-6 md:p-8 border" style={{ borderColor: "#353940" }}>
            <h2 className="text-lg md:text-xl font-semibold text-white mb-3">What are vaults?</h2>
            <p className="text-[#8ba1bc] text-sm md:text-base leading-relaxed">
              Vaults are managed baskets with defined strategies. Hyperliquid supports perpetuals strategies while Enzyme enables
              on-chain asset management for spot strategies. Choose the product that best fits your risk profile and objectives.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


