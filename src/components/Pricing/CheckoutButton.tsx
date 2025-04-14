"use client";

import { loadStripe } from "@stripe/stripe-js";
import { createCheckoutSession } from "@/app/actions/stripe";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default async function CheckoutButton({
  planName,
  planPrice,
  planCredits,
}: {
  planName: string;
  planPrice: number;
  planCredits: string;
}) {
  const handleCheckout = async () => {
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
    }
  };

  return (
    <button
      onClick={handleCheckout}
      className="w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg hover:shadow-blue-500/30"
    >
      Get Started
    </button>
  );
}
