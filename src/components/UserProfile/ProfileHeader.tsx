"use client";
import React, { useState } from "react";
import { User, Wallet } from "lucide-react";
import type { UserProfile } from "./types";
import { useSession } from "next-auth/react";
import { FaTelegramPlane } from "react-icons/fa";
import { CopyCheckIcon, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { useCredits } from "@/context/CreditsContext";

interface ProfileHeaderProps {
  profile: UserProfile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const [copied, setCopied] = useState(false);
  const { data: session } = useSession();
  const { credits } = useCredits();
  return (
    <div className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-xl shadow-lg p-8 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-full">
            <User className="w-12 h-12 text-white" />
          </div>
          <div className="flex space-x-8">
            <div>
              <div className="flex items-center space-x-2">
                <FaTelegramPlane className="w-5 h-5 text-indigo-100" />
                <span className="text-sm font-medium text-indigo-100">
                  Telegram ID
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white">
                @{profile.telegramId}
              </h2>
            </div>
            {session?.user?.id && (
              <div>
                <div className="flex items-center space-x-2 text-indigo-100">
                  <Wallet className="w-5 h-5" />
                  <span className="font-medium">Twitter ID</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-lg bg-black/20 px-4 py-1 rounded-full text-white">
                    {session.user.id}
                  </span>
                  {/* Copy to Clipboard Icon */}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(session.user.id);
                      setCopied(true);
                      toast.success("ID copied!");
                      setTimeout(() => setCopied(false), 2000); // Revert icon after 2s
                    }}
                    className="cursor-pointer"
                  >
                    {copied ? (
                      <CheckCircle size={16} color="rgb(38, 250, 84)" />
                    ) : (
                      <CopyCheckIcon size={16} color="#ffffff" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="bg-blue-500/30 px-6 py-3 rounded-xl">
          <div className="text-sm text-indigo-100">Credits</div>
          <div className="text-2xl font-bold text-white">
            {credits !== null ? credits : profile.credits}
          </div>
        </div>
      </div>
    </div>
  );
}
