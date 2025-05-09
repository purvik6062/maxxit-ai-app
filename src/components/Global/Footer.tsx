"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaXTwitter } from "react-icons/fa6";
import { FaTelegramPlane } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="mx-4 mb-4 rounded-2xl bg-cover bg-center flex flex-col justify-end px-4 sm:px-6 bg-footer relative z-4 min-h-[160px] sm:min-h-[180px] md:min-h-[200px]">
      <div className="sm:ps-5 sm:block flex justify-center sm:pt-0 pt-8">
        <Image
          src="/img/maxxit_logo.svg"
          alt="Logo"
          width={60}
          height={60}
          className="w-16 h-16 md:w-18 md:h-18"
        />
      </div>
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between px-6 py-4 space-y-4 sm:space-y-0 sm:space-x-4">
        <span className=" py-2 text-white text-xs sm:text-sm text-center sm:text-left">
          © 2025 | Maxxit. All Rights Reserved.
        </span>
        <div className="flex items-center space-x-4 py-1">
          {/* <Link href="/" className="text-white text-xs sm:text-sm hover:underline">
            Terms of Service
          </Link>
          <Link href="/" className="text-white text-xs sm:text-sm hover:underline">
            Privacy Policy
          </Link> */}

          <Link href={"https://x.com/MaxxitAI"} target="_blank" className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 rounded-full p-1 sm:p-2 md:p-3 hover:text-black">
            <FaXTwitter
              className="text-[15px] md:text-[20px] cursor-pointer transition-colors"
              title="Twitter"
            />
          </Link>
          <Link
            href={"https://t.me/+XcOX2uNUxnIzNzFl"}
            target="_blank"
            className="flex items-center bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 gap-2 text-white text-[9px] md:text-sm lg:text-base font-semibold rounded-full px-2 py-1 sm:px-3 sm:py-2 hover:text-black"
          >
            Support
            <FaTelegramPlane
              className="text-[15px] md:text-[20px] bw:text-[20px] cursor-pointer transition-colors"
              title="Telegram"
            />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;