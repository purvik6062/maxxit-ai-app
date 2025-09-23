"use client";

import { CheckIcon, XIcon, AlertTriangleIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import PaymentModal from "./PaymentModal";
import CryptoPaymentModal from "./CryptoPaymentModal";
import Link from "next/link";
import { useCredits } from "@/context/CreditsContext";
import { useSession } from "next-auth/react";

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
  const [isCryptoModalOpen, setIsCryptoModalOpen] = useState(false);
  const [cryptoModalPrice, setCryptoModalPrice] = useState(price);
  const [isHovered, setIsHovered] = useState(false);
  const { credits, isLoadingCredits } = useCredits();
  const { data: session, status: sessionStatus } = useSession();

  const handleCtaClick = () => {
    setCryptoModalPrice(price);
    setIsPaymentModalOpen(true);
  };

  const handleCryptoPayment = (currentFinalPrice: number) => {
    setIsPaymentModalOpen(false);
    setCryptoModalPrice(currentFinalPrice);
    setIsCryptoModalOpen(true);
  };

  const handleCryptoSuccess = async (transactionHash: string) => {

    try {
      if (session?.user?.id) {
        await fetch("/api/record-crypto-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: session.user.id,
            planName: name,
            planPrice: cryptoModalPrice,
            planCredits:
              name === "Free"
                ? "100"
                : name === "BASIC"
                ? "1000"
                : name === "STANDARD"
                ? "5000"
                : "15000",
            transactionHash,
            promoCode: null,
          }),
        });
      }
    } catch (error) {
      console.error("Error recording crypto payment:", error);
    }

    setIsCryptoModalOpen(false);
  };

  // Determine if registration is needed
  const isRegistrationNeeded =
    session &&
    sessionStatus === "authenticated" &&
    credits === null &&
    !isLoadingCredits;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`relative rounded-3xl overflow-hidden ${
          popular
            ? "border-4 border-cyan-400 border-solid shadow-[0_4px_20px_rgba(6,182,212,0.8)]"
            : ""
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
          className={`h-full flex flex-col bg-[#E1EAF9] rounded-2xl transition-all duration-300 ${
            isHovered ? "shadow-2xl transform -translate-y-1" : "shadow-xl"
          }  ${
            popular
              ? "bg-gradient-to-tr from-[#99BEF7] to-[#E1EAF9] text-white hover:shadow-lg hover:shadow-blue-500/30"
              : "bg-gray-100 text-gray-800 "
          }`}
        >
          <div className="p-8 text-center border-b border-gray-100 ">
            <h3 className="text-gray-500 font-medium text-sm mb-2">{name}</h3>
            <div className="flex items-baseline justify-center">
              <span className="text-4xl font-extrabold text-gray-900">
                ${price}
              </span>
              {name != "Free" && (
                <span className="text-gray-500 ml-1">one-time</span>
              )}
            </div>
            <div className="mt-2 text-sm font-medium text-blue-600">
              {name === "Free"
                ? "Redeem Free Credits"
                : name === "BASIC"
                ? "1000 Credits"
                : name === "STANDARD"
                ? "5000 Credits"
                : "15000 Credits"}
            </div>
            <p className="mt-4 text-gray-600 text-sm h-8">{description}</p>
          </div>

          <div className="p-8 pt-0 relative">
            {/* Registration warning for paid plans */}
            {name !== "Free" && isRegistrationNeeded && (
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded flex items-center">
                <AlertTriangleIcon size={12} className="mr-1" />
                Registration required
              </div>
            )}

            {name === "Free" ? (
              <Link href="/redeem-credits">
                <button className="w-full py-3 px-6 rounded-3xl font-medium transition-all duration-200 bg-gradient-to-r bg-[#1C2333] text-white hover:shadow-lg hover:shadow-black-500/30">
                  Redeem Credits
                </button>
              </Link>
            ) : (
              <button
                onClick={handleCtaClick}
                className={`w-full py-3 px-6 rounded-3xl text-white font-medium transition-all duration-200 !bg-[#1C2333] hover:shadow-black-500/30 ${
                  popular
                    ? "bg-gradient-to-r from-[#1C2333] to-[#1C2333] text-white hover:shadow-lg hover:shadow-blue-500/30"
                    : "bg-gray-100 text-gray-800 "
                }`}
              >
                {ctaText}
              </button>
            )}
          </div>

          <div className="flex-grow p-8">
            <ul className="space-y-4">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  {feature.included ? (
                    <CheckIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  ) : (
                    <XIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
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
        </div>
      </motion.div>
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onCryptoPayment={handleCryptoPayment}
        planName={name}
        planPrice={price}
        planCredits={
          name === "Free"
            ? "100"
            : name === "BASIC"
            ? "1000"
            : name === "STANDARD"
            ? "5000"
            : "15000"
        }
      />
      <CryptoPaymentModal
        isOpen={isCryptoModalOpen}
        onClose={() => setIsCryptoModalOpen(false)}
        onSuccess={handleCryptoSuccess}
        planName={name}
        planPrice={cryptoModalPrice}
        planCredits={
          name === "Free"
            ? "100"
            : name === "BASIC"
            ? "1000"
            : name === "STANDARD"
            ? "5000"
            : "15000"
        }
      />
    </>
  );
}
