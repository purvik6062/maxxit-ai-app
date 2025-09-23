"use client";

import Link from "next/link";
import { ExternalLink, Shield, Rocket, ArrowRight, Sparkles, TrendingUp, Activity } from "lucide-react";
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
      className="group h-full bg-[#0A0E1A] rounded-3xl p-8 md:p-10 border-2 transition-all duration-500 hover:scale-[1.03] relative overflow-hidden"
      style={{
        borderColor: isHovered ? "#2563EB" : "#1E293B",
        boxShadow: isHovered
          ? "0 25px 50px rgba(37, 99, 235, 0.25), 0 0 0 1px rgba(37, 99, 235, 0.1)"
          : "0 8px 25px rgba(0, 0, 0, 0.15)"
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Enhanced animated background gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-0 group-hover:opacity-8 transition-all duration-500 rounded-3xl`}
      />

      {/* Glowing border effect */}
      <div
        className={`absolute inset-0 rounded-3xl transition-all duration-500 ${isHovered ? 'shadow-2xl shadow-blue-500/20' : ''}`}
      />

      {/* Enhanced icon with better styling */}
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center mb-6 shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3`}>
        <Icon className="w-8 h-8 text-white transition-transform duration-500 group-hover:scale-110" />
      </div>

      {/* Enhanced title with better typography */}
      <h3 className="font-leagueSpartan text-2xl md:text-3xl font-bold text-white mb-4 transition-all duration-300 group-hover:text-blue-200 leading-tight">
        {title}
      </h3>

      {/* Better description styling */}
      <p className="text-slate-400 text-base md:text-lg leading-relaxed mb-8 transition-colors duration-300 group-hover:text-slate-300">
        {description}
      </p>

      {/* Enhanced CTA button with better styling */}
      <div className="flex items-center justify-between">
        <span className="px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white inline-flex items-center gap-3 transition-all duration-300 group-hover:from-blue-500 group-hover:to-blue-600 group-hover:shadow-lg hover:shadow-blue-500/25 font-medium text-base">
          {external ? <ExternalLink className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" /> : <TrendingUp className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />}
          {cta}
        </span>
        <ArrowRight className={`w-6 h-6 text-slate-500 transition-all duration-300 group-hover:text-blue-400 group-hover:translate-x-2 ${isHovered ? 'translate-x-2 scale-110' : ''}`} />
      </div>

      {/* Enhanced sparkle effect */}
      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-700">
        <div className="relative">
          <Sparkles className="w-6 h-6 text-blue-400 animate-pulse" />
          <div className="absolute inset-0 w-6 h-6 bg-blue-400 rounded-full blur-sm opacity-20 animate-ping" />
        </div>
      </div>

      {/* Additional decorative elements */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 rounded-full blur-2xl transition-all duration-500 group-hover:scale-150" />
    </div>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full transition-transform duration-300 hover:scale-[1.01]"
      >
        {CardInner}
      </a>
    );
  }
  return (
    <Link href={href} className="block h-full transition-transform duration-300 hover:scale-[1.01]">
      {CardInner}
    </Link>
  );
};

export default function VaultsPage() {
  return (
    <div className="min-h-screen pb-[4rem]">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/8 to-cyan-400/4 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-blue-600/6 to-indigo-500/3 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-gradient-to-br from-cyan-400/5 to-blue-500/3 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative py-8 md:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Enhanced header section */}
        <div className="text-center mb-12 md:mb-20">
          <div className="inline-block relative">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent font-napzerRounded mb-6 animate-fade-in-up leading-tight">
              Public Vaults
            </h1>
            {/* Enhanced decorative line */}
            <div className="h-1 w-24 bg-gradient-to-r from-[#AAC9FA] to-[#E1EAF9] mx-auto rounded-full animate-fade-in-up delay-200" />
            {/* Additional glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-blue-400/20 to-cyan-400/20 blur-3xl -z-10 animate-pulse" />
          </div>
          <p className="text-slate-300 text-lg md:text-2xl max-w-4xl mx-auto leading-relaxed mt-10 animate-fade-in-up delay-300 font-light">
            Explore our cutting-edge on-chain vaults. Monitor live performance metrics or create a new vault perfectly aligned with your investment strategy.
          </p>
        </div>

        {/* Enhanced vault cards grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-20">
          <div className="animate-fade-in-up delay-400">
            <VaultCard
              title="Hyperliquid Vault"
              description="Advanced perpetuals strategy vault on Hyperliquid testnet. Experience real-time position tracking, comprehensive PnL analysis, and live activity monitoring with institutional-grade precision."
              cta="Open on Hyperliquid"
              href="https://app.hyperliquid-testnet.xyz/vaults/0xb51423485c8fa348701f208618755b76b124a8e6"
              external
              gradientFrom="from-blue-500"
              gradientTo="to-cyan-500"
              icon={Activity}
            />
          </div>

          <div className="animate-fade-in-up delay-500">
            <VaultCard
              title="Enzyme Vault"
              description="Create and manage sophisticated Enzyme vaults with your custom configuration. Deploy seamlessly, fund strategically, and track performance with advanced analytics and real-time insights."
              cta="Create Enzyme Vault"
              href="/vault/create-vault"
              gradientFrom="from-indigo-500"
              gradientTo="to-blue-600"
              icon={Shield}
            />
          </div>
        </div>

        {/* Enhanced info section */}
        <div className="animate-fade-in-up delay-600">
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-3xl p-8 md:p-12 border-2 transition-all duration-500 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10" style={{ borderColor: "#1E293B" }}>
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-2 shadow-xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="font-leagueSpartan text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  What are vaults?
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50" />
                </h2>
                <p className="text-slate-300 text-lg md:text-xl leading-relaxed mb-8">
                  Vaults are sophisticated managed investment baskets with clearly defined strategies and risk parameters. Hyperliquid specializes in perpetuals strategies for derivatives trading, while Enzyme enables comprehensive on-chain asset management for spot trading strategies. Select the product that best aligns with your risk tolerance and investment objectives.
                </p>
                <div className="flex flex-wrap gap-3 mt-6">
                  {['DeFi', 'Perpetuals', 'Asset Management', 'On-chain', 'Real-time Analytics'].map((tag, index) => (
                    <span
                      key={tag}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-900/50 to-slate-800/50 text-blue-200 text-sm font-semibold border border-blue-500/30 backdrop-blur-sm hover:border-blue-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {tag}
                    </span>
                  ))}
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
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
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