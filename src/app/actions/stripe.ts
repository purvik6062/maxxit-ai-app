// src/app/actions/stripe.ts
"use server";
import { stripe } from "@/lib/stripe";

export async function createCheckoutSession(
  planName: string,
  price: number,
  credits: string,
  promoCode?: string
) {
  const checkoutSession = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: planName,
          },
          unit_amount: price * 100, // Convert to cents
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
    metadata: {
      credits,
      promoCode: promoCode || "",
    },
  });
  return checkoutSession;
}
