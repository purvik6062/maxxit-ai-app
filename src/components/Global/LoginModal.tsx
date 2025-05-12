"use client";
import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import { signIn } from "next-auth/react";
import { toast } from "react-toastify";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  callbackUrl?: string;
  message?: string;
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  callbackUrl = "/",
  message = "Please login to continue",
}) => {
  if (!isOpen) return null;

  const handleLogin = () => {
    signIn("twitter", { callbackUrl }).catch(() => {
      toast.error("Failed to login. Please try again.", {
        position: "top-center",
        autoClose: 3000,
      });
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-leagueSpartan">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="relative z-50 w-full max-w-md overflow-hidden rounded-xl bg-gradient-to-b from-gray-900 to-[#070915] p-6 shadow-2xl border border-blue-500/30"
      >
        {/* Close button */}
        <div className="absolute top-2 right-2">
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-gray-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <img src="/img/maxxit_logo.svg" alt="Maxxit" className="h-8 mr-2" />
            <div className="text-2xl font-napzerRounded bg-gradient-to-b from-[#AAC9FA] to-[#E1EAF9] bg-clip-text text-transparent">
              maxxit
            </div>
          </div>

          <h2 className="text-xl font-semibold text-white mb-4">{message}</h2>

          <button
            onClick={handleLogin}
            className="group relative w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white font-semibold shadow-lg transition-all duration-300 hover:shadow-blue-500/50 hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <FaXTwitter size={20} />
            Login with X
            <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <p className="mt-4 text-sm text-gray-400">
            By logging in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginModal;
