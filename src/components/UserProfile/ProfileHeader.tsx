import React from "react";
import { User, Wallet } from "lucide-react";
import type { UserProfile } from "./types";
import { useAccount } from "wagmi";
import { FaTelegramPlane } from "react-icons/fa";

interface ProfileHeaderProps {
  profile: UserProfile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const { address } = useAccount();
  return (
    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-lg p-8 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-full">
            <User className="w-12 h-12 text-white" />
          </div>
          <div className="flex space-x-8">
            <div>
              <div className="flex items-center space-x-2">
                <FaTelegramPlane className="w-5 h-5 text-indigo-200" />
                <span className="text-sm font-medium text-indigo-200">
                  Telegram ID
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white">
                @{profile.telegramId}
              </h2>
            </div>
            {profile.walletAddress && (
              <div>
                <div className="flex items-center space-x-2 text-indigo-200">
                  <Wallet className="w-5 h-5" />
                  <span className="font-medium">Wallet</span>
                </div>
                <span className="font-mono text-lg bg-black/20 px-4 py-1 rounded-full text-white">
                  {profile.walletAddress.slice(0, 6)}...
                  {profile.walletAddress.slice(-4)}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="bg-indigo-500/30 px-6 py-3 rounded-xl">
          <div className="text-sm text-indigo-200">Credits</div>
          <div className="text-2xl font-bold text-white">{profile.credits}</div>
        </div>
      </div>
    </div>
  );
}
