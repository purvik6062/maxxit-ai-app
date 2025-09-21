"use client";

import Link from "next/link";
import { ExternalLink, Shield, Rocket, ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";

const VaultCard = ({
  title,
  description,
  cta,
  href,
  external = false,
  gradientFrom,
  gradientTo,
  icon: Icon = Shield,
}: {
  title: string;
  description: string;
  cta: string;
  href: string;
  external?: boolean;
  gradientFrom: string;
  gradientTo: string;
  icon?: any;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const CardInner = (
    <div
      className="group h-full bg-[#0D1321] rounded-2xl p-6 md:p-8 border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl relative overflow-hidden"
      style={{
        borderColor: isHovered ? "#4A5568" : "#353940",
        boxShadow: isHovered ? "0 20px 40px rgba(0, 0, 0, 0.3)" : "0 4px 6px rgba(0, 0, 0, 0.1)"
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background gradient overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`}
      />

      {/* Animated border glow */}
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm -z-10`}
        style={{ padding: "2px" }}
      >
        <div className="w-full h-full bg-[#0D1321] rounded-2xl" />
      </div>

      {/* Icon with enhanced animation */}
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center mb-5 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
        <Icon className="w-7 h-7 text-white transition-transform duration-300 group-hover:scale-110" />
      </div>

      {/* Title with enhanced typography */}
      <h3 className="text-xl md:text-2xl font-bold text-white mb-3 transition-colors duration-300 group-hover:text-[#AAC9FA]">
        {title}
      </h3>

      {/* Description with better spacing */}
      <p className="text-[#8ba1bc] text-sm md:text-base leading-relaxed mb-6 transition-colors duration-300 group-hover:text-[#B8C5D1]">
        {description}
      </p>

      {/* Enhanced CTA button */}
      <div className="flex items-center gap-3 text-sm">
        <span className="px-4 py-3 rounded-xl bg-[#1a2234] text-white inline-flex items-center gap-2 transition-all duration-300 group-hover:bg-[#2A3441] group-hover:shadow-lg border border-[#353940] group-hover:border-[#4A5568]">
          {external ? <ExternalLink className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" /> : <Rocket className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />}
          {cta}
        </span>
        <ArrowRight className={`w-5 h-5 text-[#8ba1bc] transition-all duration-300 group-hover:text-white group-hover:translate-x-1 ${isHovered ? 'translate-x-1' : ''}`} />
      </div>

      {/* Subtle sparkle effect on hover */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <Sparkles className="w-4 h-4 text-[#AAC9FA] animate-pulse" />
      </div>
    </div>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full transition-transform duration-200 hover:scale-[1.01]"
      >
        {CardInner}
      </a>
    );
  }
  return (
    <Link href={href} className="block h-full transition-transform duration-200 hover:scale-[1.01]">
      {CardInner}
    </Link>
  );
};

export default function VaultsPage() {
  return (
    <div className="min-h-screen pb-[4rem]">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative py-6 md:py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Enhanced header section */}
        <div className="text-center mb-8 md:mb-16">
          <div className="inline-block">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-[#AAC9FA] via-[#E1EAF9] to-[#AAC9FA] bg-clip-text text-transparent font-napzerRounded mb-6 animate-fade-in-up">
              Public Vaults
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-[#AAC9FA] to-[#E1EAF9] mx-auto rounded-full animate-fade-in-up delay-200" />
          </div>
          <p className="text-[#8ba1bc] text-base md:text-xl max-w-3xl mx-auto leading-relaxed mt-8 animate-fade-in-up delay-300">
            Explore our on-chain vaults. Monitor performance or create a new vault aligned with your strategy.
          </p>
        </div>

        {/* Enhanced vault cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-16">
          <div className="animate-fade-in-up delay-400">
            <VaultCard
              title="Hyperliquid Vault"
              description="Perpetuals strategy vault on Hyperliquid testnet. View live positions, PnL, and activity with real-time monitoring."
              cta="Open on Hyperliquid"
              href="https://app.hyperliquid-testnet.xyz/vaults/0xb51423485c8fa348701f208618755b76b124a8e6"
              external
              gradientFrom="from-blue-500"
              gradientTo="to-cyan-500"
              icon={Rocket}
            />
          </div>

          <div className="animate-fade-in-up delay-500">
            <VaultCard
              title="Enzyme Vault"
              description="Create and manage an Enzyme vault with your configuration. Deploy, fund, and track performance with advanced analytics."
              cta="Create Enzyme Vault"
              href="/vault/create-vault"
              gradientFrom="from-purple-500"
              gradientTo="to-pink-500"
              icon={Shield}
            />
          </div>
        </div>

        {/* Enhanced info section */}
        <div className="animate-fade-in-up delay-600">
          <div className="bg-[#0D1321] rounded-2xl p-6 md:p-8 border-2 transition-all duration-300 hover:border-[#4A5568] hover:shadow-xl" style={{ borderColor: "#353940" }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#AAC9FA] to-[#E1EAF9] flex items-center justify-center flex-shrink-0 mt-1">
                <Shield className="w-6 h-6 text-[#0D1321]" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  What are vaults?
                  <div className="w-2 h-2 bg-[#AAC9FA] rounded-full animate-pulse" />
                </h2>
                <p className="text-[#8ba1bc] text-sm md:text-base leading-relaxed mb-4">
                  Vaults are managed baskets with defined strategies. Hyperliquid supports perpetuals strategies while Enzyme enables
                  on-chain asset management for spot strategies. Choose the product that best fits your risk profile and objectives.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-3 py-1 rounded-full bg-[#1a2234] text-[#AAC9FA] text-xs font-medium border border-[#353940]">
                    DeFi
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#1a2234] text-[#AAC9FA] text-xs font-medium border border-[#353940]">
                    Perpetuals
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#1a2234] text-[#AAC9FA] text-xs font-medium border border-[#353940]">
                    Asset Management
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#1a2234] text-[#AAC9FA] text-xs font-medium border border-[#353940]">
                    On-chain
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-fade-in-up.delay-200 {
          animation-delay: 0.2s;
        }
        
        .animate-fade-in-up.delay-300 {
          animation-delay: 0.3s;
        }
        
        .animate-fade-in-up.delay-400 {
          animation-delay: 0.4s;
        }
        
        .animate-fade-in-up.delay-500 {
          animation-delay: 0.5s;
        }
        
        .animate-fade-in-up.delay-600 {
          animation-delay: 0.6s;
        }
      `}</style>
    </div>
  );
}


