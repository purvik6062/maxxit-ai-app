"use client";

import { CheckIcon, XIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import PaymentModal from "./PaymentModal";

interface PricingCardProps {
  name: string;
  price: number;
  description: string;
  features: { name: string; included: boolean }[];
  ctaText: string;
  popular: boolean;
}

export default function PricingCard({
  name,
  price,
  description,
  features,
  ctaText,
  popular,
}: PricingCardProps) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCtaClick = () => {
    setIsPaymentModalOpen(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`relative rounded-2xl overflow-hidden ${
          popular ? "md:-mt-4 md:mb-4" : ""
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {popular && (
          <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
            MOST POPULAR
          </div>
        )}

        <div
          className={`h-full flex flex-col bg-white rounded-2xl transition-all duration-300 ${
            isHovered ? "shadow-2xl transform -translate-y-1" : "shadow-xl"
          }`}
        >
          <div className="p-8 text-center border-b border-gray-100">
            <h3 className="text-gray-500 font-medium text-sm mb-2">{name}</h3>
            <div className="flex items-baseline justify-center">
              <span className="text-5xl font-extrabold text-gray-900">
                ${price}
              </span>
              <span className="text-gray-500 ml-1">one-time</span>
            </div>
            <div className="mt-2 text-sm font-medium text-blue-600">
              {name === "BASIC"
                ? "100 Credits"
                : name === "STANDARD"
                ? "500 Credits"
                : "Unlimited Credits"}
            </div>
            <p className="mt-4 text-gray-600 text-sm">{description}</p>
          </div>

          <div className="flex-grow p-8">
            <ul className="space-y-4">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  {feature.included ? (
                    <CheckIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  ) : (
                    <XIcon className="h-5 w-5 text-gray-300 mr-3 flex-shrink-0" />
                  )}
                  <span
                    className={
                      feature.included ? "text-gray-700" : "text-gray-400"
                    }
                  >
                    {feature.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-8 pt-0">
            <button
              onClick={handleCtaClick}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                popular
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg hover:shadow-blue-500/30"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              {ctaText}
            </button>
          </div>
        </div>
      </motion.div>
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        planName={name}
        planPrice={price}
        planCredits={
          name === "BASIC" ? "20" : name === "STANDARD" ? "50" : "Unlimited"
        }
      />
    </>
  );
}
