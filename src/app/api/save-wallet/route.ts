// app/api/save-wallet/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";

export async function POST(request: NextRequest) {
  try {
    const handlerStartMs = Date.now();
    const body = await request.json();
    const { username, walletAddress } = body;

    if (!username || !walletAddress) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const connectStart = Date.now();
    const client = await dbConnect();
    const dbConnectMs = Date.now() - connectStart;
    const database = client.db("ctxbt-signal-flow");
    const ctxbtTweetsCollection = database.collection("ctxbt_tweets");
    const influencersCollection = database.collection("influencers");

    // First, check if the user exists in the influencers collection (which is used by the metrics component)
    const inflStart = Date.now();
    const influencer = await influencersCollection.findOne(
      { twitterHandle: username },
      { projection: { _id: 1, monthlyPayouts: 1 } }
    );
    const inflMs = Date.now() - inflStart;

    let userId;

    // Update or create influencer record with wallet address
    if (influencer) {
      const inflUpdateStart = Date.now();
      await influencersCollection.updateOne(
        { twitterHandle: username },
        { $set: { walletAddress, updatedAt: new Date() } }
      );
      const inflUpdateMs = Date.now() - inflUpdateStart;
      userId = influencer._id.toString();
      console.log("Updated influencer wallet address, userId:", userId);
    }

    // Now handle the ctxbt_tweets collection (original functionality)
    const tweetsStart = Date.now();
    const existingUser = await ctxbtTweetsCollection.findOne(
      { twitterHandle: username },
      { projection: { _id: 1, twitterHandle: 1, creditAmount: 1, creditExpiry: 1, tweets: 1, subscribers: 1 } }
    );
    const tweetsFindMs = Date.now() - tweetsStart;

    if (existingUser) {
      const twitterHandle = existingUser.twitterHandle;
      let creditAmount = existingUser.creditAmount || 0;
      let creditExpiry = existingUser.creditExpiry;
      const currentDate = new Date();
      const tweetsCount = (existingUser.tweets || []).length;

      // Fetch active subscribers with valid expiryDate from user_subscriptions collection
      // Aggregate active subscriber count in DB (faster than N lookups)
      const userHandles = existingUser.subscribers || [];
      const subsAggStart = Date.now();
      const subsAgg = await database.collection("users").aggregate([
        { $match: { telegramId: { $in: userHandles } } },
        {
          $project: {
            hasActive: {
              $gt: [
                {
                  $size: {
                    $filter: {
                      input: { $ifNull: ["$subscribedAccounts", []] },
                      as: "acc",
                      cond: {
                        $and: [
                          { $eq: ["$$acc.twitterHandle", twitterHandle] },
                          { $gt: [ { $toDate: "$$acc.expiryDate" }, currentDate ] },
                        ],
                      },
                    },
                  },
                },
                0,
              ],
            },
          },
        },
        { $match: { hasActive: true } },
        { $count: "activeCount" },
      ]).toArray();
      const subsAggMs = Date.now() - subsAggStart;

      // Filter out inactive subscribers (null values)
      let subscriberCount = subsAgg.length > 0 ? subsAgg[0].activeCount : 0;


      let latestPayoutAmount = 0;

      // Get latest payout information if available
      if (influencer && influencer.monthlyPayouts && influencer.monthlyPayouts.length > 0) {
        const latestPayout = influencer.monthlyPayouts.reduce((latest, current) =>
          new Date(current.updatedAt) > new Date(latest.updatedAt) ? current : latest
        );
        latestPayoutAmount = latestPayout?.payout ?? 0;
      }

      const shouldUpdateCredit =
        tweetsCount > 0 && // Only update if there are tweets
        (!creditExpiry || new Date(creditExpiry) < currentDate);

      if (shouldUpdateCredit) {
        // Calculate new credit amount and set expiry date
        creditAmount = subscriberCount;
        creditExpiry = new Date();
        creditExpiry.setMonth(creditExpiry.getMonth() + 1); // Set expiry to 1 month from now
      }

      const updateStart = Date.now();
      const updateResult = await ctxbtTweetsCollection.updateOne(
        { twitterHandle: username },
        {
          $set: {
            walletAddress,
            ...(shouldUpdateCredit && {
              creditAmount,
              creditExpiry,
            }), // Only update credit-related fields if expiry has passed
            updatedAt: new Date(),
          },
        }
      );
      const updateMs = Date.now() - updateStart;

      const totalMs = Date.now() - handlerStartMs;
      console.log("[save-wallet] updated existing", { dbConnectMs, inflMs, inflUpdateMs: influencer ? undefined : 0, tweetsFindMs, subsAggMs, updateMs, totalMs });

      return NextResponse.json({
        success: true,
        message: "Wallet address saved successfully",
        modifiedCount: updateResult.modifiedCount,
        subscriberCount,
        creditAmount,
        tweetsCount,
        creditExpiry: creditExpiry?.toISOString(),
        latestPayout: latestPayoutAmount,
        userId: userId || existingUser._id.toString(),
      });
    } else {
      const insertStart = Date.now();
      const insertResult = await ctxbtTweetsCollection.insertOne({
        twitterHandle: username,
        walletAddress: walletAddress,
        tweets: [],
        subscribers: [],
        processedTweetIds: [],
        creditAmount: 0,
        creditExpiry: null, // No expiry for new users initially
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const insertMs = Date.now() - insertStart;

      const totalMs = Date.now() - handlerStartMs;
      console.log("[save-wallet] inserted new", { dbConnectMs, inflMs, tweetsFindMs, insertMs, totalMs });

      return NextResponse.json({
        success: true,
        message: "Wallet address saved successfully",
        insertedId: insertResult.insertedId,
        subscriberCount: 0,
        creditAmount: 0,
        tweetsCount: 0,
        creditExpiry: null,
        latestPayout: 0,
        userId: userId || insertResult.insertedId.toString(),
      });
    }
  } catch (error) {
    console.error("Error saving wallet address:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
