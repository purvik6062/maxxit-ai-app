"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Bitcoin } from "lucide-react";
import { createCheckoutSession } from "@/app/actions/stripe";
import { stripePromise } from "@/lib/stripeClient";
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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "credit" | "crypto" | null
  >(null);

  const paymentMethods = [
    {
      id: "credit",
      name: "Credit Card",
      icon: <CreditCard className="w-6 h-6 mr-2 text-black" />,
      description: "Instant processing, secure payment",
    },
    {
      id: "crypto",
      name: "Cryptocurrency",
      icon: <Bitcoin className="w-6 h-6 mr-2 text-black" />,
      description: "Anonymous, decentralized payment",
    },
  ];

  if (!isOpen) return null;

  const handleProceed = async () => {
    if (selectedPaymentMethod === "credit") {
      try {
        const checkoutSession = await createCheckoutSession(
          planName,
          planPrice,
          planCredits
        );
        const stripe = await stripePromise;
        const { error } = await stripe!.redirectToCheckout({
          sessionId: checkoutSession.id,
        });
        if (error) {
          console.error(error);
          // Optionally, set an error state to display to the user
        }
      } catch (error) {
        console.error("Error creating checkout session:", error);
        // Handle error, e.g., show a user-friendly message
      }
    } else if (selectedPaymentMethod === "crypto") {
      // For now, just log it (crypto payment logic can be added later)
      console.log("Crypto payment selected for", planName);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm pt-[100px]"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="bg-white rounded-2xl w-[900px] h-[600px] flex shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Left Side - Purchase Info */}
        <div className="w-1/2 bg-gray-50 p-12 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {!selectedPaymentMethod && (
              <motion.div
                key="plan-info"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h2 className="text-3xl font-bold text-gray-900">
                  {planName} Plan
                </h2>
                <div className="text-5xl font-extrabold text-blue-600">
                  ${planPrice}
                </div>
                <div className="text-lg text-gray-600">
                  {planCredits} Credits
                </div>
                <p className="text-gray-500">
                  One-time purchase with no recurring fees. Credits never
                  expire.
                </p>
              </motion.div>
            )}

            {selectedPaymentMethod === "credit" && (
              <motion.div
                key="credit-info"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-2xl font-bold text-gray-900">
                  Credit Card Payment
                </h3>
                <p className="text-gray-600">
                  Secure payment processing via Stripe. We accept all major
                  credit cards.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-700 font-medium">
                    💳 PCI DSS Compliant
                  </p>
                  <p className="text-sm text-blue-600">
                    Your payment information is encrypted and securely
                    processed.
                  </p>
                </div>
              </motion.div>
            )}

            {selectedPaymentMethod === "crypto" && (
              <motion.div
                key="crypto-info"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-2xl font-bold text-gray-900">
                  Cryptocurrency Payment
                </h3>
                <p className="text-gray-600">
                  Pay securely with Bitcoin, Ethereum, and other major
                  cryptocurrencies.
                </p>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-green-700 font-medium">
                    🔒 Blockchain Verified
                  </p>
                  <p className="text-sm text-green-600">
                    Transactions are processed through our secure crypto payment
                    gateway.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side - Payment Methods */}
        <div className="w-1/2 p-12 flex flex-col justify-center">
          <h3 className="text-2xl font-bold mb-6 text-center text-black">
            Choose Payment Method
          </h3>

          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <motion.button
                key={method.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: method.id === "credit" ? 0 : 0.1 }}
                className={`w-full flex items-center p-4 rounded-lg border-2 transition-all ${
                  selectedPaymentMethod === method.id
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/20"
                }`}
                onClick={() =>
                  setSelectedPaymentMethod(method.id as "credit" | "crypto")
                }
              >
                {method.icon}
                <div className="text-left">
                  <div className="font-semibold text-black">{method.name}</div>
                  <div className="text-sm text-gray-500">
                    {method.description}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {selectedPaymentMethod && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
              onClick={handleProceed}
            >
              Proceed to Payment
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
