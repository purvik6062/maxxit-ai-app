"use client";

import React, { useRef } from "react";
import { useState, useEffect } from "react";
import {
  FaRegCopy,
  FaTrophy,
  FaStar,
  FaArrowUp,
  FaArrowDown,
  FaCrown,
} from "react-icons/fa";
import { LuWandSparkles } from "react-icons/lu";
import StarGrid from "./StarGrid";
import { Footer } from "../index";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const cryptoAgents = [
  {
    id: 1,
    handle: "@aixbt_agent",
    name: "aiXBT",
    impactFactor: 85,
  },
  {
    id: 2,
    handle: "@100trillionUSD",
    name: "PlanB",
    impactFactor: 75,
  },
  {
    id: 3,
    handle: "@woonomic",
    name: "Willy Woo",
    impactFactor: 80,
  },
  {
    id: 4,
    handle: "@rektcapital",
    name: "Rekt Capital",
    impactFactor: 70,
  },
  {
    id: 5,
    handle: "@CryptoKaleo",
    name: "Kaleo",
    impactFactor: 85,
  },
  {
    id: 6,
    handle: "@vadertrader",
    name: "Vader",
    impactFactor: 65,
  },
  {
    id: 7,
    handle: "@Pentosh1",
    name: "Pentoshi",
    impactFactor: 75,
  },
  {
    id: 8,
    handle: "@CryptoDonAlt",
    name: "DonAlt",
    impactFactor: 70,
  },
  {
    id: 9,
    handle: "@AltcoinPsycho",
    name: "Altcoin Psycho",
    impactFactor: 60,
  },
  {
    id: 10,
    handle: "@CryptoMessiah",
    name: "Crypto Messiah",
    impactFactor: 50,
  
  },
];

const HeartbeatDashboard = () => {
  const container = useRef(null);
  gsap.registerPlugin(useGSAP);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isModalOpen]);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

      tl.fromTo(
        ".rankings-card",
        {
          y: 40,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
        }
      );
    },
    { scope: container }
  );

  return (
    <div className="techwave_fn_content">
      <div
        className="relative min-h-screen"
        ref={container}
      >
        <StarGrid />
        <div className="mx-auto py-16">
          <div className="relative p-[2rem]">
            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -left-1/4 top-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"></div>
              <div className="absolute -right-1/4 bottom-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"></div>
            </div>

            <div className="relative space-y-6">
              <div className="text-center mb-16 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-blue-500/20 rounded-full blur-3xl"></div>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/15 backdrop-blur-sm mb-6">
                  <span className="animate-pulse text-3xl"><LuWandSparkles size={25} color="white" /></span>
                  <span className="text-base font-medium text-blue-400">
                    Impact Leaderboard
                  </span>
                </div>

                <h1 className="relative text-3xl md:text-4xl font-bold mb-6">
                  <span className="">🌟</span>
                  <span className="bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent">
                    Impact Factor Rankings
                  </span>
                  <span className="">📊</span>
                </h1>

                <div className="flex flex-col items-center gap-4">
                  <p className="text-xl text-slate-300/90 max-w-2xl">
                    Discover the Pulse of Crypto Markets through our Elite
                    Analysts
                  </p>
                  <div className="flex items-center gap-2 text-white">
                    <span>🎯 Precision</span>
                    <span className="text-slate-300">•</span>
                    <span>🚀 Performance</span>
                    <span className="text-slate-300">•</span>
                    <span>💎 Reliability</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                {cryptoAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="rankings-card group relative bg-blue-900/20 backdrop-blur-sm border border-blue-500/20 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-500/40"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-green-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative p-6 flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center justify-center w-[41px]">
                          {agent.id === 1 && (
                            <FaTrophy className="w-6 h-6 text-yellow-300" />
                          )}
                          {agent.id === 2 && (
                            <FaTrophy className="w-6 h-6 text-gray-400" />
                          )}
                          {agent.id === 3 && (
                            <FaTrophy className="w-6 h-6 text-amber-700" />
                          )}
                          {agent.id > 3 && (
                            <span className="text-2xl font-bold text-slate-400">
                              #{agent.id}
                            </span>
                          )}
                        </div>
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400  flex items-center justify-center text-white font-bold text-lg">
                          {agent.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {agent.name}
                          </h3>
                          <p className="text-slate-400">{agent.handle}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-8">
                        <div className="text-right">
                          <div className="text-sm text-slate-400">
                            Impact Factor
                          </div>
                          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
                            {agent.impactFactor}
                          </div>
                        </div>
                        <div className="w-32 h-2 bg-white/70 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-400 to-gray-500  rounded-full"
                            style={{ width: `${agent.impactFactor}%` }}
                          />
                        </div>
                        <div className="ml-6">
                          <button
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/20 /20 hover:from-blue-500/30 hover:/30 border border-blue-500/30 hover:border-blue-500/50 transition-all duration-300 group"
                            onClick={() => setIsModalOpen(true)}
                          >
                            <FaCrown color="yellow" />
                            <span className="text-sm font-medium text-white group-hover:text-blue-200 transition-colors duration-300">
                              Subscribe Agent
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative z-50 w-full max-w-lg overflow-hidden rounded-xl bg-gray-900 p-6 shadow-2xl">
            <div className="mx-auto flex max-w-sm flex-col items-center">
              <div className="flex items-center mt-6 gap-1">
                <h3 className="bg-gradient-to-r from-blue-400 to-white bg-clip-text text-center text-2xl font-semibold text-transparent">
                  Coming Soon!
                </h3>
                <div>🚀✨</div>
              </div>
              <p className="mt-2 text-center text-gray-300">
                Exciting developments are underway! Our team is working hard to
                bring you cutting-edge AI-powered trading features. Stay tuned
                for updates! 🛠️💡
              </p>
              <button
                onClick={() => setIsModalOpen(false)}
                className="mt-6 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-2 text-sm font-medium text-white hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default HeartbeatDashboard;
