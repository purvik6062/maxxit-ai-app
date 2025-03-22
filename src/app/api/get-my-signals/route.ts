// app/api/get-my-signals/route.ts
import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = "ctxbt-signal-flow";

export async function GET(req: NextRequest) {
  // Verify API key
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const apiKey = authHeader.split(" ")[1];
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);

    // 1. Verify API key and get wallet address
    const apiKeyCollection = db.collection("api-keys");
    const keyData = await apiKeyCollection.findOne({
      apiKey,
      expiresAt: { $gt: new Date() },
    });

    if (!keyData) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired API key" },
        { status: 401 }
      );
    }

    // 2. Get user document
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({
      walletAddress: keyData.walletAddress,
    });

    if (!user || !user.telegramId) {
      return NextResponse.json(
        { success: false, error: "User not found or missing Telegram ID" },
        { status: 404 }
      );
    }

    // 3. Get subscribed twitter handles
    const subscribedHandles = user.subscribedAccounts.map(
      (acc: { twitterHandle: any }) => acc.twitterHandle
    );

    // 4. Get trading signals
    const signalsCollection = db.collection("trading-signals");
    const signals = await signalsCollection
      .find({
        twitterHandle: { $in: subscribedHandles },
        subscribers: user.telegramId,
      })
      .project({
        subscribers: 0,
        messageSent: 0,
        tweet_link: 0,
        generatedAt: 0,
        tweet_id: 0,
        twitterHandle: 0,
        _id: 0,
      })
      .sort({ "signal_data.tweet_timestamp": -1 })
      .toArray();

    // Transform the data
    const transformedSignals = signals.map((signal) => ({
      ...signal,
      signal_data: {
        ...signal.signal_data,
        tweet_timestamp: new Date(
          signal.signal_data.tweet_timestamp
        ).toISOString(),
      },
    }));

    return NextResponse.json({
      success: true,
      count: transformedSignals.length,
      data: transformedSignals,
    });
  } catch (error) {
    console.error("Error fetching signals:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
