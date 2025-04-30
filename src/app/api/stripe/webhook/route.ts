// src/app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import dbConnect from "src/utils/dbConnect";
import { addCredits } from "src/utils/addCredits";
import { ObjectId } from "mongodb";

// Add EarningRecord interface definition
interface EarningRecord {
  transactionId: ObjectId;
  amount: number;
  source: string;
  description: string;
  timestamp: Date;
  purchaseId: string; // Assuming session.id is a string
  promoCode: string; // Assuming promoCode is a string
  buyerTwitterId: string; // Assuming twitterId is a string
}

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
    const { twitterId, credits, promoCode } = session.metadata; // Use twitterId from metadata
    const planPrice = session.amount_total / 100; // Convert cents to dollars
    const client = await dbConnect();
    const db = client.db("ctxbt-signal-flow");

    try {
      // Validate required metadata
      if (!twitterId || !credits) {
        throw new Error("Missing twitterId or credits in session metadata");
      }

      // Find the user by twitterId
      const user = await db.collection("users").findOne({ twitterId });
      if (!user) {
        throw new Error("User not found");
      }

      // Handle promo code if provided
      if (promoCode) {
        const promoCodeDoc = await db.collection("promoCodes").findOne({
          promoCode,
          isActive: true,
        });

        if (promoCodeDoc) {
          const purchaseId = session.id;
          await db.collection("promoCodeUsages").insertOne({
            promoCodeId: promoCodeDoc._id,
            promoCode: promoCode,
            buyerTwitterId: twitterId,
            purchaseId,
            appliedAt: new Date(),
          });

          const incentive = planPrice * 0.1; // 10% incentive
          const influencerId = promoCodeDoc.influencerId;

          // Find influencer by ObjectId and get their twitterId
          const influencer = await db
            .collection("users")
            .findOne({ _id: influencerId });
          if (influencer) {
            await addCredits(
              influencer.twitterId, // Use influencer's twitterId
              incentive,
              "PROMO_CODE_INCENTIVE",
              `Incentive from promo code ${promoCode} for purchase ${purchaseId}`
            );

            // Update influencer earnings with detailed record
            const earningRecord: EarningRecord = {
              transactionId: new ObjectId(), // Unique ID for the transaction
              amount: incentive,
              source: "PROMO_CODE_INCENTIVE",
              description: `Incentive from promo code ${promoCode} for purchase ${purchaseId}`,
              timestamp: new Date(),
              purchaseId: session.id,
              promoCode: promoCode,
              buyerTwitterId: twitterId,
            };

            await db.collection("influencerEarnings").updateOne(
              { influencerId: influencerId },
              {
                $inc: {
                  totalEarnings: incentive,
                  availableEarnings: incentive,
                },
                $push: {
                  earningsHistory: earningRecord,
                } as any,
              },
              { upsert: true }
            );
          }
        }
      }

      // Add purchased credits to user's account
      const creditsAmount = parseInt(credits, 10);
      if (isNaN(creditsAmount) || creditsAmount <= 0) {
        throw new Error("Invalid credits amount in metadata");
      }

      await addCredits(
        twitterId,
        creditsAmount,
        "PLAN_PURCHASE",
        `Purchased ${credits} credits for $${planPrice}`
      );

      return NextResponse.json({ received: true });
    } catch (error) {
      console.error("Webhook processing error:", error);
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : "Processing error",
        },
        { status: 500 }
      );
    } finally {
      await client.close();
    }
  }

  return NextResponse.json({ received: true });
}
