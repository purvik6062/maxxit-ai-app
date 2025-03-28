"use client";

import { useState } from "react";
import PricingCard from "./PricingCard";

export default function PricingSection() {
  const pricingPlans = [
    {
      name: "BASIC",
      price: 20,
      description: "Perfect for occasional users",
      features: [
        { name: "100 Credits", included: true },
        { name: "Access to all basic features", included: true },
        { name: "Email support", included: true },
        { name: "7-day history", included: true },
        { name: "API access", included: true },
        { name: "Custom exports", included: false },
        { name: "Priority support", included: false },
        { name: "Team collaboration", included: false },
      ],
      ctaText: "Get Started",
      popular: false,
    },
    {
      name: "STANDARD",
      price: 50,
      description: "Great for regular users and small teams",
      features: [
        { name: "500 Credits", included: true },
        { name: "Access to all features", included: true },
        { name: "Email support", included: true },
        { name: "30-day history", included: true },
        // { name: "Custom exports", included: true },
        { name: "Priority support", included: true },
        // { name: "Team collaboration", included: false },
        { name: "API access", included: true },
      ],
      ctaText: "Get Started",
      popular: false,
    },
    {
      name: "UNLIMITED",
      price: 100,
      description: "For power users and large organizations",
      features: [
        { name: "Unlimited Credits", included: true },
        { name: "Access to all features", included: true },
        { name: "Priority email support", included: true },
        // { name: "Unlimited history", included: true },
        // { name: "Custom exports", included: true },
        { name: "24/7 Priority support", included: true },
        // { name: "Team collaboration", included: true },
        { name: "Full API access", included: true },
      ],
      ctaText: "Get Started",
      popular: true,
    },
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-blue-500 to-blue-600 mt-[6.4rem]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Choose the plan that works for your needs. One-time payment, no
            recurring fees.
          </p>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
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

        <div className="mt-16 bg-white/10 rounded-xl p-8 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white mb-4">
            How Credits Work
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-blue-50">
            <div>
              <h4 className="font-medium text-white mb-2">Flexible Usage</h4>
              <p>
                Credits can be used across all features. Use them how you want,
                when you want.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Never Expires</h4>
              <p>
                Your purchased credits don't expire. They remain in your account
                until you use them.
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

        <div className="mt-16 text-center text-blue-100 text-sm">
          <p>One-time purchase with no recurring fees.</p>
          <p className="mt-2">
            Need a custom plan?{" "}
            <a href="#" className="text-white underline font-medium">
              Contact us
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
