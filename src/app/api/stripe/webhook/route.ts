// src/app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import dbConnect from "src/utils/dbConnect";

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature") as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
  } catch (err) {
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { promoCode, credits } = session.metadata;
    const planPrice = session.amount_total / 100; // Convert cents to dollars
    const client = await dbConnect();
    const db = client.db("ctxbt-signal-flow");

    if (promoCode) {
      const promoCodeDoc = await db.collection("promoCodes").findOne({
        promoCode,
        isActive: true,
      });

      if (promoCodeDoc) {
        const purchaseId = session.id; // Use Stripe session ID as purchase ID
        await db.collection("promoCodeUsages").insertOne({
          promoCodeId: promoCodeDoc._id,
          userId: session.customer, // Adjust based on your auth system
          purchaseId,
          appliedAt: new Date(),
        });

        const incentive = planPrice * 0.1; // 10% incentive
        // await addCredits(promoCodeDoc.influencerId, incentive); // commenting out to avoid adding credits directly for now
        const influencerId = promoCodeDoc.influencerId;

        // Update influencer earnings
        await db.collection("influencerEarnings").updateOne(
          { influencerId: influencerId },
          {
            $inc: {
              totalEarnings: incentive,
              availableEarnings: incentive,
            },
          },
          { upsert: true }
        );
      }
    }

    // Additional purchase processing logic here (e.g., credit assignment)
  }

  return NextResponse.json({ received: true });
}

async function addCredits(userId: string, amount: number) {
  const client = await dbConnect();
  const db = client.db("ctxbt-signal-flow");
  const creditedAt = new Date();
  const batch = {
    userId,
    source: "PROMO_CODE_INCENTIVE",
    amount,
    remaining: amount,
    creditedAt,
    expiresAt: new Date(creditedAt.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
    isExpired: false,
  };
  const result = await db.collection("creditBatches").insertOne(batch);
  await db.collection("creditTransactions").insertOne({
    userId,
    batchId: result.insertedId,
    type: "CREDIT",
    amount,
    description: "Promo code incentive",
    createdAt: creditedAt,
  });
}