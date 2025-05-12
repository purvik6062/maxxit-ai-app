"use client";
import React, { useState } from "react";
import { User, Wallet, Copy, Check } from "lucide-react";
import type { UserProfile } from "./types";
import { useSession } from "next-auth/react";
import { FaTelegramPlane } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useCredits } from "@/context/CreditsContext";
import Image from "next/image";

interface ProfileHeaderProps {
  profile: UserProfile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const [copied, setCopied] = useState(false);
  const { data: session } = useSession();
  const { credits } = useCredits();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const containerBorderStyle: React.CSSProperties = {
    border: "1px solid #818791",
  };

  const avatarBorderStyle: React.CSSProperties = {
    border: "1px solid #b5bfd4",
  };

  const fieldBorderStyle: React.CSSProperties = {
    border: "1px solid #253552",
  };

  return (
    <div
      className="bg-[#0b1016] p-4 md:p-6 mb-6 h-fit rounded-2xl shadow-xl"
      style={containerBorderStyle}
    >
      <div className="flex flex-col items-center space-y-4 md:space-y-6">
        {/* Avatar container */}
        <div
          className="bg-[#1a1f29] p-3 md:p-4 rounded-md"
          style={avatarBorderStyle}
        >
          {/* <User className="w-8 h-8 md:w-10 md:h-10 text-[#a4b8d3]" /> */}
          <Image
            src={
              session.user?.image.replace(
                /_normal(?=\.(jpg|jpeg|png|gif|webp))/i,
                ""
              ) || "/default-avatar.png"
            }
            alt="User Avatar"
            width={80}
            height={80}
            className="rounded-md"
          />
        </div>

        {/* Telegram ID */}
        <div className="w-full">
          <label className="text-sm font-medium text-[#8ba1bc] mb-1 block">
            Telegram ID
          </label>
          <div
            className="bg-[#131923] p-2 md:p-3 rounded-md text-white text-sm md:text-base"
            style={fieldBorderStyle}
          >
            @{profile.telegramId || "username1234"}
          </div>
        </div>

        {/* Wallet */}
        <div className="w-full">
          <label className="text-sm font-medium text-[#8ba1bc] mb-1 block">
            User Name
          </label>
          <div
            className="flex items-center bg-[#131923] p-2 md:p-3 rounded-md text-white text-sm md:text-base"
            style={fieldBorderStyle}
          >
            <div className="truncate flex-1">{session?.user?.username}</div>
            {/* <button
              onClick={() => handleCopy(session?.user?.username)}
              className="text-[#5f84b9] hover:text-[#7aa3e3] ml-2"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button> */}
          </div>
        </div>

        {/* Credit */}
        <div className="w-full">
          <label className="text-sm font-medium text-[#8ba1bc] mb-1 block">
            Credit
          </label>
          <div
            className="bg-[#131923] p-2 md:p-3 rounded-md text-white text-sm md:text-base"
            style={fieldBorderStyle}
          >
            {credits !== null ? credits : profile.credits}
          </div>
        </div>
      </div>
    </div>
  );
}
