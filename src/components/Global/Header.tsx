"use client";
import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

const Header = ({ networkName, setActiveComponent }: any) => {
  const [userDetails, setUserDetails] = useState({});
  const [userMembership, setUserMembership] = useState<any>();
  const [view, setView] = useState("overview");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const userMembership = localStorage.getItem("USER_MEMBERSHIP") || "";

    setUserMembership(userMembership);
    setUserDetails(user);
  }, []);

  return (
    <div className="techwave_fn_header">
      <div className="flex w-full justify-between items-center border border-gray-700">
        <nav>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold">AI</h1>
                <div className="ml-5 flex">
                  {[
                    "Predictions",
                    "Leaderboard",
                    "Analytics",
                    "AI Insights",
                  ].map((item) => (
                    <button
                      key={item}
                      onClick={() => setView(item.toLowerCase())}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        view === item.toLowerCase()
                          ? "bg-gray-700 text-white"
                          : "text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center">
                <div className="relative mx-4">
                  <input
                    type="text"
                    placeholder="Search predictions..."
                    className="w-12 px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                  />
                  <Search className="absolute right-3 top-2.5 text-gray-400 w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex items-center">
          <ConnectButton />
        </div>
      </div>
    </div>
  );
};

export default Header;
