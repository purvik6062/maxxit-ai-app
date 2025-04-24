"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="mx-4 mb-4 rounded-2xl bg-cover bg-center flex flex-col justify-end px-4 sm:px-6 bg-footer-background relative z-4 min-h-[160px] sm:min-h-[180px] md:min-h-[200px]">
      <div className="sm:ps-5 sm:block flex justify-center sm:pt-0 pt-8">
        <Image 
          src="/img/maxxit_logo.svg" 
          alt="Logo" 
          width={60} 
          height={60} 
          className="w-16 h-16 md:w-18 md:h-18"
        />
      </div>
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between p-4 space-y-4 sm:space-y-0 sm:space-x-4">
        <span className=" py-2 text-white text-xs sm:text-sm text-center sm:text-left">
          © 2025 | Maxxit. All Rights Reserved.
        </span>
        <div className="flex space-x-4 py-1">
          <Link href="/" className="text-white text-xs sm:text-sm hover:underline">
            Terms of Service
          </Link>
          <Link href="/" className="text-white text-xs sm:text-sm hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;