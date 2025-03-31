// app/api/add-influencer/route.ts
import { NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";

const SUBSCRIPTION_COST = 30;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, handle, impactFactor, heartbeat, createdAt, walletAddress, sessionUserhandle } =
      body;

    const cleanHandle = handle.replace("@", "");

    // Validate the input
    if (!name || !handle) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Name and handle are required" },
        },
        { status: 400 }
      );
    }

    const client = await dbConnect();
    const db = client.db("ctxbt-signal-flow");
    const usersCollection = db.collection("users");
    const collection = db.collection("influencers_account");
    const influencersCollection = db.collection("influencers");

    // Create new influencer in influencers_account collection
    const newInfluencer = {
      name,
      handle,
      impactFactor,
      heartbeat,
      createdAt: new Date(createdAt),
    };

    await collection.insertOne(newInfluencer);

    // If walletAddress is provided, process subscription
    if (walletAddress && sessionUserhandle === null) {
      // Start a session for transaction
      const session = client.startSession();

      try {
        await session.withTransaction(async () => {
          // 1. Check and update user's credits
          const user = await usersCollection.findOne({ walletAddress });

          // Get user's telegram ID and clean it (remove @ if exists)
          const cleanTelegramId = user?.telegramId.replace("@", "");

          // Check if user is already subscribed
          if (user?.subscribedAccounts?.includes(cleanHandle)) {
            throw new Error("Already subscribed to this influencer");
          }

          // 2. Check if influencer exists
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
            // Generate random metrics with safe number generation
            const publicMetrics = {
              followers_count: Math.floor(Math.random() * 100000), // Random followers between 0-100k
              following_count: Math.floor(Math.random() * 1000), // Random following between 0-1000
              tweet_count: Math.floor(Math.random() * 5000), // Random tweet count between 0-5000
              listed_count: Math.floor(Math.random() * 50), // Random listed count
              like_count: Math.floor(Math.random() * 10000), // Random likes
              media_count: Math.floor(Math.random() * 1000), // Random media count
            };

            // Generate a safe profile image URL with constrained number
            const randomImageId = Math.floor(
              Math.random() * 1000
            ).toString();
            const userProfileUrl = `https://picsum.photos/50/50?random=${randomImageId}`;

            // Create user data object with safe user ID
            const userData = {
              userId: Math.floor(Math.random() * 1000000000000).toString(), // Smaller, safe number
              username: cleanHandle,
              verified: false,
              publicMetrics,
              userProfileUrl,
              mindshare: Number((Math.random() * 1).toFixed(2)), // Random mindshare between 0-1
              herdedVsHidden: Math.floor(Math.random() * 10), // Random herded vs hidden
              convictionVsHype: Math.floor(Math.random() * 20), // Random conviction vs hype
              memeVsInstitutional: Math.floor(Math.random() * 20), // Random meme vs institutional
            };

            await influencersCollection.insertOne(
              {
                twitterHandle: cleanHandle,
                subscribers: [cleanTelegramId],
                tweets: [], // You might want to fetch actual tweets later
                processedTweetIds: [],
                updatedAt: new Date(),
                isProcessing: false,
                lastProcessed: new Date(),
                userData,
              },
              { session }
            );
          }

          // 3. Update user document
          const subscriptionDate = new Date();
          const expiryDate = new Date(subscriptionDate);
          expiryDate.setMonth(expiryDate.getMonth() + 1); // Add one month to the subscription date

          await usersCollection.updateOne(
            { walletAddress },
            {
              $inc: { credits: -SUBSCRIPTION_COST },
              $addToSet: {
                subscribedAccounts: {
                  twitterHandle: cleanHandle,
                  subscriptionDate: subscriptionDate,
                  expiryDate: expiryDate,
                },
              },
              $set: { updatedAt: new Date() },
            },
            { session }
          );
        });

        return NextResponse.json({
          success: true,
          message: "Successfully added influencer",
        });
      } finally {
        await session.endSession();
      }
    }

    return NextResponse.json({
      success: true,
      message: "Successfully added influencer",
      data: newInfluencer,
    });
  } catch (error) {
    console.error("Error adding influencer:", error);

    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to add influencer" },
      },
      { status: 500 }
    );
  }
}
