// app/api/save-wallet/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, walletAddress } = body;

    if (!username || !walletAddress) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await dbConnect();

    await client.connect();
    const database = client.db("ctxbt-signal-flow");
    const ctxbtTweetsCollection = database.collection("ctxbt_tweets");
    const influencersCollection = database.collection("influencers");

    // First, check if the user exists in the influencers collection (which is used by the metrics component)
    const influencer = await influencersCollection.findOne({
      twitterHandle: username,
    });

    let userId;

    // Update or create influencer record with wallet address
    if (influencer) {
      await influencersCollection.updateOne(
        { twitterHandle: username },
        { $set: { walletAddress, updatedAt: new Date() } }
      );
      userId = influencer._id.toString();
      console.log("Updated influencer wallet address, userId:", userId);
    }

    // Now handle the ctxbt_tweets collection (original functionality)
    const existingUser = await ctxbtTweetsCollection.findOne({
      twitterHandle: username,
    });

    if (existingUser) {
      const twitterHandle = existingUser.twitterHandle;
      let creditAmount = existingUser.creditAmount || 0;
      let creditExpiry = existingUser.creditExpiry;
      const currentDate = new Date();
      const tweetsCount = (existingUser.tweets || []).length;

      // Fetch active subscribers with valid expiryDate from user_subscriptions collection
      const activeSubscribers = await Promise.all(
        (existingUser.subscribers || []).map(async (subscriber: any) => {
          // Find the subscription document for this subscriber (e.g., telegramId: "meet4436")
          const subscriptionDoc = await database
            .collection("users")
            .findOne({ telegramId: subscriber });
          if (subscriptionDoc) {
            // Find the subscribed account matching existingUser.twitterHandle
            const subscribedAccount = subscriptionDoc.subscribedAccounts.find(
              (account: { twitterHandle: any }) =>
                account.twitterHandle === twitterHandle
            );
            // Check if the subscription exists and expiryDate is valid
            if (
              subscribedAccount &&
              new Date(subscribedAccount.expiryDate) > currentDate
            ) {
              return subscriber; // Subscriber is active
            }
          }
          return null; // Subscriber is inactive or not found
        })
      );

      // Filter out inactive subscribers (null values)
      const validActiveSubscribers = activeSubscribers.filter(
        (sub) => sub !== null
      );
      let subscriberCount = validActiveSubscribers.length;


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
