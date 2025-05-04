"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Bitcoin, AlertCircle } from "lucide-react";
import { createCheckoutSession } from "@/app/actions/stripe";
import { stripePromise } from "@/lib/stripeClient";
import { createPortal } from "react-dom";
import { useSession } from "next-auth/react";
import { useCredits } from "@/context/CreditsContext";
import Link from "next/link";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  planPrice: number;
  planCredits: string;
}

export default function PaymentModal({
  isOpen,
  onClose,
  planName,
  planPrice,
  planCredits,
}: PaymentModalProps) {
  const { data: session } = useSession();
  const { credits, isLoadingCredits } = useCredits();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "credit" | "crypto" | null
  >(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoCodeError, setPromoCodeError] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [finalPrice, setFinalPrice] = useState(planPrice);
  const [mounted, setMounted] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    setFinalPrice(planPrice);
    setDiscountApplied(false);
    setPromoCode("");
    setPromoCodeError("");
  }, [planPrice]);

  const paymentMethods = [
    {
      id: "credit",
      name: "Credit Card",
      icon: <CreditCard className="w-6 h-6 mr-2 text-white" />,
      description: "Instant processing, secure payment",
    },
    {
      id: "crypto",
      name: "Cryptocurrency",
      icon: <Bitcoin className="w-6 h-6 mr-2 text-white" />,
      description: "Anonymous, decentralized payment",
    },
  ];

  if (!isOpen || !mounted) return null;

  const handleApplyPromoCode = async () => {
    try {
      const response = await fetch("/api/validate-promo-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promoCode }),
      });
      const data = await response.json();
      if (data.valid) {
        const { discountPercentage, maxDiscount } = data;
        const discountAmount = Math.min(
          planPrice * (discountPercentage / 100),
          maxDiscount || Infinity
        );
        setFinalPrice(planPrice - discountAmount);
        setDiscountApplied(true);
        setPromoCodeError("");
      } else {
        setPromoCodeError("Invalid or inactive promo code");
        setFinalPrice(planPrice);
        setDiscountApplied(false);
      }
    } catch (error) {
      setPromoCodeError("Error validating promo code");
      setFinalPrice(planPrice);
      setDiscountApplied(false);
    }
  };

  const handleProceed = async () => {
    // Check if the user is logged in
    if (!session?.user?.id) {
      alert("Please log in to proceed with payment.");
      return;
    }

    // Check if user is registered (has completed Telegram authentication)
    if (credits === null && !isLoadingCredits) {
      setShowRegistrationModal(true);
      return;
    }

    if (selectedPaymentMethod === "credit") {
      try {
        const checkoutSession = await createCheckoutSession(
          session.user.id,
          planName,
          finalPrice,
          planCredits,
          promoCode
        );
        const stripe = await stripePromise;
        const { error } = await stripe!.redirectToCheckout({
          sessionId: checkoutSession.id,
        });
        if (error) {
          console.error(error);
        }
      } catch (error) {
        console.error("Error creating checkout session:", error);
      }
    } else if (selectedPaymentMethod === "crypto") {
      console.log("Crypto payment selected for", planName);
    }
  };

  // Registration Required Modal
  if (showRegistrationModal) {
    return createPortal(
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
        onClick={() => setShowRegistrationModal(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl shadow-2xl overflow-hidden border border-amber-500/30 max-w-md w-full mx-4 p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-amber-400" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              Registration Required
            </h2>

            <p className="text-gray-300 mb-6">
              You need to complete your registration before purchasing any
              plans. This includes connecting your Telegram account.
            </p>

            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 mb-6 w-full">
              <h3 className="text-white font-medium mb-2">
                Why is this required?
              </h3>
              <p className="text-gray-400 text-sm">
                Completing registration allows us to:
              </p>
              <ul className="text-gray-400 text-sm list-disc list-inside mt-2">
                <li>Ensure your credits are properly assigned</li>
                <li>Provide important updates about your subscription</li>
                <li>Secure your account and purchases</li>
              </ul>
            </div>

            <div className="flex flex-col w-full gap-3">
              <button
                onClick={() => {
                  setShowRegistrationModal(false);
                  onClose();
                  // Redirect to header's registration flow through custom event
                  const event = new CustomEvent("showOnboarding");
                  window.dispatchEvent(event);
                }}
                className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg font-medium"
              >
                Complete Registration
              </button>

              <button
                onClick={() => setShowRegistrationModal(false)}
                className="w-full px-6 py-3 border border-gray-700 text-gray-300 hover:bg-gray-800 rounded-lg transition-all duration-200 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>,
      document.body
    );
  }

  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl flex flex-col md:flex-row shadow-2xl overflow-hidden border border-gray-800/30 max-w-4xl w-full mx-4 md:mx-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center border-b md:border-b-0 md:border-r border-gray-800/20">
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-[#AAC9FA] to-[#E1EAF9] bg-clip-text text-transparent">
              <h2 className="text-3xl font-bold font-napzerRounded">
                {planName} Plan
              </h2>
            </div>
            <div className="text-5xl font-extrabold text-[#AAC9FA]">
              ${finalPrice}
            </div>
            <div className="text-lg text-gray-300">{planCredits} Credits</div>
            {discountApplied && (
              <p className="text-green-400">
                Promo code applied! Saved ${planPrice - finalPrice}
              </p>
            )}
            <div className="mt-4">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter promo code"
                className="w-full p-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                onClick={handleApplyPromoCode}
                className="mt-2 w-full bg-gradient-to-r from-[#1C2333] to-[#1C2333] text-white py-2 rounded-lg hover:shadow-lg hover:shadow-black-500/30 transition-all duration-200"
              >
                Apply Promo Code
              </button>
              {promoCodeError && (
                <p className="text-red-400 mt-2">{promoCodeError}</p>
              )}
            </div>
            <p className="text-gray-400 text-sm">
              One-time purchase with no recurring fees.
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <h3 className="text-2xl font-bold mb-6 text-center text-[#E1EAF9] font-napzerRounded">
            Choose Payment Method
          </h3>
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <motion.button
                key={method.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: method.id === "credit" ? 0 : 0.1 }}
                className={`w-full flex items-center p-4 rounded-lg border transition-all ${
                  selectedPaymentMethod === method.id
                    ? "border-cyan-500 bg-gray-800/50 shadow-md shadow-cyan-500/20"
                    : "border-gray-700 hover:border-cyan-800 hover:bg-gray-800/30"
                }`}
                onClick={() =>
                  setSelectedPaymentMethod(method.id as "credit" | "crypto")
                }
              >
                {method.icon}
                <div className="text-left">
                  <div className="font-semibold text-white">{method.name}</div>
                  <div className="text-sm text-gray-400">
                    {method.description}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
          {credits === null && !isLoadingCredits && (
            <div className="mt-6 p-3 rounded-lg bg-amber-900/20 border border-amber-800/40">
              <p className="text-amber-300 text-sm flex items-start">
                <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                Registration required before purchasing
              </p>
            </div>
          )}
          {selectedPaymentMethod && (
            <div className="mt-6">
              {selectedPaymentMethod === "credit" && (
                <div className="mb-4 p-3 rounded-lg bg-gray-800/50 border border-blue-900/50">
                  <p className="text-blue-400 font-medium text-sm">
                    💳 Secure payment processing via Stripe
                  </p>
                </div>
              )}
              {selectedPaymentMethod === "crypto" && (
                <div className="mb-4 p-3 rounded-lg bg-gray-800/50 border border-green-900/50">
                  <p className="text-green-400 font-medium text-sm">
                    🔒 Pay securely with crypto
                  </p>
                </div>
              )}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full bg-gradient-to-r from-[#1C2333] to-[#1C2333] text-white py-3 rounded-3xl hover:shadow-lg hover:shadow-black-500/30 transition-all duration-200 font-medium"
                onClick={handleProceed}
              >
                Proceed to Payment
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(modalContent, document.body);
}
