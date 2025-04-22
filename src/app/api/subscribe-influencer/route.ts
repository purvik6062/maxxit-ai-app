import { NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";
import { MongoClient } from "mongodb";

// Define a base cost that will be multiplied by the impact factor
const BASE_SUBSCRIPTION_COST = 10;
// Default impact factor if none is found
const DEFAULT_IMPACT_FACTOR = 1;

export async function POST(request: Request): Promise<Response> {
  let client: MongoClient;
  try {
    const { twitterId, influencerHandle, subscriptionFee } = await request.json();

    // Remove @ from the handle if it exists
    const cleanHandle = influencerHandle.replace("@", "");

    if (!twitterId || !cleanHandle) {
      return NextResponse.json(
        { success: false, error: { message: "Missing required fields" } },
        { status: 400 }
      );
    }

    if (subscriptionFee === undefined || subscriptionFee === null) {
      return NextResponse.json(
        { success: false, error: { message: "Subscription fee not provided" } },
        { status: 400 }
      );
    }

    client = await dbConnect();
    const db = client.db("ctxbt-signal-flow");
    const usersCollection = db.collection("users");
    const influencersCollection = db.collection("influencers");
    const transactionsCollection = db.collection("transactions");

    // Start a session for transaction
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        // 1. Check and update user's credits
        const user = await usersCollection.findOne({ twitterId });

        if (!user) {
          throw new Error(
            "Register yourself first to receive 500 free credits!"
          );
        }

        // 2. Check if user has enough credits for the subscription fee
        if (user.credits < subscriptionFee) {
          throw new Error(`Insufficient credits. This subscription requires ${subscriptionFee} credits.`);
        }

        // Get user's telegram ID and clean it (remove @ if exists)
        const cleanTelegramId = user.telegramId.replace("@", "");

        // Check if user is already subscribed (case-insensitive)
        if (
          user.subscribedAccounts?.some((account: { twitterHandle: string }) =>
            new RegExp(`^${cleanHandle}$`, "i").test(account.twitterHandle)
          )
        ) {
          throw new Error("Already subscribed to this influencer");
        }

        // 3. Update or create influencer
        const existingInfluencer = await influencersCollection.findOne({
          twitterHandle: cleanHandle,
        });

        if (existingInfluencer) {
          // Update existing influencer
          await influencersCollection.updateOne(
            { twitterHandle: cleanHandle },
            {
              $set: { updatedAt: new Date() },
              $addToSet: { subscribers: cleanTelegramId },
            },
            { session }
          );
        } else {
          // Create new influencer with default impact factor
          await influencersCollection.insertOne(
            {
              twitterHandle: cleanHandle,
              subscribers: [cleanTelegramId],
              tweets: [],
              processedTweetIds: [],
              updatedAt: new Date(),
              impactFactor: DEFAULT_IMPACT_FACTOR, // Set a default impact factor for new influencers
            },
            { session }
          );
        }

        // 4. Update user document
        const subscriptionDate = new Date();
        const expiryDate = new Date(subscriptionDate);
        expiryDate.setMonth(expiryDate.getMonth() + 1); // Add one month to the subscription date

        await usersCollection.updateOne(
          { twitterId },
          {
            $inc: { credits: -subscriptionFee },
            $addToSet: {
              subscribedAccounts: {
                twitterHandle: cleanHandle,
                subscriptionDate: subscriptionDate,
                expiryDate: expiryDate,
                costPaid: subscriptionFee,
              },
            },
            $set: { updatedAt: new Date() },
          },
          { session }
        );
        
        // 5. Log the subscription transaction
        await transactionsCollection.insertOne({
          userId: user._id,
          twitterId: user.twitterId,
          twitterUsername: user.twitterUsername,
          type: "SUBSCRIPTION",
          amount: -subscriptionFee,
          influencerHandle: cleanHandle,
          impactFactor: existingInfluencer?.impactFactor || DEFAULT_IMPACT_FACTOR,
          description: `Subscription to influencer @${cleanHandle} (Impact Factor: ${existingInfluencer?.impactFactor || DEFAULT_IMPACT_FACTOR})`,
          expiryDate: expiryDate,
          timestamp: subscriptionDate
        }, { session });
      });

      return NextResponse.json({
        success: true,
        message: "Successfully subscribed to influencer",
      });
    } finally {
      await session.endSession();
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}