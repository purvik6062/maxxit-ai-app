// app/api/add-influencer/route.ts
import { NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";

const SUBSCRIPTION_COST = 30;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, handle, impactFactor, heartbeat, createdAt, walletAddress } =
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
    if (walletAddress) {
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
            // Create new influencer
            await influencersCollection.insertOne(
              {
                twitterHandle: cleanHandle,
                subscribers: [cleanTelegramId],
                tweets: [],
                processedTweetIds: [],
                updatedAt: new Date(),
              },
              { session }
            );
          }

          // 3. Update user document
          await usersCollection.updateOne(
            { walletAddress },
            {
              $inc: { credits: -SUBSCRIPTION_COST },
              $addToSet: { subscribedAccounts: cleanHandle },
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