import { NextRequest, NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";
import { addCredits } from "@/utils/addCredits";
import { ObjectId } from "mongodb";

interface EarningRecord {
  transactionId: ObjectId;
  amount: number;
  source: string;
  description: string;
  timestamp: Date;
  purchaseId: string; // This will be the crypto transactionHash
  promoCode: string;
  buyerTwitterId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId, // This is the buyer's twitterId
      planName,
      planPrice,
      planCredits,
      transactionHash,
      promoCode,
    } = body;

    // Validate required fields
    if (
      !userId ||
      !planName ||
      !planPrice ||
      !planCredits ||
      !transactionHash
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Connect to database
    const client = await dbConnect();
    // The connect() method is often called by dbConnect itself or managed by the driver.
    // Explicitly calling await client.connect() might be redundant or even cause issues
    // if dbConnect already returns a connected client instance or handles connection pooling.
    // Assuming dbConnect returns a promise that resolves to a connected client.
    const database = client.db("ctxbt-signal-flow");

    // Check if transaction already exists to prevent double processing
    const existingTransaction = await database
      .collection("crypto_payments")
      .findOne({ transactionHash });

    if (existingTransaction) {
      return NextResponse.json(
        { error: "Transaction already processed" },
        { status: 409 }
      );
    }

    // Record the crypto payment
    const paymentRecord = {
      userId,
      planName,
      planPrice,
      planCredits,
      transactionHash,
      promoCode: promoCode || null,
      paymentMethod: "cryptocurrency",
      status: "completed",
      createdAt: new Date(),
      processedAt: new Date(),
    };

    await database.collection("crypto_payments").insertOne(paymentRecord);

    // Add credits to user account
    const creditsToAdd = parseInt(planCredits.replace(/[^\d]/g, ""));
    // Ensure addCredits is called correctly. Assuming userId is the twitterId.
    // The addCredits function in stripe webhook takes:
    // twitterId, creditsAmount, "PLAN_PURCHASE", `Purchased ${credits} credits for $${planPrice}`
    // Here, planName can be used as the source if appropriate, and planPrice for description detail.
    await addCredits(
      userId,
      creditsToAdd,
      "PLAN_PURCHASE_CRYPTO", // Differentiating source for clarity
      `Purchased ${planCredits} credits for $${planPrice} via crypto`
    );

    // Handle promo code logic if a promo code was used
    if (promoCode) {
      const promoCodeDoc = await database.collection("promoCodes").findOne({
        promoCode,
        isActive: true,
      });

      if (promoCodeDoc) {
        const purchaseId = transactionHash; // Use transactionHash as the unique purchase identifier

        // Record promo code usage
        await database.collection("promoCodeUsages").insertOne({
          promoCodeId: promoCodeDoc._id,
          promoCode: promoCode,
          buyerTwitterId: userId, // userId from request body is the buyer's twitterId
          purchaseId,
          appliedAt: new Date(),
          paymentMethod: "cryptocurrency", // Added for clarity
        });

        const influencerEarningPercentage =
          promoCodeDoc.influencerEarningPercentage || 10; // Default to 10%
        const incentive = (planPrice * influencerEarningPercentage) / 100;
        const influencerId = promoCodeDoc.influencerId;

        const influencer = await database
          .collection("users")
          .findOne({ _id: influencerId });

        if (influencer) {
          // Add incentive credits to the influencer
          // The addCredits function in stripe webhook for influencer takes:
          // influencer.twitterId, incentive, "PROMO_CODE_INCENTIVE", `Incentive from promo code ${promoCode} for purchase ${purchaseId}`
          await addCredits(
            influencer.twitterId,
            incentive,
            "PROMO_CODE_INCENTIVE_CRYPTO", // Differentiating source
            `Incentive from crypto promo code ${promoCode} for purchase ${purchaseId}`
          );

          // Record influencer earning
          const earningRecord: EarningRecord = {
            transactionId: new ObjectId(), // Generate a new ObjectId for this earning record
            amount: incentive,
            source: "PROMO_CODE_INCENTIVE_CRYPTO",
            description: `Incentive from crypto promo code ${promoCode} for purchase ${purchaseId}`,
            timestamp: new Date(),
            purchaseId: purchaseId,
            promoCode: promoCode,
            buyerTwitterId: userId,
          };

          await database.collection("influencerEarnings").updateOne(
            { influencerId: influencerId },
            {
              $inc: {
                totalEarnings: incentive,
                availableEarnings: incentive,
              },
              $push: {
                earningsHistory: earningRecord,
              } as any, // Cast to any to handle $push type if not perfectly matching
            },
            { upsert: true }
          );
        }
      }
    }

    // Log the successful payment
    console.log(
      `Crypto payment recorded: ${transactionHash} for user ${userId}. Promo: ${
        promoCode || "N/A"
      }`
    );

    // Close the client connection if dbConnect doesn't manage it.
    // await client.close(); // This might be needed depending on dbConnect implementation.

    return NextResponse.json({
      success: true,
      message: "Crypto payment recorded successfully",
      transactionHash,
      creditsAdded: creditsToAdd,
    });
  } catch (error) {
    console.error("Error recording crypto payment:", error);
    // It's good practice to close the client in catch block as well if opened,
    // though it depends on the dbConnect utility.
    // if (client) await client.close();
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
