"use client";

import { useState } from "react";
import PricingCard from "./PricingCard";

export default function PricingSection() {
  const pricingPlans = [
    {
      name: "Free",
      price: 0,
      description: "",
      features: [
        { name: "Upto 200 Credits Every Month", included: true },
        { name: "Access to all basic features", included: true },
        { name: "Email support", included: true },
        { name: "7-day history", included: true },
        { name: "API access", included: true },
      ],
      ctaText: "Get Started",
      popular: false,
    },
    {
      name: "BASIC",
      price: 20,
      description: "Perfect for occasional users",
      features: [
        { name: "1000 Credits", included: true },
        { name: "Access to all basic features", included: true },
        { name: "Email support", included: true },
        { name: "7-day history", included: true },
        { name: "API access", included: true },
        { name: "Priority support", included: false },
      ],
      ctaText: "Get Started",
      popular: false,
    },
    {
      name: "STANDARD",
      price: 50,
      description: "Great for regular users and small teams",
      features: [
        { name: "5000 Credits", included: true },
        { name: "Access to all features", included: true },
        { name: "Email support", included: true },
        { name: "30-day history", included: true },
        { name: "Priority support", included: true },
        { name: "API access", included: true },
      ],
      ctaText: "Get Started",
      popular: false,
    },
    {
      name: "Premium",
      price: 100,
      description: "For power users and large organizations",
      features: [
        { name: "15000 Credits", included: true },
        { name: "Access to all features", included: true },
        { name: "Priority email support", included: true },
        { name: "24/7 Priority support", included: true },
        { name: "Full API access", included: true },
      ],
      ctaText: "Get Started",
      popular: true,
    },
  ];

  return (
    <section className="py-20 px-6 bg-[#020617]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-base">
            Choose the plan that works for your needs. One-time payment, no
            recurring fees.
          </p>
        </div>

        <div className="p-[1px] bg-gradient-to-r from-cyan-900 to-blue-900 rounded-xl mb-16">
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/60 backdrop-blur-sm rounded-lg border border-gray-800/30 shadow-xl overflow-hidden">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {pricingPlans.map((plan) => (
                  <PricingCard
                    key={plan.name}
                    name={plan.name}
                    price={plan.price}
                    description={plan.description}
                    features={plan.features}
                    ctaText={plan.ctaText}
                    popular={plan.popular}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 p-[1px] bg-gradient-to-r from-cyan-900 to-blue-900 rounded-xl">
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/60 backdrop-blur-sm rounded-lg border border-gray-800/30 shadow-xl overflow-hidden">
            <div className="p-8">
              <h3 className="text-xl font-bold text-white mb-4">
                How Credits Work
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-300">
                <div>
                  <h4 className="font-medium text-white mb-2">Flexible Usage</h4>
                  <p>
                    Credits can be used across all features. Use them how you want,
                    when you want.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-2">
                    One Month Validity
                  </h4>
                  <p>
                    Your purchased credits are valid for one month from the date of
                    purchase. Unused credits will expire after the validity period.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-2">Volume Discounts</h4>
                  <p>
                    Need more credits? Contact us for custom pricing on bulk
                    purchases.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-gray-400 text-sm">
          <p>One-time purchase with no recurring fees.</p>
          <p className="mt-2">
            Need a custom plan?{" "}
            <a href="#" className="text-blue-400 underline font-medium hover:text-blue-300">
              Contact us
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
